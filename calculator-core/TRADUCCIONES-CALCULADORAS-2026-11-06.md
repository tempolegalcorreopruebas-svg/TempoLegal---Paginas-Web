# Calculadoras LOPDP — traducción de extremo a extremo

## Alcance

Se ha integrado un catálogo de traducción para las tres herramientas (Multas, Delegado DPD y Diagnóstico) en español, inglés, portugués y francés. Se traduce en pantalla el contenido de las preguntas, opciones de respuesta, ayuda, controles, estados de evaluación, resultados, títulos de obligaciones y acciones recomendadas. La lógica de cálculo permanece en los tres motores originales.

- `calculator-core/i18n/catalogs.json`: diccionario de textos tomados de las estructuras originales; sus claves son frases originales, no los valores de respuesta.
- `calculator-core/i18n/outcomes.json`: textos traducidos para las evaluaciones y acciones.
- `calculator-core/new-interface-standalone.js`: versión autónoma que contiene tanto motores como interfaz y las traducciones integradas; funciona con archivos locales y HTTP.
- `calculator-core/new-interface.mjs`: fuente de la interfaz modular mantenida de forma coherente.
- `calculator-core/pure/*-engine.mjs`: algoritmos originales, sin cambios.

**Precaución legal:** se traducen explicaciones para uso orientativo, sin cambiar cifras, umbrales o fórmulas. Las reglas de fondo siguen pendientes de revisión jurídica antes de su publicación definitiva.

## Pruebas

- 20 pruebas originales de los motores superadas.
- 52 comprobaciones de renderizado de etapas en 4 idiomas, sin fallos de ejecución.
- 12 comprobaciones de renderizado del resultado final (3 motores x 4 idiomas).
- Se comprobó que los tres motores `.mjs` son idénticos, byte a byte, a la versión anterior.
- Los HTML de las 12 herramientas siguen cargando el mismo runtime compartido y el header/footer existentes.

## Límite de comprobación

La ejecución automatizada de Chromium en este entorno ha bloqueado el servidor de prueba (`ERR_BLOCKED_BY_ADMINISTRATOR`), por lo que deben comprobarse en navegador los estados visuales y la navegación completa. Se recomienda validar los resultados jurídicos/económicos con especialistas antes de producción.
