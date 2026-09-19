/**
 * THE CANDLEIER — ORDERS API ROUTE
 * GET /api/orders
 * GET /api/orders/:id
 */

import { Router } from 'express';
import CustomerService from '../services/customer.js';
import OrderService from '../services/order.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

function extractToken(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return req.query.token || null;
}

// GET /api/orders — Fetch customer orders
router.get('/', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return sendError(res, 'Authentication token required.', 401);
    const customer = await CustomerService.getCustomer(token);
    return sendSuccess(res, {
      orders: customer.orders || [],
      count: (customer.orders || []).length
    });
  } catch (err) {
    return sendError(res, err.message, err.statusCode || 500);
  }
});

// GET /api/orders/:id — Fetch single order detail
router.get('/:id', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return sendError(res, 'Authentication token required.', 401);
    const order = await OrderService.getCustomerOrder(token, req.params.id);
    return sendSuccess(res, { order });
  } catch (err) {
    return sendError(res, err.message, err.statusCode || 404);
  }
});

export default router;
