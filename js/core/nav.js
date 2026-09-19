/* =========================================================
   THE CANDLEIER — UNIVERSAL MOBILE NAVIGATION & DRAWER SYSTEM
   Ensures the hamburger menu button and slide-out navigation
   work reliably and consistently across all pages.
   ========================================================= */

(function () {
  'use strict';

  function getDrawerMarkup() {
    return `
    <div class="mobile-drawer-header">
      <div class="mobile-drawer-brand">
        <h3 class="brand-title mobile-brand-title">The Candleier</h3>
        <span class="mobile-brand-sub">ILLUMINATE LUXURY</span>
      </div>
      <button class="btn-close" id="closeMobileNavBtn" aria-label="Close menu">✕</button>
    </div>

    <ul class="mobile-nav-list">
      <li>
        <a href="index.html#new-arrivals" class="mobile-nav-link">
          <span>Candles (60+ Fragrances)</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
      <li>
        <a href="full-catalog.html" class="mobile-nav-link">
          <span>Full Catalog (60+)</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
      <li>
        <a href="tracking.html" class="mobile-nav-link">
          <span>Track Order</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
      <li>
        <a href="about-us.html" class="mobile-nav-link">
          <span>Our Story &amp; Craft</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
      <li>
        <a href="faq.html" class="mobile-nav-link">
          <span>Client FAQs</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
      <li>
        <a href="contact-us.html" class="mobile-nav-link">
          <span>Customer Care</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
      <li>
        <a href="login.html" class="mobile-nav-link" id="mobAccountLink">
          <span>Client Sign In</span>
          <span class="link-arrow">→</span>
        </a>
      </li>
    </ul>

    <div class="mobile-drawer-footer">
      <p class="mob-footer-tag">Concierge Assistance</p>
      <a href="https://wa.me/919762831995?text=Hello%20The%20Candleier,%20I'd%20like%20assistance%20with%20fragrances"
        target="_blank" rel="noopener" class="mob-whatsapp-btn">
        <span>Chat on WhatsApp</span>
        <span>↗</span>
      </a>
    </div>
    `;
  }

  function ensureDrawerElements() {
    let drawer = document.getElementById('mobileDrawer');
    let overlay = document.getElementById('drawerOverlay');

    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.className = 'mobile-drawer';
      drawer.id = 'mobileDrawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'Mobile Navigation');
      drawer.innerHTML = getDrawerMarkup();
      document.body.appendChild(drawer);
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'drawer-overlay';
      overlay.id = 'drawerOverlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    return { drawer, overlay };
  }

  function toggleMobileDrawer(isOpen) {
    const { drawer, overlay } = ensureDrawerElements();
    const shouldOpen = (typeof isOpen === 'boolean') ? isOpen : !drawer.classList.contains('active');

    if (shouldOpen) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('drawer-open');
    } else {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('drawer-open');
    }

    // Synchronize authentication links in mobile drawer if ShopifyService is available
    if (window.ShopifyService && typeof window.ShopifyService.syncHeaderAuth === 'function') {
      window.ShopifyService.syncHeaderAuth();
    }
  }

  // Expose globally so inline attributes and other scripts can call it
  window.toggleMobileDrawer = toggleMobileDrawer;

  function syncHeaderBadges() {
    try {
      const savedCart = JSON.parse(localStorage.getItem('thecandleier_cart') || '[]');
      const cartCount = savedCart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
      const cartBadges = document.querySelectorAll('#cartCount, .header-cart-badge');
      cartBadges.forEach(b => { b.textContent = cartCount; });

      const savedWish = JSON.parse(localStorage.getItem('thecandleier_wishlist') || '[]');
      const wishBadges = document.querySelectorAll('#wishlistCount, .header-wishlist-badge');
      wishBadges.forEach(b => { b.textContent = savedWish.length; });
    } catch (e) {}
  }

  function bindNavEvents() {
    ensureDrawerElements();

    // 1. Delegated click listener for all hamburger buttons (works for SVG, path, line, or container clicks)
    document.addEventListener('click', function (e) {
      const hamburger = e.target.closest('#hamburgerBtn, .hamburger-btn');
      if (hamburger) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileDrawer(true);
        return;
      }

      const closeBtn = e.target.closest('#closeMobileNavBtn, .mobile-drawer .btn-close');
      if (closeBtn) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileDrawer(false);
        return;
      }

      const overlay = e.target.closest('#drawerOverlay, .drawer-overlay');
      if (overlay) {
        toggleMobileDrawer(false);
        return;
      }

      const navLink = e.target.closest('.mobile-nav-link');
      if (navLink) {
        // If it is a regular navigation link (not a button with action), close drawer
        if (navLink.tagName.toLowerCase() === 'a') {
          toggleMobileDrawer(false);
        }
      }
    });

    // 2. Escape key listener to close mobile navigation
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const drawer = document.getElementById('mobileDrawer');
        if (drawer && drawer.classList.contains('active')) {
          toggleMobileDrawer(false);
        }
      }
    });

    // 3. Highlight current page link if applicable
    try {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || href.startsWith(currentPath + '#'))) {
          link.classList.add('active');
        }
      });
    } catch (e) {}

    // 4. Update header badges from stored state
    syncHeaderBadges();

    // 5. Update Shopify auth state if loaded
    if (window.ShopifyService && typeof window.ShopifyService.syncHeaderAuth === 'function') {
      window.ShopifyService.syncHeaderAuth();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindNavEvents);
  } else {
    bindNavEvents();
  }

  // Also sync when window storage changes (e.g. from other tabs or actions)
  window.addEventListener('storage', syncHeaderBadges);
  window.addEventListener('candleier:cartUpdated', syncHeaderBadges);
  window.addEventListener('candleier:wishlistUpdated', syncHeaderBadges);
})();
