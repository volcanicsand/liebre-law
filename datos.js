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
  "consulta_min": "30",
  "bia_tarifa": "$1,060",
  "bia_tarifas_desde": {
    "es": "1 de octubre de 2026",
    "en": "October 1, 2026"
  },
  "bia_mocion_tarifa": "$1,060",
  "bia_mocion_tarifa_reducida": "$950",
  "corte_mocion_tarifa": "$1,095",
  "bia_cheques_fin": {
    "es": "23 de febrero de 2026",
    "en": "February 23, 2026"
  },
  "bia_exencion_cura_dias": "15",
  "bia_escrito_dias": "20",
  "bia_escrito_dias_anterior": "21",
  "bia_regla_fecha": {
    "es": "9 de marzo de 2026",
    "en": "March 9, 2026"
  },
  "bia_amica_fecha": {
    "es": "8 de marzo de 2026",
    "en": "March 8, 2026"
  },
  "bia_decision_dias_1": "90",
  "bia_decision_dias_3": "180",
  "bia_reconsiderar_dias": "30",
  "bia_reabrir_dias": "90",
  "pfr_dias": "30",
  "eoir26_edicion": {
    "es": "marzo de 2026",
    "en": "March 2026"
  },
  "honorarios_apelacion_inicial": "$1,000",
  "honorarios_apelacion_total": "$3,200"
};
(function(){var D=window.LIEBRE_DATOS;document.querySelectorAll("[data-dato]").forEach(function(el){var v=D[el.dataset.dato];if(v==null)return;if(typeof v==="object"){var lang=(el.closest("[lang]")||document.documentElement).lang||"es";v=v[lang]||v.es;}el.textContent=v;});})();
