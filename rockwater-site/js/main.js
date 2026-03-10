/* ============================================================
   ROCK WATER — Main JavaScript
   Cart system, navigation, scroll effects, animations
   ============================================================ */

(function () {
  'use strict';

  // =========================
  // CART SYSTEM
  // =========================
  const CART_KEY = 'rockwater_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }

  // Expose addToCart globally for product page
  window.addToCart = function (item) {
    const cart = getCart();
    const existing = cart.find(function (c) { return c.id === item.id; });

    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cart.push({
        id: item.id,
        title: item.title,
        price: item.price,
        size: item.size,
        quantity: item.quantity || 1
      });
    }

    saveCart(cart);
    openCart();
  };

  function removeFromCart(id) {
    var cart = getCart().filter(function (item) { return item.id !== id; });
    saveCart(cart);
  }

  function updateCartUI() {
    var cart = getCart();
    var countEl = document.getElementById('cart-count');
    var itemsEl = document.getElementById('cart-items');
    var emptyEl = document.getElementById('cart-empty');
    var footerEl = document.getElementById('cart-footer');
    var totalEl = document.getElementById('cart-total');

    if (!countEl) return;

    // Update count badge
    var totalItems = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    countEl.textContent = totalItems;
    if (totalItems > 0) {
      countEl.classList.remove('hidden');
    } else {
      countEl.classList.add('hidden');
    }

    // Update cart sidebar contents
    if (!itemsEl) return;

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (footerEl) footerEl.style.display = 'none';
      // Remove all cart items but keep the empty state
      var cartItemEls = itemsEl.querySelectorAll('.cart-item');
      cartItemEls.forEach(function (el) { el.remove(); });
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = '';

    // Remove existing cart item elements
    var existingItems = itemsEl.querySelectorAll('.cart-item');
    existingItems.forEach(function (el) { el.remove(); });

    // Build cart items
    var subtotal = 0;

    cart.forEach(function (item) {
      subtotal += item.price * item.quantity;

      var div = document.createElement('div');
      div.className = 'cart-item';

      var canClass = item.id === '16oz' ? 'product-can__image--cream' : 'product-can__image--navy';

      div.innerHTML =
        '<div class="cart-item__image">' +
        '  <div class="product-can" style="max-width: 50px;">' +
        '    <div class="product-can__image ' + canClass + '" style="aspect-ratio: 1/2; padding: 8px 4px; border-radius: 4px;">' +
        '      <span class="product-can__brand" style="font-size: 0.55rem; letter-spacing: 0.2em;">ROCK</span>' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<div class="cart-item__details">' +
        '  <span class="cart-item__name">' + item.title + '</span>' +
        '  <span class="cart-item__variant">' + item.size + '</span>' +
        '  <span class="cart-item__qty">Qty: ' + item.quantity + '</span>' +
        '  <button class="cart-item__remove" data-id="' + item.id + '">Remove</button>' +
        '</div>' +
        '<span class="cart-item__price">$' + (item.price * item.quantity).toFixed(2) + '</span>';

      itemsEl.appendChild(div);
    });

    // Subtotal
    if (totalEl) {
      totalEl.textContent = '$' + subtotal.toFixed(2);
    }

    // Bind remove buttons
    itemsEl.querySelectorAll('.cart-item__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromCart(this.getAttribute('data-id'));
      });
    });
  }

  // =========================
  // CART SIDEBAR TOGGLE
  // =========================
  function openCart() {
    var sidebar = document.getElementById('cart-sidebar');
    var overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    var sidebar = document.getElementById('cart-sidebar');
    var overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // =========================
  // HEADER SCROLL EFFECT
  // =========================
  function handleHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;

    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  // =========================
  // MOBILE NAVIGATION
  // =========================
  function toggleMobileNav() {
    var mobileNav = document.getElementById('mobile-nav');
    var menuToggle = document.getElementById('menu-toggle');
    if (!mobileNav || !menuToggle) return;

    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');

    if (mobileNav.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // =========================
  // SCROLL ANIMATIONS
  // =========================
  function initScrollAnimations() {
    var fadeEls = document.querySelectorAll('.fade-in');
    if (!fadeEls.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================
  // INITIALIZE
  // =========================
  document.addEventListener('DOMContentLoaded', function () {
    // Cart UI
    updateCartUI();

    // Cart toggle
    var cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) {
      cartToggle.addEventListener('click', openCart);
    }

    // Cart close
    var cartClose = document.getElementById('cart-close');
    if (cartClose) {
      cartClose.addEventListener('click', closeCart);
    }

    // Cart overlay close
    var cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) {
      cartOverlay.addEventListener('click', closeCart);
    }

    // Mobile menu
    var menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileNav);
    }

    // Header scroll
    handleHeaderScroll();
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // Scroll animations
    initScrollAnimations();

    // Close mobile nav on link click
    var mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    mobileNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        var mobileNav = document.getElementById('mobile-nav');
        var menuBtn = document.getElementById('menu-toggle');
        if (mobileNav) mobileNav.classList.remove('active');
        if (menuBtn) menuBtn.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // ESC key closes cart and mobile nav
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeCart();
        var mobileNav = document.getElementById('mobile-nav');
        var menuBtn = document.getElementById('menu-toggle');
        if (mobileNav && mobileNav.classList.contains('active')) {
          mobileNav.classList.remove('active');
          if (menuBtn) menuBtn.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });
})();
