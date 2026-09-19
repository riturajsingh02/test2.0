/**
 * THE CANDLEIER — ORDER MODEL
 * Manages customer order records and tracking status.
 */

import db from '../db/index.js';

export class Order {
  static getByUserId(userId) {
    if (!userId) return [];
    return db.orders.find({ userId });
  }

  static findById(id) {
    return db.orders.findById(id);
  }

  static findByOrderNumber(orderNumber) {
    if (!orderNumber) return null;
    const clean = orderNumber.replace(/^#/, '').toLowerCase().trim();
    return db.orders.findOne(o => {
      const num = String(o.orderNumber || '').replace(/^#/, '').toLowerCase().trim();
      const name = String(o.name || '').replace(/^#/, '').toLowerCase().trim();
      return num === clean || name === clean || o.id === orderNumber;
    });
  }

  static async create(userId, orderData) {
    const orderNumber = orderData.orderNumber || `TC${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = await db.orders.create({
      userId,
      orderNumber,
      name: `#${orderNumber}`,
      processedAt: orderData.processedAt || new Date().toISOString(),
      financialStatus: orderData.financialStatus || 'PAID',
      fulfillmentStatus: orderData.fulfillmentStatus || 'UNFULFILLED',
      currencyCode: orderData.currencyCode || 'INR',
      totalPrice: Number(orderData.totalPrice || 0),
      subtotalPrice: Number(orderData.subtotalPrice || 0),
      totalTax: Number(orderData.totalTax || 0),
      shippingAddress: orderData.shippingAddress || null,
      tracking: orderData.tracking || {
        courier: 'Bluedart Express',
        trackingNumber: `BD${Math.floor(100000000 + Math.random() * 900000000)}`,
        trackingUrl: 'https://www.bluedart.com',
        status: 'Order Confirmed & Packaging'
      },
      lineItems: orderData.lineItems || []
    });

    return newOrder;
  }
}

export default Order;
