/**
 * THE CANDLEIER — SHOPIFY PRODUCTS WEBHOOK HANDLER
 * POST /api/webhooks/shopify-products
 * Receives catalog inventory and price changes in real time.
 */

import { Router } from 'express';
import crypto from 'crypto';
import { config } from '../../config/env.js';

const router = Router();

function verifyShopifyHmac(req) {
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  const secret = config.shopify.webhookSecret;

  if (!secret) return true;
  if (!hmacHeader) return false;

  const rawBody = req.rawBody || JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

router.post('/', (req, res) => {
  const topic = req.headers['x-shopify-topic'] || 'products/update';
  const shop = req.headers['x-shopify-shop-domain'];

  if (!verifyShopifyHmac(req)) {
    console.warn('[Webhook] Invalid HMAC signature for topic:', topic);
    return res.status(401).send('Unauthorized webhook signature.');
  }

  const productData = req.body;
  console.log(`[Shopify Webhook] Received [${topic}] for product: "${productData?.title}" (ID: ${productData?.id}) from ${shop}`);

  return res.status(200).json({ received: true, topic, productId: productData?.id });
});

export default router;
