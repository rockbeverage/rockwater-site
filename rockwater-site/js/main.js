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

      div.innerHTML =
        '<div class="cart-item__image">' +
        '  <img src="images/product-lifestyle1.png" alt="ROCK Water" style="width: 50px; height: 65px; object-fit: cover; border-radius: 4px;">' +
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
  // SCROLL ZOOM EFFECT
  // =========================
  function initScrollZoom() {
    var zoomSection = document.getElementById('scroll-zoom');
    if (!zoomSection) return;

    var zoomText = zoomSection.querySelector('.scroll-zoom__text');
    if (!zoomText) return;

    var startScale = 1.8;
    var endScale = 1;

    function updateZoom() {
      var rect = zoomSection.getBoundingClientRect();
      var windowHeight = window.innerHeight;

      // Progress: 0 when top of section enters bottom of viewport
      //           1 when section is centered in viewport
      var sectionCenter = rect.top + rect.height / 2;
      var viewportCenter = windowHeight / 2;

      // Map: sectionCenter at windowHeight (just entered) → progress 0
      //      sectionCenter at viewportCenter (centered) → progress 1
      var progress = (windowHeight - sectionCenter) / (windowHeight - viewportCenter);
      progress = Math.max(0, Math.min(1, progress));

      // Smoothstep easing for a natural feel
      progress = progress * progress * (3 - 2 * progress);

      var scale = startScale - (startScale - endScale) * progress;
      zoomText.style.transform = 'scale(' + scale.toFixed(4) + ')';
    }

    window.addEventListener('scroll', updateZoom, { passive: true });
    updateZoom();
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

    // Scroll zoom effect
    initScrollZoom();

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


    // Ingredient tooltip — tap-to-toggle on mobile
    var tooltipTags = document.querySelectorAll('.product-detail__feature-tag[data-tooltip]');
    tooltipTags.forEach(function (tag) {
      var parent = tag.parentElement;
      var inlineEl = parent.querySelector('.tooltip-inline-text');
      if (!inlineEl) {
        inlineEl = document.createElement('div');
        inlineEl.className = 'tooltip-inline-text';
        parent.appendChild(inlineEl);
      }

      tag.addEventListener('click', function () {
        var wasActive = tag.classList.contains('tooltip-active');
        var localInline = tag.parentElement.querySelector('.tooltip-inline-text');
        tooltipTags.forEach(function (t) { t.classList.remove('tooltip-active'); });
        document.querySelectorAll('.tooltip-inline-text').forEach(function (el) {
          el.classList.remove('visible');
          el.textContent = '';
        });
        if (!wasActive) {
          tag.classList.add('tooltip-active');
          if (localInline) {
            localInline.textContent = tag.getAttribute('data-tooltip');
            localInline.classList.add('visible');
          }
        }
      });
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.product-detail__feature-tag[data-tooltip]')) {
        tooltipTags.forEach(function (t) { t.classList.remove('tooltip-active'); });
        document.querySelectorAll('.tooltip-inline-text').forEach(function (el) {
          el.classList.remove('visible');
          el.textContent = '';
        });
      }
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

    // Footer accordion on mobile
    var footerHeadings = document.querySelectorAll('.footer__heading');
    footerHeadings.forEach(function (heading) {
      heading.addEventListener('click', function () {
        if (window.innerWidth > 768) return;
        var links = heading.nextElementSibling;
        if (!links) return;
        var isOpen = links.classList.contains('open');

        // Close all others
        footerHeadings.forEach(function (h) {
          h.classList.remove('active');
          var l = h.nextElementSibling;
          if (l) l.classList.remove('open');
        });

        // Toggle clicked one
        if (!isOpen) {
          heading.classList.add('active');
          links.classList.add('open');
        }
      });
    });
  });
})();
