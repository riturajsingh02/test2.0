/* =========================================================
   6. CART OPERATIONS & FREE SHIPPING METER
   ========================================================= */
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (dom.cartCount) dom.cartCount.textContent = totalCount;
  if (dom.cartItemCountDisplay) dom.cartItemCountDisplay.textContent = totalCount;
  if (dom.cartSubtotalText) dom.cartSubtotalText.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Free shipping progress logic (Threshold: ₹999)
  const freeThreshold = 999;
  if (dom.meterBarFill && dom.shippingMeterText) {
    if (subtotal >= freeThreshold) {
      dom.meterBarFill.style.width = '100%';
      dom.shippingMeterText.textContent = '🎉 You unlocked FREE Express Delivery!';
    } else {
      const percentage = Math.min((subtotal / freeThreshold) * 100, 100);
      dom.meterBarFill.style.width = `${percentage}%`;
      const difference = freeThreshold - subtotal;
      dom.shippingMeterText.textContent = `Add ₹${difference.toLocaleString('en-IN')} more for FREE Express Delivery`;
    }
  }

  // Synchronize wishlist quantities if wishlist drawer is open
  if (typeof renderWishlistDrawer === 'function' && document.getElementById('wishlistDrawer')?.classList.contains('active')) {
    renderWishlistDrawer();
  }

  if (!dom.cartItemsContainer) return;

  if (cart.length === 0) {
    dom.cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--maroon-light); margin-bottom: 0.5rem;">Your Bag is Empty</p>
        <p style="font-size: 0.85rem; margin-bottom: 1.5rem;">Discover hand-poured botanical candles to light up your space.</p>
        <button type="button" class="btn btn-gold" onclick="toggleCartDrawer(false)">Explore Fragrances</button>
      </div>
    `;
    return;
  }

  dom.cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" />
      <div class="cart-item-info">
        <h5>${item.title}</h5>
        <p>${item.selectedVariant ? `${item.selectedVariant} • ` : ''}₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
        <div class="qty-controls">
          <button type="button" onclick="modifyQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button type="button" onclick="modifyQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button 
        type="button" 
        style="color: var(--maroon-light); font-size: 1.1rem; padding: 4px;" 
        aria-label="Remove item" 
        onclick="modifyQty(${item.id}, -9999)"
      >
        ✕
      </button>
    </div>
  `).join('');
}

function addToCart(productId) {
  const product = CANDLE_INVENTORY.find(item => item.id === productId);
  if (!product) return;
  if (product.stock <= 0) {
    showToast('This candle is currently sold out.');
    return;
  }

  let variant = product.variants?.[0];
  if (activePdpProductId === productId && dom.pdpVariantSelect?.value) {
    variant = product.variants.find(v => v.id === dom.pdpVariantSelect.value) || variant;
  }

  const cartKey = `${productId}:${variant?.id || 'standard'}`;
  const existing = cart.find(item => item.cartKey === cartKey);
  if (existing) {
    if (existing.qty >= product.stock) {
      showToast('Maximum available quantity reached.');
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1, cartKey, selectedVariant: variant?.title || 'Standard', price: Number(variant?.price || product.price) });
  }

  localStorage.setItem('thecandleier_cart', JSON.stringify(cart));
  updateCartUI();
  toggleCartDrawer(true);
  showToast("Added to shopping bag!");

  if (window.CandleierAnalytics && typeof window.CandleierAnalytics.trackAddToCart === 'function') {
    window.CandleierAnalytics.trackAddToCart(product, 1, variant?.title || 'Standard');
  }
}

function modifyQty(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  if (change < 0 && window.CandleierAnalytics && typeof window.CandleierAnalytics.trackRemoveFromCart === 'function') {
    window.CandleierAnalytics.trackRemoveFromCart(item, Math.abs(change));
  } else if (change > 0 && window.CandleierAnalytics && typeof window.CandleierAnalytics.trackAddToCart === 'function') {
    window.CandleierAnalytics.trackAddToCart(item, change, item.selectedVariant);
  }

  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  localStorage.setItem('thecandleier_cart', JSON.stringify(cart));
  updateCartUI();
}

function toggleCartDrawer(isOpen) {
  if (!dom.cartDrawer || !dom.drawerOverlay) return;
  dom.cartDrawer.classList.toggle('active', isOpen);
  dom.drawerOverlay.classList.toggle('active', isOpen);

  if (isOpen && window.CandleierAnalytics && typeof window.CandleierAnalytics.trackViewCart === 'function') {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    window.CandleierAnalytics.trackViewCart(cart, subtotal);
  }
}
