/**
 * THE CANDLEIER — PAYMENT ORCHESTRATION SERVICE
 * Coordinates checkout totals, discount calculations, and Shopify Web Checkout routing.
 */

export class PaymentService {
  /**
   * Calculate checkout totals with discount rules
   */
  static calculateTotals(items = [], couponCode = null, paymentMethod = 'prepaid') {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || item.qty || 1)), 0);
    const totalCount = items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0);

    let discountAmount = 0;
    let discountLabel = '';

    const code = (couponCode || '').trim().toUpperCase();

    if (code === 'SAVE5') {
      discountAmount = Math.round(subtotal * 0.05);
      discountLabel = 'Inaugural Discount (SAVE5 – 5%)';
    } else if (code === 'BUY2') {
      if (totalCount >= 2) {
        discountAmount = Math.round(subtotal * 0.10);
        discountLabel = 'Botanical Duet (BUY2 – 10%)';
      }
    }

    // Prepaid incentive (5% off) if no exclusive single coupon applied
    if (paymentMethod === 'prepaid' && !couponCode) {
      discountAmount = Math.round(subtotal * 0.05);
      discountLabel = 'Prepaid Instant Privilege (5%)';
    }

    const shipping = 0; // Free pan-India delivery on checkout
    const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

    return {
      subtotal,
      discountAmount,
      discountLabel,
      shipping,
      finalTotal,
      currency: 'INR',
      itemCount: totalCount
    };
  }
}

export default PaymentService;
