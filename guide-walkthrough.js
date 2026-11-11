(() => {
  const articles = [...document.querySelectorAll('main > article[lang]')];
  function reveal() {
    const hash = location.hash;
    const lang = hash === '#en' || hash.startsWith('#en-') ? 'en' : hash === '#main' ? document.documentElement.lang : 'es';
    document.documentElement.lang = lang;
    articles.forEach(a => { a.hidden = a.lang !== lang; });
    document.querySelectorAll('[data-lang]').forEach(a => {
      if (a.dataset.lang === lang) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const target = document.getElementById(hash.slice(1));
    if (target) {
      if (target.matches('details')) target.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
  }
  if (articles.length) {
    reveal();
    addEventListener('hashchange', reveal);
  }
  document.querySelectorAll('[data-choices]').forEach(group => {
    group.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        const area = group.closest('article');
        const panelId = button.getAttribute('aria-controls');
        area.querySelectorAll('[data-followup]').forEach(p => { p.hidden = p.id !== panelId; });
        const panel = document.getElementById(panelId);
        panel.querySelector('h2').focus({ preventScroll: true });
        panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      });
    });
  });
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  document.querySelectorAll('[data-library]').forEach(section => {
    const input = section.querySelector('input[type=search]');
    const filters = [...section.querySelectorAll('[data-filter]')];
    const cards = [...section.querySelectorAll('[data-category]')];
    let filter = 'all';
    function update() {
      const query = normalize(input.value.trim());
      let count = 0;
      cards.forEach(card => {
        const show = (filter === 'all' || card.dataset.category === filter) && normalize(card.textContent + ' ' + (card.dataset.keywords || '')).includes(query);
        card.hidden = !show;
        if (show && !card.matches('li')) count++;
      });
      section.querySelector('[role=status]').textContent = section.closest('[lang]').lang === 'es' ? `${count} ${count === 1 ? "guía" : "guías"}` : `${count} ${count === 1 ? "guide" : "guides"}`;
      const full = section.querySelector('.completas'); const anyFull = full ? [...full.querySelectorAll('li')].some(li => !li.hidden) : false; if (full) full.hidden = !anyFull;
      section.querySelector('[data-empty]').hidden = count !== 0 || anyFull;
    }
    input.addEventListener('input', update);
    filters.forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update();
    }));
    update();
  });
  document.querySelectorAll('[data-checklist]').forEach(section => {
    const checks = [...section.querySelectorAll('input')];
    const status = section.querySelector('[role=status]');
    checks.forEach(check => check.addEventListener('change', () => {
      const count = checks.filter(c => c.checked).length;
      status.textContent = section.closest('[lang]').lang === 'es' ? `${count} de ${checks.length} listos` : `${count} of ${checks.length} ready`;
    }));
  });
})();
// Scroll reveal (added 2026-11-10): sections and cards rise into view once; disabled under reduced motion.
(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('section.content, section.consult, section.detail, .library-grid > *, .step-panel, .checklist > *, .related-grid > a:not(.followup .related-grid a), .detail ol.steps > li, .detail table, .callout');
  let i = 0, lastParent = null;
  targets.forEach(el => {
    if (el.closest('.hero') || el.closest('.followup')) return;
    if (el.parentElement !== lastParent) { i = 0; lastParent = el.parentElement; }
    el.style.setProperty('--i', String(Math.min(i++, 6)));
    el.classList.add('reveal');
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  // anything already in view on load shows immediately
  requestAnimationFrame(() => document.querySelectorAll('.reveal').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }));
})();
