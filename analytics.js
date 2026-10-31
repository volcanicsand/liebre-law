/* Liebre Law: optional, consent-based website analytics. */
(() => {
  'use strict';
  const id = document.currentScript?.dataset.measurementId;
  if (!/^G-[A-Z0-9]+$/.test(id || '') || window.liebreAnalyticsLoaded) return;
  window.liebreAnalyticsLoaded = true;
  const key = 'liebre-analytics-choice-v2';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let started = false;
  let es = new URLSearchParams(location.search).get('lang') === 'en' || location.hash === '#en' ? false : document.documentElement.lang.startsWith('es');
  const translations = { es: {
    title: 'Anal\u00edtica opcional',
    description: 'Google Analytics nos ayuda a medir visitas y contactos, sin enviar sus respuestas del formulario. Solo se activa si lo permite. Rechazar no limita el sitio.',
    allow: 'Permitir anal\u00edtica', decline: 'Rechazar',
    notice: 'Aviso de privacidad', settings: 'Privacidad', close: 'Cerrar'
  }, en: {
    title: 'Optional analytics',
    description: 'Google Analytics helps us measure visits and contacts, without sending your form answers. It runs only if you allow it. Declining does not limit the site.',
    allow: 'Allow analytics', decline: 'Decline',
    notice: 'Privacy notice', settings: 'Privacy', close: 'Close'
  }};
  let labels = translations[es ? 'es' : 'en'];

  function savedChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && value.expires > Date.now() && ['granted', 'denied'].includes(value.status) ? value.status : null;
    } catch (_) { return null; }
  }

  // Use only known campaign labels and validated Google click IDs.
  function measuredLocation() {
    const value = new URL(location.origin + location.pathname);
    if (campaign) {
      value.searchParams.set('utm_campaign', campaign);
      value.searchParams.set('utm_source', campaign === 'ma_probono_referral' ? 'referral' : 'google');
      value.searchParams.set('utm_medium', campaign === 'ma_probono_referral' ? 'referral' : 'cpc');
    }
    for (const name of ['gclid', 'gbraid', 'wbraid']) {
      const v = params.get(name);
      if (v && /^[A-Za-z0-9_-]{1,256}$/.test(v)) value.searchParams.set(name, v);
    }
    return value.href;
  }

  function measuredReferrer() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; }
    catch (_) { return ''; }
  }

  // Campaign labels are public marketing metadata, never intake answers.
  const campaigns = Object.freeze({
    bia_appeals: 'US', bia_appeals_national: 'US',
    bia_appeals_tx: 'TX', bia_appeals_ny: 'NY', bia_appeals_nj: 'NJ',
    bia_appeals_ny_nj: 'NY_NJ',
    ma_immigration_es: 'MA', ma_employment_es: 'MA', ma_probono_referral: 'MA',
    uscis_work_permit_nj_es: 'NJ', uscis_help_us_es: 'US', tracking_qa: 'QA'
  });
  const attributionKey = 'liebre-campaign-v1';
  const params = new URLSearchParams(location.search);
  const campaignFromURL = params.get('utm_campaign');
  let campaign = Object.hasOwn(campaigns, campaignFromURL || '') ? campaignFromURL : '';
  const hasAdClick = ['gclid', 'gbraid', 'wbraid'].some(name => /^[A-Za-z0-9_-]{1,256}$/.test(params.get(name) || ''));
  const confirmations = new Set();
  let formStarted = false;

  function rememberCampaign() {
    try {
      if (campaign) sessionStorage.setItem(attributionKey, JSON.stringify({campaign, expires: Date.now() + 30 * 60 * 1000}));
    } catch (_) {}
  }

  function restoreCampaign() {
    if (campaign || hasAdClick || params.has('utm_campaign')) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(attributionKey));
      if (saved?.expires > Date.now() && Object.hasOwn(campaigns, saved.campaign)) campaign = saved.campaign;
    } catch (_) {}
  }

  function campaignCode() { return campaign || (hasAdClick ? 'google_ads_unassigned' : 'unattributed'); }
  function market() { return campaigns[campaign] || 'unassigned'; }
  function pageType() {
    if (location.pathname === '/uscis-help.html') return 'uscis';
    if (location.pathname === '/bia-appeals.html') return 'appeals';
    if (location.pathname === '/' || location.pathname === '/index.html') return 'intake';
    return 'other';
  }

  function measure(name, method) {
    try {
      if (!started || window['ga-disable-' + id] || typeof window.gtag !== 'function') return false;
      const event = campaign === 'tracking_qa' ? 'qa_' + name : name;
      const values = {
        send_to: id, campaign_code: campaignCode(), campaign_market: market(),
        page_type: pageType(), page_location: measuredLocation(), page_referrer: measuredReferrer()
      };
      if (['phone', 'text', 'email', 'form', 'whatsapp'].includes(method)) values.contact_method = method;
      if (campaign === 'tracking_qa') values.debug_mode = true;
      window.gtag('event', event, values);
      return true;
    } catch (_) { return false; }
  }

  // Receipt is used only in memory to prevent duplicate counting. Never send it to Google.
  window.liebreTracking = Object.freeze({
    sourceNote() {
      return '[Campaign: ' + campaignCode() + '; target market: ' + market() + ' (not verified residence)]';
    },
    formSuccess(receipt) {
      if (typeof receipt !== 'string' || !receipt.trim() || receipt.length > 128 || confirmations.has(receipt)) return false;
      confirmations.add(receipt);
      return measure('generate_lead', 'form');
    },
    formError() { return measure('liebre_form_error', 'form'); }
  });

  function decorateLink(link) {
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || !['/', '/index.html', '/bia-appeals.html', '/employment.html', '/south-africa.html', '/uscis-help.html'].includes(url.pathname)) return;
      if (campaign && !url.searchParams.has('utm_campaign')) {
        url.searchParams.set('utm_campaign', campaign);
        url.searchParams.set('utm_source', campaign === 'ma_probono_referral' ? 'referral' : 'google');
        url.searchParams.set('utm_medium', campaign === 'ma_probono_referral' ? 'referral' : 'cpc');
      }
      // Click IDs follow only after analytics consent; never add them to intake answers.
      if (started && !window['ga-disable-' + id]) {
        for (const name of ['gclid', 'gbraid', 'wbraid']) {
          const value = params.get(name);
          if (value && /^[A-Za-z0-9_-]{1,256}$/.test(value) && !url.searchParams.has(name)) url.searchParams.set(name, value);
        }
      }
      if (url.href !== link.href) link.setAttribute('href', url.href);
    } catch (_) {}
  }

  function decorateLinks() { document.querySelectorAll('a[href]').forEach(decorateLink); }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    decorateLink(link);
    const href = link.getAttribute('href') || '';
    const method = href.startsWith('tel:') ? 'phone' : href.startsWith('sms:') ? 'text' : href.startsWith('mailto:') ? 'email' : href.startsWith('https://wa.me/17817410936') ? 'whatsapp' : '';
    if (method) measure('liebre_contact_click', method);
  }, true);
  document.addEventListener('focusin', event => {
    if (!formStarted && event.target.closest?.('form') && measure('liebre_form_start', 'form')) formStarted = true;
  });
  // React adds the form and navigation after this deferred script loads.
  new MutationObserver(decorateLinks).observe(document.body, {childList: true, subtree: true});
  decorateLinks();

  function start() {
    if (started) return;
    if (!['liebrelaw.com', 'www.liebrelaw.com'].includes(location.hostname)) return;
    restoreCampaign();
    started = true;
    rememberCampaign();
    decorateLinks();
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
    #liebre-privacy-panel{box-sizing:border-box;position:relative;max-width:1100px;margin:24px auto 70px;padding:14px 16px;background:#f8f6ef;color:#173b35;border:1px solid #9aa99e;border-radius:8px;box-shadow:0 8px 36px #0003;font:15px/1.5 Arial,sans-serif;text-align:left}
    #liebre-privacy-panel[hidden]{display:none}
    #liebre-privacy-panel h2{margin:0 32px 8px 0;font:bold 16px/1.3 Arial,sans-serif;color:#173b35}
    #liebre-privacy-panel p{margin:0 0 7px;font:13px/1.4 Arial,sans-serif;color:#173b35}
    #liebre-privacy-panel a{color:#173b35;text-decoration:underline;font-size:14px}
    #liebre-privacy-panel .liebre-privacy-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}
    #liebre-privacy-panel button,#liebre-privacy-settings{font:600 14px/1.3 Arial,sans-serif;cursor:pointer;border:1px solid #173b35;border-radius:4px;padding:10px 16px;min-height:44px;background:#f8f6ef;color:#173b35}
    #liebre-privacy-panel button:hover,#liebre-privacy-settings:hover{background:#e9eddf}
    #liebre-privacy-panel button:focus-visible,#liebre-privacy-panel a:focus-visible,#liebre-privacy-settings:focus-visible{outline:3px solid #b8492d;outline-offset:3px}
    #liebre-privacy-panel .liebre-privacy-close{position:absolute;top:0;right:8px;padding:4px 9px;min-width:40px;min-height:40px;font-size:20px;border:0}
    #liebre-privacy-settings{position:fixed;z-index:9999;bottom:12px;left:16px;padding:7px 12px;font-size:12px;box-shadow:0 2px 8px #0002}
    @media(max-width:480px){#liebre-privacy-panel{margin:20px 16px 70px;padding:12px 14px}#liebre-privacy-panel .liebre-privacy-actions button{flex:1}}
  `;
  document.head.appendChild(style);
  const panel = document.createElement('section');
  panel.id = 'liebre-privacy-panel';
  panel.setAttribute('role', 'region');
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
  // Keep the prompt aligned with the visitor's visible language selection.
  function refreshPrivacyLanguage() {
    es = location.hash === '#es' || (location.hash !== '#en' && document.documentElement.lang.startsWith('es'));
    labels = translations[es ? 'es' : 'en'];
    heading.textContent = labels.title;
    description.textContent = labels.description;
    notice.textContent = labels.notice;
    notice.href = '/privacy.html' + (es ? '#es' : '#en');
    allow.textContent = labels.allow;
    decline.textContent = labels.decline;
    close.setAttribute('aria-label', labels.close);
    settings.textContent = labels.settings;
  }
  new MutationObserver(refreshPrivacyLanguage).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  window.addEventListener('hashchange', refreshPrivacyLanguage);

  function hide() { panel.hidden = true; settings.setAttribute('aria-expanded', 'false'); }
  function choose(status) {
    try { localStorage.setItem(key, JSON.stringify({status, expires: Date.now() + lifetime})); } catch (_) {}
    hide(); settings.focus();
    if (status === 'granted') start();
    else {
      window['ga-disable-' + id] = true;
      clearAnalyticsCookies();
      try { sessionStorage.removeItem(attributionKey); } catch (_) {}
      if (started) location.reload();
    }
  }
  allow.addEventListener('click', () => choose('granted'));
  decline.addEventListener('click', () => choose('denied'));
  close.addEventListener('click', () => { hide(); settings.focus(); });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { hide(); settings.focus(); } });
  settings.addEventListener('click', () => { panel.hidden = false; settings.setAttribute('aria-expanded', 'true'); panel.scrollIntoView({block:'center'}); allow.focus({preventScroll:true}); });
  const choice = savedChoice();
  panel.hidden = choice !== null || location.pathname === '/privacy.html';
  settings.setAttribute('aria-expanded', String(!panel.hidden));
  if (choice === 'granted') start();
  else { window['ga-disable-' + id] = true; clearAnalyticsCookies(); try { sessionStorage.removeItem(attributionKey); } catch (_) {} }
})();


