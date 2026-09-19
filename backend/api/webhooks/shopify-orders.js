/**
 * THE CANDLEIER — SHOPIFY ORDERS WEBHOOK HANDLER
 * POST /api/webhooks/shopify-orders
 * Handles order creation, updates, cancellations, and fulfillments from Shopify.
 */

import { Router } from 'express';
import crypto from 'crypto';
import { config } from '../../config/env.js';

const router = Router();

function verifyShopifyHmac(req) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  const secret = config.shopify.webhookSecret;

  if (!secret) {
    // If webhook secret not set in development, accept with warning
    return true;
  }

  if (!hmacHeader) return false;

  const rawBody = req.rawBody || JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

router.post('/', (req, res) => {
  const topic = req.headers['x-shopify-topic'] || 'orders/create';
  const shop = req.headers['x-shopify-shop-domain'];

  if (!verifyShopifyHmac(req)) {
    console.warn('[Webhook] Invalid HMAC signature for topic:', topic);
    return res.status(401).send('Unauthorized webhook signature.');
  }

  const orderData = req.body;
  console.log(`[Shopify Webhook] Received [${topic}] for order #${orderData?.order_number || orderData?.id} from ${shop}`);

  // Operational event routing based on topic
  switch (topic) {
    case 'orders/create':
    case 'orders/paid':
      console.log(`[Order Processing] Order ${orderData?.name} is confirmed. Total: ${orderData?.total_price} ${orderData?.currency}`);
      break;

    case 'orders/fulfilled':
    case 'fulfillments/create':
      console.log(`[Fulfillment] Order ${orderData?.name} tracking updated: ${orderData?.tracking_number || 'Dispatched'}`);
      break;

    case 'orders/cancelled':
      console.log(`[Order Processing] Order ${orderData?.name} was cancelled.`);
      break;

    default:
      console.log(`[Shopify Webhook] Processed ${topic}`);
  }

  return res.status(200).json({ received: true, topic, orderId: orderData?.id });
});

export default router;
