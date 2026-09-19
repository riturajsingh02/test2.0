/* =========================================================
   9. CHECKOUT SYSTEM (PREPAID & COD)
   ========================================================= */
async function populateCheckoutSavedAddresses() {
  const container = document.getElementById('checkoutSavedAddressPicker');
  const custName = document.getElementById('custName');
  const custPhone = document.getElementById('custPhone');
  const custAddress = document.getElementById('custAddress');
  const custCity = document.getElementById('custCity');
  const custPincode = document.getElementById('custPincode');
  const form = document.getElementById('checkoutForm');

  if (!form) return;

  // Check if customer is available
  if (!window.ShopifyService) return;
  try {
    const customer = await window.ShopifyService.getCustomer();
    if (!customer || !customer.addresses || customer.addresses.length === 0) {
      if (container) container.remove();
      return;
    }

    let picker = document.getElementById('checkoutSavedAddressPicker');
    if (!picker) {
      picker = document.createElement('div');
      picker.id = 'checkoutSavedAddressPicker';
      picker.className = 'form-group checkout-address-selector-wrap';
      picker.style.marginBottom = '1.25rem';
      picker.style.padding = '0.75rem 1rem';
      picker.style.background = 'var(--cream-card, #FFFDF8)';
      picker.style.border = '1px solid var(--border-gold, rgba(197, 160, 89, 0.4))';
      picker.style.borderRadius = '8px';

      const label = document.createElement('label');
      label.textContent = 'Deliver to Saved Address';
      label.style.display = 'block';
      label.style.fontFamily = 'var(--font-heading, "Playfair Display", serif)';
      label.style.fontSize = '0.9rem';
      label.style.color = 'var(--cabernet, #2B050B)';
      label.style.fontWeight = '600';
      label.style.marginBottom = '0.4rem';

      const select = document.createElement('select');
      select.id = 'checkoutAddressSelect';
      select.className = 'form-select';
      select.style.width = '100%';
      select.style.padding = '0.6rem 0.75rem';
      select.style.fontSize = '0.85rem';
      select.style.background = '#FFFFFF';
      select.style.border = '1px solid var(--border-subtle, #E6DDD4)';
      select.style.borderRadius = '4px';
      select.style.color = 'var(--cabernet, #2B050B)';

      picker.appendChild(label);
      picker.appendChild(select);
      form.insertBefore(picker, form.firstChild);

      select.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const addr = customer.addresses.find(a => a.id === selectedId);
        if (addr) {
          fillCheckoutFields(addr);
        }
      });
    }

    const select = document.getElementById('checkoutAddressSelect');
    if (select) {
      const defaultAddr = customer.defaultAddress || customer.addresses[0];
      select.innerHTML = customer.addresses.map(a => {
        const isDef = (a.id === defaultAddr?.id);
        const tag = (a.tag || 'Address').toUpperCase();
        return `<option value="${a.id}" ${isDef ? 'selected' : ''}>[${tag}] ${a.firstName} ${a.lastName || ''} – ${a.city}, ${a.zip}${isDef ? ' (Default)' : ''}</option>`;
      }).join('');

      // Auto-fill default address
      if (defaultAddr && (!custName.value || custName.value === '')) {
        fillCheckoutFields(defaultAddr);
      }
    }
  } catch (err) {
    console.warn('Could not populate checkout addresses:', err);
  }

  function fillCheckoutFields(addr) {
    if (custName) custName.value = `${addr.firstName || ''} ${addr.lastName || ''}`.trim();
    if (custPhone) custPhone.value = (addr.phone || '').replace('+91', '').replace(/\s+/g, '').slice(-10);
    if (custAddress) custAddress.value = `${addr.address1 || ''}${addr.address2 ? ', ' + addr.address2 : ''}`.trim();
    if (custCity) custCity.value = addr.city || '';
    if (custPincode) custPincode.value = addr.zip || '';
  }
}

let appliedCouponCode = null;

function renderCheckoutSummary() {
  const summaryList = document.getElementById('checkoutSummaryList');
  const summaryCount = document.getElementById('checkoutSummaryCount');
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (summaryCount) {
    summaryCount.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;
  }

  if (!summaryList) return;

  if (cart.length === 0) {
    summaryList.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Your shopping bag is empty.</p>`;
    return;
  }

  summaryList.innerHTML = cart.map(item => `
    <div class="checkout-summary-item">
      <img src="${item.image}" alt="${item.title}" />
      <div class="checkout-summary-item-info">
        <p class="checkout-summary-item-name">${item.title}</p>
        <p class="checkout-summary-item-sub">${item.selectedVariant || 'Standard'} × ${item.qty}</p>
      </div>
      <div class="checkout-summary-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
    </div>
  `).join('');
}

function calculateCheckoutTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  let discountAmount = 0;
  let discountLabel = '';

  // 1. Check applied coupon code
  if (appliedCouponCode === 'SAVE5') {
    discountAmount = Math.round(subtotal * 0.05);
    discountLabel = 'Discount (SAVE5 – 5%)';
  } else if (appliedCouponCode === 'BUY2') {
    if (totalCount >= 2) {
      discountAmount = Math.round(subtotal * 0.10);
      discountLabel = 'Discount (BUY2 – 10%)';
    } else {
      // Not eligible yet
      discountAmount = 0;
      discountLabel = '';
    }
  }

  // 2. Prepaid promotion discount
  // If payment method is prepaid:
  // If no coupon code is applied, the 5% Prepaid discount applies to the checkout!
  // If a coupon code is applied (e.g. SAVE5 or BUY2), the promotion is reflected.
  let isPrepaidActive = (selectedPaymentMethod === 'prepaid');
  if (isPrepaidActive && !appliedCouponCode) {
    discountAmount = Math.round(subtotal * 0.05);
    discountLabel = 'Prepaid Discount (5%)';
  }

  const shipping = 0; // FREE Delivery on checkout
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping);

  return {
    subtotal,
    discountAmount,
    discountLabel,
    shipping,
    finalTotal,
    totalCount
  };
}

function updateCheckoutUI() {
  renderCheckoutSummary();

  const totals = calculateCheckoutTotals();

  // 1. Subtotal Display
  const subtotalEl = document.getElementById('checkoutBreakdownSubtotal');
  if (subtotalEl) {
    subtotalEl.textContent = `₹${totals.subtotal.toLocaleString('en-IN')}`;
  }

  // 2. Discount Breakdown Row
  const discountRow = document.getElementById('checkoutBreakdownDiscountRow');
  const discountLabelEl = document.getElementById('checkoutBreakdownDiscountLabel');
  const discountValEl = document.getElementById('checkoutBreakdownDiscountVal');

  if (discountRow) {
    if (totals.discountAmount > 0) {
      discountRow.style.display = 'flex';
      if (discountLabelEl) discountLabelEl.textContent = totals.discountLabel;
      if (discountValEl) discountValEl.textContent = `-₹${totals.discountAmount.toLocaleString('en-IN')}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  // 3. Final Total Displays
  const finalTotalEl = document.getElementById('checkoutFinalTotal');
  if (finalTotalEl) {
    finalTotalEl.textContent = totals.finalTotal.toLocaleString('en-IN');
  }

  if (dom.checkoutAmountTotal) {
    dom.checkoutAmountTotal.textContent = totals.finalTotal.toLocaleString('en-IN');
  }

  // 4. Update Discount Offer Cards Visual State
  const cardSave5 = document.getElementById('discountCardSave5');
  const actionBtnSave5 = document.getElementById('actionBtnSave5');
  const isSave5Applied = (appliedCouponCode === 'SAVE5');
  if (cardSave5) {
    cardSave5.classList.toggle('active-applied', isSave5Applied);
    if (actionBtnSave5) {
      actionBtnSave5.textContent = isSave5Applied ? 'Applied ✓' : 'Apply';
    }
  }

  const cardPrepaid = document.getElementById('discountCardPrepaid');
  const prepaidBadge = document.getElementById('prepaidBadge');
  const isPrepaid = (selectedPaymentMethod === 'prepaid');
  if (cardPrepaid) {
    cardPrepaid.classList.toggle('active-applied', isPrepaid);
    if (prepaidBadge) {
      if (isPrepaid) {
        prepaidBadge.textContent = 'Active';
        prepaidBadge.className = 'discount-status-badge';
      } else {
        prepaidBadge.textContent = 'Prepaid Only';
        prepaidBadge.className = 'discount-status-badge inactive';
      }
    }
  }

  const cardBuy2 = document.getElementById('discountCardBuy2');
  const actionBtnBuy2 = document.getElementById('actionBtnBuy2');
  const isBuy2Applied = (appliedCouponCode === 'BUY2');
  if (cardBuy2) {
    cardBuy2.classList.toggle('active-applied', isBuy2Applied);
    if (actionBtnBuy2) {
      actionBtnBuy2.textContent = isBuy2Applied ? 'Applied ✓' : 'Apply';
    }
  }

  // 5. Promo Input Feedback
  const promoInput = document.getElementById('checkoutPromoInput');
  const promoMsg = document.getElementById('checkoutPromoMsg');
  if (promoMsg) {
    if (appliedCouponCode) {
      if (promoInput) promoInput.value = appliedCouponCode;
      promoMsg.style.display = 'block';
      promoMsg.className = 'checkout-promo-msg success';
      promoMsg.innerHTML = `<span>✓ Code <strong>"${appliedCouponCode}"</strong> applied</span> <button type="button" onclick="removeCheckoutCoupon()" style="background:none;border:none;color:#C62828;text-decoration:underline;cursor:pointer;font-size:0.75rem;margin-left:8px;">Remove</button>`;
    } else {
      if (promoInput && !promoInput.matches(':focus')) {
        promoInput.value = '';
      }
      promoMsg.style.display = 'none';
      promoMsg.textContent = '';
    }
  }
}

function applyCheckoutCoupon(rawCode) {
  const code = (rawCode || '').trim().toUpperCase();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const promoMsg = document.getElementById('checkoutPromoMsg');

  if (!code) {
    if (promoMsg) {
      promoMsg.style.display = 'block';
      promoMsg.className = 'checkout-promo-msg error';
      promoMsg.textContent = 'Please enter a coupon code.';
    }
    return false;
  }

  if (code === 'SAVE5') {
    appliedCouponCode = 'SAVE5';
    showToast('SAVE5 applied: Flat 5% off your first order');
    updateCheckoutUI();
    return true;
  }

  if (code === 'BUY2') {
    if (totalCount < 2) {
      if (promoMsg) {
        promoMsg.style.display = 'block';
        promoMsg.className = 'checkout-promo-msg error';
        promoMsg.textContent = 'BUY2 requires 2 or more items in your shopping bag.';
      }
      showToast('BUY2 requires 2 or more candles in your bag');
      return false;
    }
    appliedCouponCode = 'BUY2';
    showToast('BUY2 applied: 10% off purchase of 2 items');
    updateCheckoutUI();
    return true;
  }

  // Custom or external Shopify code
  if (promoMsg) {
    promoMsg.style.display = 'block';
    promoMsg.className = 'checkout-promo-msg error';
    promoMsg.textContent = `Coupon "${code}" is invalid. Available codes: SAVE5, BUY2.`;
  }
  showToast(`Invalid coupon code "${code}"`);
  return false;
}

function copyAndApplyCoupon(code) {
  // 1. Copy code to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`${code} copied`);
    }).catch(() => {
      showToast(`${code} copied`);
    });
  } else {
    showToast(`${code} copied`);
  }

  // 2. Toggle / Apply the coupon
  if (appliedCouponCode === code) {
    removeCheckoutCoupon();
  } else {
    applyCheckoutCoupon(code);
  }
}

function removeCheckoutCoupon() {
  appliedCouponCode = null;
  const promoInput = document.getElementById('checkoutPromoInput');
  if (promoInput) promoInput.value = '';
  updateCheckoutUI();
  showToast('Coupon code removed');
}

function initCheckoutDiscounts() {
  // Bind discount card clicks
  document.getElementById('discountCardSave5')?.addEventListener('click', () => {
    copyAndApplyCoupon('SAVE5');
  });

  document.getElementById('discountCardBuy2')?.addEventListener('click', () => {
    copyAndApplyCoupon('BUY2');
  });

  document.getElementById('discountCardPrepaid')?.addEventListener('click', () => {
    setPaymentSelection('prepaid');
    const radio = document.querySelector('input[name="paymentType"][value="prepaid"]');
    if (radio) radio.checked = true;
    showToast('Prepaid payment selected: Extra 5% off applied');
  });

  // Bind promo manual input & apply button
  const applyBtn = document.getElementById('checkoutPromoApplyBtn');
  const promoInput = document.getElementById('checkoutPromoInput');

  applyBtn?.addEventListener('click', () => {
    if (promoInput) applyCheckoutCoupon(promoInput.value);
  });

  promoInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyCheckoutCoupon(promoInput.value);
    }
  });
}

// Attach checkout discount event listeners on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCheckoutDiscounts);
} else {
  initCheckoutDiscounts();
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("Please add candles to your bag first.");
    return;
  }
  toggleCartDrawer(false);

  updateCheckoutUI();
  populateCheckoutSavedAddresses();

  const totals = calculateCheckoutTotals();
  if (window.CandleierAnalytics && typeof window.CandleierAnalytics.trackBeginCheckout === 'function') {
    window.CandleierAnalytics.trackBeginCheckout(cart, totals.finalTotal, appliedCouponCode);
  }

  dom.checkoutModal?.classList.add('active');
  dom.drawerOverlay?.classList.add('active');
}

function closeCheckout() {
  dom.checkoutModal?.classList.remove('active');
  dom.drawerOverlay?.classList.remove('active');
}

function setPaymentSelection(method) {
  selectedPaymentMethod = method;
  if (dom.labelPrepaid && dom.labelCod) {
    dom.labelPrepaid.classList.toggle('selected', method === 'prepaid');
    dom.labelCod.classList.toggle('selected', method === 'cod');
  }
  updateCheckoutUI();
}

async function createShopifyCheckout(items, discountCodes = []) {
  try {
    const endpoint = `https://${CANDLEIER_CONFIG.shopifyStoreDomain}/api/${CANDLEIER_CONFIG.shopifyApiVersion}/graphql.json`;
    const lines = items
      .filter(item => item.shopifyVariantId)
      .map(item => ({ quantity: item.qty, merchandiseId: item.shopifyVariantId }));
    
    if (!lines.length) {
      // Fallback: If no explicit Shopify variant ID yet, build direct cart checkout link
      return `https://${CANDLEIER_CONFIG.shopifyStoreDomain}/cart`;
    }

    const mutation = `mutation CartCreate($lines: [CartLineInput!], $discountCodes: [String!]) {
      cartCreate(input: {lines: $lines, discountCodes: $discountCodes}) {
        cart {
          checkoutUrl
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          discountCodes {
            code
            applicable
          }
        }
        userErrors {
          message
        }
      }
    }`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': CANDLEIER_CONFIG.shopifyStorefrontToken
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          lines,
          discountCodes: discountCodes.filter(Boolean)
        }
      })
    });
    const data = await response.json();
    return data?.data?.cartCreate?.cart?.checkoutUrl || null;
  } catch (error) {
    console.error('Shopify checkout error:', error);
    return null;
  }
}

async function loadRazorpaySDK() {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function processOrder(e) {
  if (e && e.preventDefault) e.preventDefault();

  if (!cart || cart.length === 0) {
    showToast('Your shopping bag is empty. Please add items to proceed.');
    return;
  }

  // 1. Gather delivery inputs
  const custName = (document.getElementById('custName')?.value || '').trim();
  const custPhone = (document.getElementById('custPhone')?.value || '').trim();
  const custAddress = (document.getElementById('custAddress')?.value || '').trim();
  const custCity = (document.getElementById('custCity')?.value || '').trim();
  const custPincode = (document.getElementById('custPincode')?.value || '').trim();
  const custState = (document.getElementById('custState')?.value || '').trim();

  if (!custName) {
    showToast('Please enter your full name for delivery.');
    document.getElementById('custName')?.focus();
    return;
  }
  if (!custPhone || custPhone.length < 10) {
    showToast('Please enter a valid 10-digit mobile number.');
    document.getElementById('custPhone')?.focus();
    return;
  }
  if (!custAddress) {
    showToast('Please enter your complete street address.');
    document.getElementById('custAddress')?.focus();
    return;
  }
  if (!custCity) {
    showToast('Please enter your city.');
    document.getElementById('custCity')?.focus();
    return;
  }
  if (!custPincode || custPincode.length < 6) {
    showToast('Please enter a valid 6-digit PIN code.');
    document.getElementById('custPincode')?.focus();
    return;
  }

  const shippingAddress = {
    name: custName,
    phone: custPhone,
    address: custAddress,
    city: custCity,
    pincode: custPincode,
    state: custState || 'India'
  };

  const totals = calculateCheckoutTotals();
  const activeCodes = appliedCouponCode ? [appliedCouponCode] : [];

  const submitBtn = document.getElementById('placeOrderBtn');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Confirm Order';

  const setLoading = (loading, text) => {
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading ? `<span>${text || 'Processing...'}</span>` : originalBtnText;
    }
  };

  // 2. Track begin checkout analytics
  if (window.CandleierAnalytics && typeof window.CandleierAnalytics.trackBeginCheckout === 'function') {
    window.CandleierAnalytics.trackBeginCheckout(cart, totals.finalTotal, appliedCouponCode);
  }

  // 3. If Shopify Storefront credentials are active, try Shopify Web Checkout first
  if (CANDLEIER_CONFIG && CANDLEIER_CONFIG.shopifyStoreDomain && CANDLEIER_CONFIG.shopifyStorefrontToken) {
    setLoading(true, 'Connecting to Shopify Secure Checkout…');
    const checkoutUrl = await createShopifyCheckout(cart, activeCodes);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
  }

  // 4. Native Payment Gateway Execution (Razorpay Prepaid or Cash on Delivery)
  try {
    setLoading(true, selectedPaymentMethod === 'prepaid' ? 'Opening Secure Payment Gateway…' : 'Confirming Your Order…');

    if (selectedPaymentMethod === 'prepaid') {
      // Load Razorpay Checkout SDK
      await loadRazorpaySDK();

      // Fetch Razorpay order details from server
      let razorpayData = null;
      try {
        const rpRes = await fetch('/api/checkout/razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, couponCode: appliedCouponCode })
        });
        const rpJson = await rpRes.json();
        if (rpJson && rpJson.success && rpJson.data) {
          razorpayData = rpJson.data;
        }
      } catch (rpErr) {
        console.warn('Razorpay order initialization notice:', rpErr);
      }

      if (window.Razorpay && razorpayData && razorpayData.keyId) {
        const rzpOptions = {
          key: razorpayData.keyId,
          amount: razorpayData.amount,
          currency: razorpayData.currency || 'INR',
          name: 'The Candleier',
          description: 'Artisan Botanical Candles Order',
          image: 'asset/logo.png',
          order_id: razorpayData.orderId.startsWith('order_rp_') ? undefined : razorpayData.orderId,
          prefill: {
            name: custName,
            contact: custPhone
          },
          theme: {
            color: '#2B050B'
          },
          handler: async function (response) {
            setLoading(true, 'Verifying Payment & Finalizing Order…');
            await finalizeOrderSubmission({
              items: cart,
              shippingAddress,
              paymentMethod: 'prepaid',
              couponCode: appliedCouponCode,
              paymentDetails: {
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_order_id: response.razorpay_order_id || razorpayData.orderId,
                razorpay_signature: response.razorpay_signature || 'verified'
              }
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              showToast('Payment window closed. You can retry whenever ready.');
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', function (resp) {
          setLoading(false);
          alert('Payment Failed: ' + (resp.error?.description || 'Transaction could not be completed.'));
        });
        rzp.open();
        return;
      }
    }

    // Direct Order Submission (for COD or standard Prepaid checkout)
    await finalizeOrderSubmission({
      items: cart,
      shippingAddress,
      paymentMethod: selectedPaymentMethod,
      couponCode: appliedCouponCode,
      paymentDetails: { method: selectedPaymentMethod }
    });

  } catch (err) {
    setLoading(false);
    console.error('Order placement error:', err);
    showToast(err.message || 'Could not place order. Please check your connection and try again.');
  }

  async function finalizeOrderSubmission(payload) {
    try {
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(window.ShopifyService?.token ? { 'Authorization': `Bearer ${window.ShopifyService.token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Failed to place order.');
      }

      const confirmedOrder = result.order || result.data?.order || result;
      const orderNumber = result.orderNumber || result.data?.orderNumber || confirmedOrder?.orderNumber || 'TC2026';

      // Track purchase in analytics
      if (window.CandleierAnalytics && typeof window.CandleierAnalytics.trackPurchase === 'function') {
        window.CandleierAnalytics.trackPurchase(confirmedOrder);
      }

      // Clear Shopping Bag
      cart = [];
      if (typeof saveCart === 'function') saveCart();
      if (typeof updateCartUI === 'function') updateCartUI();

      closeCheckout();
      showToast(`🎉 Order Placed Successfully! Order #${orderNumber}`);

      // Smooth redirect to order details page
      setTimeout(() => {
        window.location.href = `order-details.html?id=${encodeURIComponent(orderNumber)}`;
      }, 1000);

    } catch (finalErr) {
      setLoading(false);
      showToast(finalErr.message || 'An error occurred during order confirmation.');
    }
  }
}

// Expose handlers globally for inline attributes or external callers
window.copyAndApplyCoupon = copyAndApplyCoupon;
window.applyCheckoutCoupon = applyCheckoutCoupon;
window.removeCheckoutCoupon = removeCheckoutCoupon;
window.setPaymentSelection = setPaymentSelection;
window.updateCheckoutUI = updateCheckoutUI;
window.processOrder = processOrder;
