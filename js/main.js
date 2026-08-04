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

    // Hide announcement bar after scrolling
    var bar = document.querySelector('.announcement-bar');
    if (bar) {
      if (window.scrollY > 50) {
        bar.classList.add('announcement-bar--hidden');
        document.body.classList.add('announcement-hidden');
      } else {
        bar.classList.remove('announcement-bar--hidden');
        document.body.classList.remove('announcement-hidden');
      }
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
  // =========================
  // GLOBAL CART ICON (all pages)
  // =========================
  function injectGlobalCartIcon() {
    // Cart icons are now baked into each page's HTML header (login + cart before
    // the hamburger). Nothing to inject at runtime. Keeping this as a no-op so
    // callers below don't error.
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectGlobalCartIcon();

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

/* ========== Reviews Carousel ========== */
(function() {
  var carousel = document.getElementById('reviews-carousel');
  if (!carousel) return;

  var track = carousel.querySelector('.reviews-carousel__track');
  var slides = track.querySelectorAll('.review-slide');
  var dotsContainer = document.getElementById('reviews-dots');
  var current = 0;
  var total = slides.length;
  var interval;

  // Build dots
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('button');
    dot.className = 'reviews-carousel__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
    dot.dataset.index = i;
    dot.addEventListener('click', function() {
      goTo(parseInt(this.dataset.index));
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  }

  function goTo(index) {
    current = index;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    var dots = dotsContainer.querySelectorAll('.reviews-carousel__dot');
    dots.forEach(function(d, j) {
      d.classList.toggle('active', j === current);
    });
  }

  function next() {
    goTo((current + 1) % total);
  }

  function resetAutoplay() {
    clearInterval(interval);
    interval = setInterval(next, 5000);
  }

  // Touch/swipe support
  var startX = 0;
  var deltaX = 0;
  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });
  track.addEventListener('touchmove', function(e) {
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });
  track.addEventListener('touchend', function() {
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goTo(Math.min(current + 1, total - 1));
      else goTo(Math.max(current - 1, 0));
      resetAutoplay();
    }
  });

  interval = setInterval(next, 5000);
})();

/* ========== Educational Accordion ========== */
document.addEventListener('DOMContentLoaded', function() {
  var items = document.querySelectorAll('.edu-accordion__item');
  if (!items.length) return;

  items.forEach(function(item) {
    var trigger = item.querySelector('.edu-accordion__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var isActive = item.classList.contains('active');

      // Close all
      items.forEach(function(i) {
        i.classList.remove('active');
      });

      // Open clicked if it wasn't already open
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ===== Scroll-triggered Count-up =====
  var counterEls = document.querySelectorAll('.counter-number');
  if (counterEls.length && 'IntersectionObserver' in window) {
    var formatNumber = function (value, target) {
      // Preserve thousands separators for big numbers
      if (target >= 1000) return Math.round(value).toLocaleString();
      return Math.round(value).toString();
    };

    var animateCounter = function (el) {
      if (el.dataset.animated === 'true') return;
      el.dataset.animated = 'true';

      var target = parseFloat(el.dataset.target) || 0;
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      // Scale duration with magnitude so 10,000 doesn't blur past — small numbers stay snappy.
      var magnitude = Math.max(1, Math.log10(Math.max(target, 1)));
      var duration = Math.min(3200, 900 + magnitude * 600); // ~900ms for 1, ~3200ms for 10k+
      var start = performance.now();

      // For static "0" values, just stamp and exit
      if (target === 0) {
        el.textContent = prefix + '0' + suffix;
        return;
      }

      var tick = function (now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = target * eased;
        el.textContent = prefix + formatNumber(current, target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counterEls.forEach(function (el) { counterObserver.observe(el); });
  }

  // ===== Rotating fun-fact ticker — cycles through facts while visible =====
  var factTextEl = document.getElementById('fact-ticker-text');
  if (factTextEl && 'IntersectionObserver' in window) {
    var facts = [
      'Spring water supports muscle function and cellular hydration, key for active lifestyles.',
      'Most tap water is treated with chlorine and fluoride. Spring water gives you hydration without the additives.',
      'Hydration plays a real role in focus and creativity. Small upgrades to your water add up.',
      'Even mild dehydration can affect mood, energy, and concentration throughout the day.',
      'Plastic bottles take up to 450 years to decompose. Aluminum cans? 60 days.',
      '75% of all aluminum ever produced is still in use today.',
      'Every minute, around 1 million plastic bottles are bought worldwide.',
      'The average American uses 167 single-use plastic water bottles a year.',
      'Aluminum is infinitely recyclable. It never loses its quality.',
      'Microplastics have been found in 93% of bottled water samples tested.'
    ];
    var factIndex = 0;
    var rotateMs = 5000;
    var fadeMs = 400;
    var factTimer = null;

    var renderFact = function () {
      factTextEl.classList.add('is-fading');
      setTimeout(function () {
        factIndex = (factIndex + 1) % facts.length;
        factTextEl.textContent = facts[factIndex];
        factTextEl.classList.remove('is-fading');
      }, fadeMs);
    };

    var startFactRotation = function () {
      if (factTimer) return;
      factTimer = setInterval(renderFact, rotateMs);
    };
    var stopFactRotation = function () {
      if (!factTimer) return;
      clearInterval(factTimer);
      factTimer = null;
    };

    var factObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) startFactRotation();
        else stopFactRotation();
      });
    }, { threshold: 0.2 });

    factObserver.observe(factTextEl);
  }
});

/* ========== Announcement Bar — runs on every page ========== */
document.addEventListener('DOMContentLoaded', function () {
  var announcementEl = document.getElementById('announcement-text');
  if (!announcementEl) return;
  var announcements = [
    'Now shipping nationwide',
    'Proud product of the USA'
  ];
  var aIndex = 0;
  setInterval(function () {
    announcementEl.classList.add('is-fading');
    setTimeout(function () {
      aIndex = (aIndex + 1) % announcements.length;
      announcementEl.textContent = announcements[aIndex];
      announcementEl.classList.remove('is-fading');
    }, 350);
  }, 4500);
});

/* ========== Community Email Modal — once per visitor ========== */
document.addEventListener('DOMContentLoaded', function () {
  var DISMISSED_KEY = 'rockwater_community_modal_dismissed';
  // Don't re-show if already dismissed or subscribed
  if (localStorage.getItem(DISMISSED_KEY) === 'true') return;

  // Skip on checkout-like pages
  var path = (window.location.pathname || '').toLowerCase();
  if (/cart|checkout|thank/.test(path)) return;

  // Build modal markup
  var modal = document.createElement('div');
  modal.className = 'community-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = ''
    + '<div class="community-modal__overlay" data-close></div>'
    + '<div class="community-modal__card" role="dialog" aria-modal="true" aria-labelledby="community-modal-title">'
    +   '<button class="community-modal__close" type="button" aria-label="Close" data-close>&times;</button>'
    +   '<div class="community-modal__image" aria-hidden="true"></div>'
    +   '<div class="community-modal__body">'
    +     '<h2 class="community-modal__title" id="community-modal-title">Join the Community</h2>'
    +     '<p class="community-modal__copy">Be first to know about new releases, retailer launches, and stories from the source.</p>'
    +     '<form class="community-modal__form" method="POST">'
    +       '<input type="email" name="email" class="community-modal__input" placeholder="Your email" aria-label="Email address" required>'
    +       '<button type="submit" class="community-modal__submit">Stay in Touch</button>'
    +     '</form>'
    +     '<button type="button" class="community-modal__decline" data-close>No thanks</button>'
    +   '</div>'
    + '</div>';
  document.body.appendChild(modal);

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch (e) {}
    modal.classList.remove('community-modal--open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function open() {
    if (modal.classList.contains('community-modal--open')) return;
    modal.classList.add('community-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Close handlers
  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', dismiss);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('community-modal--open')) {
      dismiss();
    }
  });

  // Submit to Klaviyo (DTC Newsletter list) → triggers Welcome Series flow
  var KLAVIYO_PUBLIC_KEY = 'VdzwjP';
  var KLAVIYO_LIST_ID = 'WPGSRR';
  var form = modal.querySelector('.community-modal__form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var emailInput = form.querySelector('input[type="email"]');
    var email = (emailInput.value || '').trim();
    if (!email) return;

    var submitBtn = form.querySelector('.community-modal__submit');
    submitBtn.disabled = true;
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + KLAVIYO_PUBLIC_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'revision': '2024-02-15'
      },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'Community Modal (drinkrockwater.com)',
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: email,
                  subscriptions: {
                    email: { marketing: { consent: 'SUBSCRIBED' } }
                  }
                }
              }
            }
          },
          relationships: {
            list: { data: { type: 'list', id: KLAVIYO_LIST_ID } }
          }
        }
      })
    }).then(function (r) {
      if (r.ok || r.status === 202) {
        submitBtn.textContent = 'Thanks!';
        try { localStorage.setItem(DISMISSED_KEY, 'true'); } catch (err) {}
        setTimeout(dismiss, 1200);
      } else {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }).catch(function () {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });

  // Trigger logic: exit-intent on desktop, 15s timer fallback on mobile/touch
  var isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
  var triggered = false;
  function trigger() {
    if (triggered) return;
    triggered = true;
    open();
  }

  if (isTouch) {
    setTimeout(trigger, 15000);
  } else {
    // Exit intent: mouse leaves through the top of the viewport
    var exitHandler = function (e) {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener('mouseout', exitHandler);
    // Fallback: 25s timer even on desktop in case they never trigger exit
    setTimeout(trigger, 25000);
  }
});

/* ========== Footer Newsletter Forms → Klaviyo ========== */
(function () {
  var KLAVIYO_PUBLIC_KEY = 'VdzwjP';
  var KLAVIYO_LIST_ID = 'WPGSRR';

  function bindFooterForm(form) {
    if (form.dataset.klaviyoBound === 'true') return;
    form.dataset.klaviyoBound = 'true';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = form.querySelector('input[type="email"]');
      var email = emailInput ? (emailInput.value || '').trim() : '';
      if (!email) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + KLAVIYO_PUBLIC_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'revision': '2024-02-15'
        },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: 'Footer Newsletter (drinkrockwater.com)',
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: email,
                    subscriptions: {
                      email: { marketing: { consent: 'SUBSCRIBED' } }
                    }
                  }
                }
              }
            },
            relationships: {
              list: { data: { type: 'list', id: KLAVIYO_LIST_ID } }
            }
          }
        })
      }).then(function (r) {
        if (r.ok || r.status === 202) {
          if (submitBtn) submitBtn.textContent = 'Subscribed!';
          if (emailInput) emailInput.value = '';
        } else {
          if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
        }
      }).catch(function () {
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
      });
    });
  }

  function initAll() {
    document.querySelectorAll('.footer__newsletter-form').forEach(bindFooterForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
