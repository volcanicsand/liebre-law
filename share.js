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
// Liebre Law · WhatsApp al abogado: abre el chat con un mensaje inicial en el idioma de la página.
(function(){
  function prefill(){
    var h=location.hash, forced=(h==='#en')?'en':(h==='#es'?'es':null);
    var t=document.title.replace(/\s*\|\s*Liebre Law\s*$/,'');
    document.querySelectorAll('a[href^="https://wa.me/17817410936"]').forEach(function(a){
      var c=a.closest('[lang]'); var l=forced||(c&&c.lang)||document.documentElement.lang||'es';
      var msg=(l.indexOf('es')===0)?('Hola. Leí «'+t+'» en liebrelaw.com. Mi situación: '):('Hi. I read "'+t+'" on liebrelaw.com. My situation: ');
      a.href='https://wa.me/17817410936?text='+encodeURIComponent(msg);
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',prefill);}else{prefill();}
  addEventListener('hashchange',prefill);
})();
