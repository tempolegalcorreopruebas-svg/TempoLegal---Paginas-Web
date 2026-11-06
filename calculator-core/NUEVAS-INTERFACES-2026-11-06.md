# Nuevas interfaces LOPDP — TempoLegal Rubén

Se reemplazaron las páginas HTML antiguas de las tres herramientas en cuatro idiomas (12 documentos) por formularios nuevos de la misma familia visual que TempoLegal.

## Integración

- `pure/multas-engine.mjs` → `calcularMultas`; entradas: actividad, tipo de organización, trabajadores, clientes, facturación anual sin IVA, titulares, categorías, incidentes, autoridad y obligaciones declaradas como cumplidas.
- `pure/delegado-engine.mjs` → `calcularDelegado`; entradas: sectores, actividades, dimensiones de tratamiento, categorías, facturación por tramo y designación previa.
- `pure/diagnostico-engine.mjs` → `calcularDiagnostico` mediante `respuestasDiagnosticoDesdeIndices`; incluye la pregunta DPD solo si hay biometría/rastreo según los criterios heredados.
- `new-interface.mjs` contiene el formulario y el adaptador de datos; `new-interface.css` contiene solo la presentación.
- Los `*-runtime*.js` heredados se conservan sin ser cargados por las interfaces nuevas; sirven para comparar resultados.

## Estado de pruebas

- Se ejecutaron 20 pruebas existentes de motores puros: correctas.
- Se validó la sintaxis del nuevo módulo JavaScript.
- Se revisaron las 12 páginas y la existencia de todos los recursos y enlaces locales: sin faltantes detectados.
- No se pudo realizar un recorrido visual automatizado: Chromium devolvió `ERR_BLOCKED_BY_ADMINISTRATOR` al acceder al servidor de pruebas del entorno. **No declarar comprobado el uso en navegador.**
- **Pendiente crítica:** pruebas de equivalencia funcional con las pantallas anteriores en casos reales y revisión jurídica de los umbrales, disposiciones, textos y sanciones.
- Se tradujo el armazón de las interfaces a ES/EN/PT/FR. Algunos catálogos de preguntas y las explicaciones detalladas de resultados aún proceden del motor español y requieren traducción jurídica profesional para cada idioma.
- Mantener `noindex` hasta verificar contenido, resultados, accesibilidad, navegación, locales y aprobación jurídica.

## Cómo probar

Abrir la raíz del proyecto con Live Server, no mediante `file://`. Navegar a `herramientas/calculadora-multas-lopdp/index.html`, `herramientas/calculadora-delegado-lopdp/index.html`, y `herramientas/diagnostico-lopdp/index.html` y sus versiones bajo `en`, `pt`, `fr`. Completar rutas normales, 'ninguna obligación', sectores vacíos, ingresos cero y diagnóstico sin/con biometría. Comparar cada resultado numérico y condición con el motor anterior.
