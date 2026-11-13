/* Cookie consent (Google Consent Mode v2). Load synchronously in <head>, BEFORE the gtag snippet.
   GA runs cookieless until Accept; Microsoft Clarity only loads after Accept. Global Privacy Control = Decline.
   Any element with data-cookie-settings reopens the banner. Same behavior as ~/veya-compliance consent_banner(). */
(function () {
  var K = 'veya-consent', CLARITY = 'wrlc23b7w0';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  function get() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  var c = get();
  if (navigator.globalPrivacyControl && c !== 'granted') c = 'denied';
  var g = c === 'granted' ? 'granted' : 'denied';
  gtag('consent', 'default', { analytics_storage: g, ad_storage: g, ad_user_data: g, ad_personalization: g,
    functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500 });
  gtag('set', 'ads_data_redaction', g !== 'granted');

  function clarity() {
    if (window.clarity) return;
    (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, 'clarity', 'script', CLARITY);
  }
  if (g === 'granted') clarity();

  function clear() {
    document.cookie.split(';').forEach(function (x) {
      var n = x.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl|_clck|_clsk|_fbp|_uet)/.test(n)) return;
      var h = location.hostname.split('.');
      for (var i = 0; i < h.length - 1; i++) { var d = h.slice(i).join('.');
        document.cookie = n + '=;Max-Age=0;path=/;domain=' + d; document.cookie = n + '=;Max-Age=0;path=/;domain=.' + d; }
      document.cookie = n + '=;Max-Age=0;path=/';
    });
  }

  function init() {
    var css = '.vc{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:560px;margin:0 auto;background:#faf8f3;color:#231f20;' +
      "font-family:'Brooklyn','Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.45;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.06);" +
      'padding:14px 14px 14px 18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;box-sizing:border-box}.vc[hidden]{display:none}' +
      '.vc p{margin:0;flex:1 1 220px}.vc a{color:inherit;text-decoration:underline}.vc__b{display:flex;gap:8px;flex:0 0 auto;margin-left:auto}' +
      '.vc button{font:inherit;font-weight:500;font-size:14px;padding:9px 18px;border-radius:999px;cursor:pointer;border:1px solid #1b4174;min-height:40px}' +
      '.vc__no{background:transparent;color:#1b4174}.vc__ok{background:#1b4174;color:#fff}' +
      '@media (max-width:480px){.vc{bottom:calc(12px + env(safe-area-inset-bottom));left:12px;right:12px}.vc__b{width:100%}.vc__b button{flex:1}}';
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    var b = document.createElement('div'); b.className = 'vc'; b.id = 'vc'; b.hidden = true;
    b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Cookie consent');
    b.innerHTML = '<p>We use cookies to see how our site is used. <a href="/' + 'privacy.html#cookies">Privacy Policy</a></p>' +
      '<div class="vc__b"><button type="button" class="vc__no">Decline</button><button type="button" class="vc__ok">Accept</button></div>';
    document.body.appendChild(b);
    function set(v) {
      try { localStorage.setItem(K, v); } catch (e) {}
      var st = v === 'granted' ? 'granted' : 'denied';
      gtag('consent', 'update', { analytics_storage: st, ad_storage: st, ad_user_data: st, ad_personalization: st });
      if (st === 'granted') clarity(); else { if (window.clarity) window.clarity('consent', false); clear(); }
      b.hidden = true;
    }
    b.querySelector('.vc__ok').onclick = function () { set('granted'); };
    b.querySelector('.vc__no').onclick = function () { set('denied'); };
    var cur = get();
    if (!cur && navigator.globalPrivacyControl) { set('denied'); cur = 'denied'; }
    if (!cur) b.hidden = false;
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); b.hidden = false; b.querySelector('.vc__ok').focus(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
