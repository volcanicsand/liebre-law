/* Liebre Law: optional, consent-based website analytics. */
(() => {
  'use strict';
  const id = document.currentScript?.dataset.measurementId;
  if (!/^G-[A-Z0-9]+$/.test(id || '') || window.liebreAnalyticsLoaded) return;
  window.liebreAnalyticsLoaded = true;
  const key = 'liebre-analytics-choice-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let started = false;
  const es = new URLSearchParams(location.search).get('lang') === 'en' ? false : document.documentElement.lang.startsWith('es');
  const labels = es ? {
    title: 'Su privacidad',
    description: 'Con su permiso, usamos Google Analytics para contar visitas y saber c\u00f3mo llegan las personas al sitio. No enviamos sus respuestas del formulario a Analytics. Puede rechazarlo y usar todo el sitio.',
    allow: 'Permitir anal\u00edtica', decline: 'Rechazar',
    notice: 'Aviso de privacidad', settings: 'Privacidad', close: 'Cerrar'
  } : {
    title: 'Your privacy',
    description: 'With your permission, we use Google Analytics to count visits and understand how people find the site. We do not send your form answers to Analytics. You can decline and use the entire site.',
    allow: 'Allow analytics', decline: 'Decline',
    notice: 'Privacy notice', settings: 'Privacy', close: 'Close'
  };

  function savedChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && value.expires > Date.now() && ['granted', 'denied'].includes(value.status) ? value.status : null;
    } catch (_) { return null; }
  }

  // Keep campaign attribution, but never send arbitrary query strings or fragments.
  function measuredLocation() {
    const value = new URL(location.origin + location.pathname);
    const current = new URLSearchParams(location.search);
    for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = current.get(name);
      if (v && /^[A-Za-z0-9 _.-]{1,100}$/.test(v)) value.searchParams.set(name, v);
    }
    for (const name of ['gclid', 'gbraid', 'wbraid']) {
      const v = current.get(name);
      if (v && /^[A-Za-z0-9_-]{1,256}$/.test(v)) value.searchParams.set(name, v);
    }
    return value.href;
  }

  function measuredReferrer() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; }
    catch (_) { return ''; }
  }

  function start() {
    if (started) return;
    if (!['liebrelaw.com', 'www.liebrelaw.com'].includes(location.hostname)) return;
    started = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      page_location: measuredLocation(),
      page_referrer: measuredReferrer(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: lifetime / 1000,
      cookie_update: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(';').map(x => x.trim().split('=')[0]).filter(x => x === '_ga' || x.startsWith('_ga_'));
    const domains = ['', location.hostname, '.' + location.hostname, 'liebrelaw.com', '.liebrelaw.com'];
    for (const name of names) for (const domain of domains) {
      document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (domain ? '; Domain=' + domain : '');
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    #liebre-privacy-panel{box-sizing:border-box;position:fixed;z-index:10000;bottom:56px;left:16px;right:16px;max-width:650px;padding:22px;background:#f8f6ef;color:#173b35;border:1px solid #9aa99e;border-radius:8px;box-shadow:0 8px 36px #0003;font:15px/1.5 Arial,sans-serif;text-align:left}
    #liebre-privacy-panel[hidden]{display:none}
    #liebre-privacy-panel h2{margin:0 32px 8px 0;font:bold 19px/1.3 Arial,sans-serif;color:#173b35}
    #liebre-privacy-panel p{margin:0 0 14px;font:15px/1.5 Arial,sans-serif;color:#173b35}
    #liebre-privacy-panel a{color:#173b35;text-decoration:underline;font-size:14px}
    #liebre-privacy-panel .liebre-privacy-actions{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0 0}
    #liebre-privacy-panel button,#liebre-privacy-settings{font:600 14px/1.3 Arial,sans-serif;cursor:pointer;border:1px solid #173b35;border-radius:4px;padding:10px 16px;background:#f8f6ef;color:#173b35}
    #liebre-privacy-panel button:hover,#liebre-privacy-settings:hover{background:#e9eddf}
    #liebre-privacy-panel button:focus-visible,#liebre-privacy-panel a:focus-visible,#liebre-privacy-settings:focus-visible{outline:3px solid #b8492d;outline-offset:3px}
    #liebre-privacy-panel .liebre-privacy-close{position:absolute;top:10px;right:10px;padding:4px 9px;font-size:20px;border:0}
    #liebre-privacy-settings{position:fixed;z-index:9999;bottom:12px;left:16px;padding:7px 12px;font-size:12px;box-shadow:0 2px 8px #0002}
    @media(max-width:480px){#liebre-privacy-panel{bottom:54px;padding:18px}#liebre-privacy-panel .liebre-privacy-actions button{flex:1}}
  `;
  document.head.appendChild(style);
  const panel = document.createElement('section');
  panel.id = 'liebre-privacy-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'liebre-privacy-heading');
  const heading = document.createElement('h2');
  heading.id = 'liebre-privacy-heading'; heading.textContent = labels.title;
  const description = document.createElement('p'); description.textContent = labels.description;
  const notice = document.createElement('a'); notice.href = '/privacy.html' + (es ? '#es' : '#en'); notice.textContent = labels.notice;
  const actions = document.createElement('div'); actions.className = 'liebre-privacy-actions';
  const allow = document.createElement('button'); allow.type = 'button'; allow.textContent = labels.allow;
  const decline = document.createElement('button'); decline.type = 'button'; decline.textContent = labels.decline;
  const close = document.createElement('button'); close.type = 'button'; close.className = 'liebre-privacy-close'; close.textContent = '\u00d7'; close.setAttribute('aria-label', labels.close);
  const settings = document.createElement('button'); settings.type = 'button'; settings.id = 'liebre-privacy-settings'; settings.textContent = labels.settings; settings.setAttribute('aria-controls', panel.id); settings.setAttribute('aria-expanded', 'false');
  actions.append(allow, decline); panel.append(heading, description, notice, actions, close); document.body.append(panel, settings);

  function hide() { panel.hidden = true; settings.setAttribute('aria-expanded', 'false'); }
  function choose(status) {
    try { localStorage.setItem(key, JSON.stringify({status, expires: Date.now() + lifetime})); } catch (_) {}
    hide(); settings.focus();
    if (status === 'granted') start();
    else {
      window['ga-disable-' + id] = true;
      clearAnalyticsCookies();
      if (started) location.reload();
    }
  }
  allow.addEventListener('click', () => choose('granted'));
  decline.addEventListener('click', () => choose('denied'));
  close.addEventListener('click', () => { hide(); settings.focus(); });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { hide(); settings.focus(); } });
  settings.addEventListener('click', () => { panel.hidden = false; settings.setAttribute('aria-expanded', 'true'); allow.focus(); });
  const choice = savedChoice();
  panel.hidden = choice !== null || location.pathname === '/privacy.html';
  settings.setAttribute('aria-expanded', String(!panel.hidden));
  if (choice === 'granted') start();
  else { window['ga-disable-' + id] = true; clearAnalyticsCookies(); }
})();
