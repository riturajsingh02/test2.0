/**
 * THE CANDLEIER — CUSTOMER CONTROLLER
 * Handles customer profile updates, saved addresses, and orders.
 */

import { User } from '../models/User.js';
import { Address } from '../models/Address.js';
import { Order } from '../models/Order.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

export class CustomerController {
  /**
   * GET /api/customer/profile
   */
  static async getProfile(req, res, next) {
    try {
      const addresses = Address.getByUserId(req.user.id);
      const orders = Order.getByUserId(req.user.id);
      const safeUser = User.toSafeObject(req.user, addresses, orders);
      return sendSuccess(res, safeUser);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/customer/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone } = req.body;
      const updatedUser = await User.updateProfile(req.user.id, { firstName, lastName, phone });
      const addresses = Address.getByUserId(req.user.id);
      const orders = Order.getByUserId(req.user.id);
      const safeUser = User.toSafeObject(updatedUser, addresses, orders);

      return sendSuccess(res, safeUser, 'Profile updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/customer/addresses
   */
  static async getAddresses(req, res, next) {
    try {
      const addresses = Address.getByUserId(req.user.id);
      return sendSuccess(res, addresses);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/customer/addresses
   */
  static async addAddress(req, res, next) {
    try {
      const newAddress = await Address.create(req.user.id, req.body);
      const allAddresses = Address.getByUserId(req.user.id);
      return sendSuccess(res, { address: newAddress, addresses: allAddresses }, 'Address added successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/customer/addresses/:id
   */
  static async updateAddress(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await Address.update(id, req.user.id, req.body);
      if (!updated) {
        throw new AppError('Address not found or unauthorized.', 404);
      }
      const allAddresses = Address.getByUserId(req.user.id);
      return sendSuccess(res, { address: updated, addresses: allAddresses }, 'Address updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/customer/addresses/:id
   */
  static async deleteAddress(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await Address.delete(id, req.user.id);
      if (!deleted) {
        throw new AppError('Address not found or unauthorized.', 404);
      }
      const allAddresses = Address.getByUserId(req.user.id);
      return sendSuccess(res, { addresses: allAddresses }, 'Address deleted successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/customer/addresses/:id/default
   */
  static async setDefaultAddress(req, res, next) {
    try {
      const { id } = req.params;
      const success = await Address.setDefault(id, req.user.id);
      if (!success) {
        throw new AppError('Address not found or unauthorized.', 404);
      }
      const allAddresses = Address.getByUserId(req.user.id);
      return sendSuccess(res, { addresses: allAddresses }, 'Default address updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/customer/orders
   */
  static async getOrders(req, res, next) {
    try {
      const orders = Order.getByUserId(req.user.id);
      return sendSuccess(res, orders);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/customer/orders/:id
   */
  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = Order.findById(id) || Order.findByOrderNumber(id);
      if (!order || order.userId !== req.user.id) {
        throw new AppError('Order not found.', 404);
      }
      return sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }
}

export default CustomerController;
