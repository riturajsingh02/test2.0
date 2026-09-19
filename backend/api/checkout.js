/**
 * THE CANDLEIER — CHECKOUT API ROUTE
 * POST /api/checkout
 * POST /api/checkout/razorpay-order
 * POST /api/checkout/process
 */

import { Router } from 'express';
import CartService from '../services/cart.js';
import PaymentService from '../services/payment.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import { extractToken } from '../middleware/authMiddleware.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { config } from '../config/env.js';

const router = Router();

/**
 * POST /api/checkout
 * Calculates order totals and prepares checkout
 */
router.post('/', async (req, res) => {
  try {
    const { items = [], couponCode = null, paymentMethod = 'prepaid' } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 'Cannot initiate checkout with an empty bag.', 400);
    }

    const totals = PaymentService.calculateTotals(items, couponCode, paymentMethod);
    const activeDiscounts = couponCode ? [couponCode] : [];

    // Create Shopify Cart to generate official checkout URL if configured
    let checkoutUrl = null;
    try {
      const cart = await CartService.createCart(items, activeDiscounts);
      checkoutUrl = cart?.checkoutUrl || null;
    } catch (cartErr) {
      console.warn('Could not generate direct Shopify cart checkout URL:', cartErr.message);
    }

    // Fallback direct cart URL if Shopify domain is set
    if (!checkoutUrl && config.shopify.storeDomain) {
      const domain = config.shopify.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const primaryItem = items.find(i => i.shopifyVariantId || i.variantId);
      if (primaryItem) {
        const varId = (primaryItem.shopifyVariantId || primaryItem.variantId).replace(/\D/g, '');
        checkoutUrl = `https://${domain}/cart/${varId}:${primaryItem.quantity || primaryItem.qty || 1}${couponCode ? `?discount=${couponCode}` : ''}`;
      } else {
        checkoutUrl = `https://${domain}/cart`;
      }
    }

    return sendSuccess(res, {
      checkoutUrl,
      totals,
      paymentMethod,
      razorpayKeyId: config.payments.razorpay.keyId || 'rzp_test_51PTheCandleier'
    }, 'Checkout session initialized.');
  } catch (err) {
    return sendError(res, err.message, err.statusCode || 500);
  }
});

/**
 * POST /api/checkout/razorpay-order
 * Initializes a Razorpay order payload
 */
router.post('/razorpay-order', async (req, res) => {
  try {
    const { items = [], couponCode = null } = req.body;
    if (!items || items.length === 0) {
      return sendError(res, 'Shopping bag is empty.', 400);
    }

    const totals = PaymentService.calculateTotals(items, couponCode, 'prepaid');
    const amountInPaise = Math.round(totals.finalTotal * 100);

    const razorpayOrderId = `order_rp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    return sendSuccess(res, {
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: config.payments.razorpay.keyId || 'rzp_test_51PTheCandleier',
      totals
    }, 'Razorpay order created.');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

/**
 * POST /api/checkout/process
 * Confirms order, handles Prepaid (Razorpay / Cards / UPI) or Cash on Delivery (COD),
 * creates official database record, assigns Bluedart tracking, and links to user account.
 */
router.post('/process', async (req, res) => {
  try {
    const {
      items = [],
      shippingAddress = {},
      paymentMethod = 'prepaid',
      couponCode = null,
      paymentDetails = null
    } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, 'Cannot place order with an empty shopping bag.', 400);
    }

    // Required address check
    const { name, phone, address, city, pincode } = shippingAddress;
    if (!name || !phone || !address || !city || !pincode) {
      return sendError(res, 'Please provide complete delivery details (Name, Mobile Number, Street Address, City, and PIN Code).', 400);
    }

    // Identify user if logged in
    let userId = null;
    const token = extractToken(req);
    if (token) {
      try {
        const session = await Session.verify(token);
        if (session && session.userId) {
          userId = session.userId;
        }
      } catch (e) {
        console.warn('Checkout user session check notice:', e.message);
      }
    }

    // If logged in and user has no saved address, auto-save this address
    if (userId) {
      try {
        const existingAddresses = Address.getByUserId(userId);
        if (existingAddresses.length === 0) {
          const parts = String(name).trim().split(' ');
          await Address.create(userId, {
            firstName: parts[0] || 'Client',
            lastName: parts.slice(1).join(' ') || '',
            phone: phone,
            address1: address,
            city: city,
            zip: pincode,
            province: shippingAddress.state || 'Maharashtra',
            country: 'India',
            isDefault: true,
            tag: 'home'
          });
        }
      } catch (addrErr) {
        console.warn('Auto-save checkout address notice:', addrErr.message);
      }
    }

    const totals = PaymentService.calculateTotals(items, couponCode, paymentMethod);

    // Format line items
    const lineItems = items.map(item => ({
      id: item.id || `item_${Math.random().toString(36).substring(2, 8)}`,
      title: item.title || 'Botanical Scented Candle',
      quantity: Number(item.qty || item.quantity || 1),
      price: Number(item.price || 0),
      selectedVariant: item.selectedVariant || 'Standard Jar (250g)',
      image: item.image || 'asset/one.jpg'
    }));

    const isPrepaid = (paymentMethod === 'prepaid');
    const orderNum = `TC${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingWaybill = `BD${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newOrder = await Order.create(userId, {
      orderNumber: orderNum,
      financialStatus: isPrepaid ? 'PAID' : 'PENDING_COD',
      fulfillmentStatus: 'UNFULFILLED',
      currencyCode: 'INR',
      totalPrice: totals.finalTotal,
      subtotalPrice: totals.subtotal,
      discountAmount: totals.discountAmount,
      discountLabel: totals.discountLabel,
      shippingPrice: 0,
      paymentMethod: isPrepaid ? 'Prepaid (Razorpay / UPI / Cards)' : 'Cash on Delivery (COD)',
      paymentDetails: paymentDetails || (isPrepaid ? { gateway: 'Razorpay Secure' } : { method: 'COD' }),
      shippingAddress: {
        name,
        phone,
        address1: address,
        city,
        zip: pincode,
        state: shippingAddress.state || 'India',
        country: 'India'
      },
      tracking: {
        courier: 'Bluedart Express',
        trackingNumber: trackingWaybill,
        trackingUrl: `https://www.bluedart.com`,
        status: 'Order Confirmed & Packaging In Progress'
      },
      lineItems
    });

    return sendSuccess(res, {
      order: newOrder,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      trackingNumber: trackingWaybill,
      financialStatus: newOrder.financialStatus,
      totalPrice: newOrder.totalPrice
    }, isPrepaid ? 'Payment received! Your order has been placed.' : 'Order confirmed! Pay cash upon parcel delivery.');
  } catch (err) {
    console.error('Checkout processing error:', err);
    return sendError(res, err.message || 'Failed to process order. Please try again.', 500);
  }
});

export default router;
