// Liebre Law · números que cambian (tarifas, plazos). Un solo lugar para actualizar.
// Cada clave puede ser un texto o {es, en}. Los elementos con data-dato="clave" se actualizan al cargar.
window.LIEBRE_DATOS = {
  "actualizado": {
    "es": "10 de noviembre de 2026",
    "en": "November 10, 2026"
  },
  "tarifas_vigentes_desde": {
    "es": "16 de octubre de 2026",
    "en": "October 16, 2026"
  },
  "i589_tarifa": "$100",
  "aaf_tarifa": "$105",
  "aaf_plazo_dias": "30",
  "ead_inicial": "$570",
  "ead_renovacion": "$275",
  "ead_dias_presentar": "150",
  "ead_dias_aprobar": "180",
  "pruebas_dias_antes": "14",
  "reprogramar_dias": "10",
  "reprogramar_desde": {
    "es": "21 de agosto de 2026",
    "en": "August 21, 2026"
  },
  "referido_sin_entrevista_desde": {
    "es": "28 de julio de 2026",
    "en": "July 28, 2026"
  },
  "bia_apelacion_dias": "30",
  "corte_pruebas_dias": "30",
  "i730_anos": "2",
  "i485_anos": "1",
  "consulta": "$150",
  "consulta_min": "30"
};
(function(){var D=window.LIEBRE_DATOS;document.querySelectorAll("[data-dato]").forEach(function(el){var v=D[el.dataset.dato];if(v==null)return;if(typeof v==="object"){var lang=(el.closest("[lang]")||document.documentElement).lang||"es";v=v[lang]||v.es;}el.textContent=v;});})();
