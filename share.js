// Liebre Law · botón "Compartir": usa el diálogo nativo del teléfono si existe; si no, abre WhatsApp con el enlace.
(function(){
  function langOf(el){var a=el.closest('[lang]');return (a&&a.lang)||document.documentElement.lang||'es';}
  function urlFor(el){var l=langOf(el);return location.origin+location.pathname+'#'+l;}
  function textFor(el){var l=langOf(el);var t=document.title.replace(/\s*\|\s*Liebre Law\s*$/,'');return (l==='es'?'Guía de inmigración, en español: ':'Immigration guide: ')+t+' '+urlFor(el);}
  document.querySelectorAll('[data-share]').forEach(function(a){
    a.href='https://wa.me/?text='+encodeURIComponent(textFor(a));
    a.setAttribute('rel','noopener'); a.setAttribute('target','_blank');
    a.addEventListener('click',function(e){
      if(navigator.share){e.preventDefault();navigator.share({title:document.title,text:textFor(a),url:urlFor(a)}).catch(function(){});}
    });
  });
})();
