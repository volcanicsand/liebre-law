(() => {
  const series = {"family": [10.2, 10.3, 11.8, 11.7, 14.4], "green": [12.9, 10.6, 11.4, 8.9, 7.4]};
  const articles = [...document.querySelectorAll('article[lang]')];
  function setLanguage() {
    const lang = location.hash.startsWith('#en') ? 'en' : location.hash.startsWith('#es') ? 'es' : document.documentElement.lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = lang;
    articles.forEach(a => { a.hidden = a.lang !== lang; });
    document.querySelectorAll('.top a').forEach(a => a.setAttribute('aria-current', a.lang === lang ? 'true' : 'false'));
    document.title = (lang === 'en' ? 'USCIS resources & attorney help' : 'Recursos de USCIS y ayuda de un abogado') + ' | Liebre Law';
  }
  articles.forEach(article => {
    const select = article.querySelector('.category');
    function draw() {
      const bars = article.querySelector('.bars');
      bars.replaceChildren();
      series[select.value].forEach((value, i) => {
        const row = document.createElement('div'); row.className = 'bar-row';
        const year = document.createElement('span'); year.textContent = 2021 + i;
        const track = document.createElement('span'); track.className = 'track';
        const bar = document.createElement('span'); bar.className = 'bar'; bar.style.width = (value / 16 * 100) + '%';
        const number = document.createElement('strong'); number.textContent = value.toFixed(1);
        track.append(bar); row.append(year, track, number); bars.append(row);
      });
    }
    select.addEventListener('change', draw); draw();
    const boxes = [...article.querySelectorAll('.checks input')];
    const counter = article.querySelector('.check-count');
    function count() { counter.textContent = boxes.filter(x => x.checked).length + ' / ' + boxes.length + ' ' + counter.dataset.label; }
    boxes.forEach(box => box.addEventListener('change', count)); count();
    article.querySelector('.clear-checks').addEventListener('click', () => { boxes.forEach(b => { b.checked = false; }); count(); });
    article.querySelector('.print-checklist').addEventListener('click', () => window.print());
  });
  document.documentElement.classList.add('js');
  setLanguage(); window.addEventListener('hashchange', setLanguage);
})();
