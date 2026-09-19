/* =========================================================
   8. PRODUCT QUICK VIEW MODAL (PDP) & PINCODE VERIFIER
   ========================================================= */
function openPDP(productId) {
  const product = CANDLE_INVENTORY.find(item => item.id === productId);
  if (!product || !dom.pdpModal) return;

  activePdpProductId = product.id;
  dom.pdpImage.src = product.image;
  dom.pdpImage.alt = product.title;
  dom.pdpCategory.textContent = product.category;
  dom.pdpTitle.textContent = product.title;
  dom.pdpPrice.textContent = `₹${product.price.toLocaleString('en-IN')}`;
  dom.pdpOrigPrice.textContent = `₹${product.origPrice.toLocaleString('en-IN')}`;
  dom.pdpDescription.textContent = product.desc;

  dom.pdpTopNotes.textContent = product.notes.top;
  dom.pdpHeartNotes.textContent = product.notes.heart;
  dom.pdpBaseNotes.textContent = product.notes.base;
  dom.pdpBurnTime.textContent = product.burn;
  if (dom.pdpBurnDetail) dom.pdpBurnDetail.textContent = product.burn;
  if (dom.pdpDimensions) dom.pdpDimensions.textContent = product.dimensions || '—';
  if (dom.pdpStock) dom.pdpStock.textContent = product.stock > 0 ? `${product.stock} available` : 'Sold out';

  if (dom.pdpVariantWrap && dom.pdpVariantSelect) {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (variants.length > 1) {
      dom.pdpVariantWrap.hidden = false;
      dom.pdpVariantSelect.innerHTML = variants.map(v => `<option value="${v.id}" ${v.available === false ? 'disabled' : ''}>${v.title} — ₹${Number(v.price || product.price).toLocaleString('en-IN')}</option>`).join('');
    } else {
      dom.pdpVariantWrap.hidden = true;
      dom.pdpVariantSelect.innerHTML = '';
    }
  }

  if (dom.pincodeInput) dom.pincodeInput.value = '';
  if (dom.pincodeMsg) dom.pincodeMsg.textContent = '';

  dom.pdpModal.classList.add('active');
  dom.drawerOverlay?.classList.add('active');

  if (window.CandleierAnalytics && typeof window.CandleierAnalytics.trackViewItem === 'function') {
    window.CandleierAnalytics.trackViewItem(product);
  }
}

function closePDP() {
  if (!dom.pdpModal) return;
  dom.pdpModal.classList.remove('active');
  dom.drawerOverlay?.classList.remove('active');
  activePdpProductId = null;
}

async function verifyPincode() {
  const pincode = dom.pincodeInput?.value.trim();
  if (!dom.pincodeMsg) return;

  if (!/^\d{6}$/.test(pincode || '')) {
    dom.pincodeMsg.style.color = '#C62828';
    dom.pincodeMsg.textContent = 'Please enter a valid 6-digit Indian pincode.';
    return;
  }

  dom.pincodeMsg.style.color = 'var(--text-muted)';
  dom.pincodeMsg.textContent = 'Checking pincode…';

  try {
    if (CANDLEIER_CONFIG.pincodeServiceabilityEndpoint) {
      const response = await fetch(CANDLEIER_CONFIG.pincodeServiceabilityEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode })
      });
      if (!response.ok) throw new Error('Serviceability request failed');
      const result = await response.json();
      dom.pincodeMsg.style.color = result.serviceable ? '#2E7D32' : '#C62828';
      dom.pincodeMsg.textContent = result.serviceable
        ? `✓ Delivery available to ${pincode}${result.eta ? ` • ETA ${result.eta}` : ''}${result.cod ? ' • COD available' : ''}.`
        : `Delivery is currently unavailable for ${pincode}.`;
      return;
    }

    /* Fallback validates the Indian postal code and shows its location.
       It does NOT pretend to know courier serviceability/COD without the real courier endpoint. */
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    const record = data?.[0];
    const office = record?.PostOffice?.[0];

    if (record?.Status === 'Success' && office) {
      dom.pincodeMsg.style.color = '#2E7D32';
      dom.pincodeMsg.textContent = `✓ ${pincode} is a valid postal code (${office.District}, ${office.State}). Final delivery/COD availability is confirmed by the courier at checkout.`;
    } else {
      dom.pincodeMsg.style.color = '#C62828';
      dom.pincodeMsg.textContent = 'This pincode was not found. Please check the 6 digits.';
    }
  } catch (error) {
    dom.pincodeMsg.style.color = '#8A5A00';
    dom.pincodeMsg.textContent = 'Pincode format is valid. Connect the courier serviceability endpoint for live delivery and COD confirmation.';
  }
}

