# Auditoría técnica de las tres calculadoras LOPDP

## Alcance real

Las tres calculadoras contienen **código suficiente para recuperar reglas, catálogos, parámetros, preguntas y algoritmos originales**. Se han creado motores ESM independientes de la interfaz en `calculator-core/pure/`. Las páginas HTML existentes siguen apuntando a los runtimes heredados: no se ha sustituido su comportamiento hasta completar regresión y revisión jurídica.

## 1. Multas V22 — `calcularMultas`

**Entradas:** `sector`, `persona`, `trab`, `cli`, `titulares`, `categorias`, `vdn` (facturación anual sin IVA), `cumple[]`, `incidente`, `spdp`; modalidad `rapido` o `detalle`.

**Flujo:** perfil de actividad y cantidad aproximada de titulares → MTGE de seis dimensiones (titulares, volumen, categorías, frecuencia, permanencia y alcance) → detección de obligaciones por sector y características → puntuación de cumplimiento ponderada → identificación de obligaciones no declaradas → estimación de sanciones por cada obligación y sumatorias.

- `MTGE`: se suman puntos de seis factores; `granEscala` requiere `total >= 6` y categoría de titulares distinta de `a`.
- `score = round(100 * pesosCumplidos / pesosAplicables)`; `pdi = 100 - score`.
- Infracción leve: rango modelado **0,1 % a 0,7 %** de `vdn`; grave: **0,7 % a 1 %**.
- `severity`: calcula un factor de impacto e intencionalidad e incorpora reincidencia y datos del contacto con autoridad; usa catalizador `2`.
- `fineFor`: estima un punto base entre mínimo y máximo y lo acota por severidad. `total` suma obligaciones declaradas como pendientes; no es una sanción oficial ni necesariamente acumulable en un expediente.
- Precio de referencia de los servicios: Delegado 95 USD/mes, Auditoría 149,99 USD, Implementación 390 USD; son datos **comerciales editables**.

**Parámetros completos:** `parametrosMultas`, con `RATES`, `SECTORES`, `TRAB`, `CLI`, `DUTIES`, `MTGE` y `SERVICIOS`.

## 2. Delegado V3 — `calcularDelegado`

**Entradas:** `tit` (volumen de titulares), `cam[]` (categorías), `fre` (frecuencia), `per` (permanencia), `alc` (alcance), `sec[]` (actividades sectoriales), `dir[]` (tratamientos específicos), `fac` (tramo de facturación), `ya` (delegado ya designado).

**Flujo:** puntuación por seis factores → revisión de sectores y actividades que activan obligación → clasificación (`ok`, `si` o `rev`) → estimación de multa, inversión y comparación → lista de obligaciones.

- El criterio central codificado es `corresponde = sectoresDetectados || actividadesDetectadas || puntuacion >= 6` (el indicador `publico` está fijado en `false` en esta versión).
- Puntaje cercano si `4 <= puntuación < 6` sin criterios sectoriales/directos; la salida mostrada sigue requiriendo revisión.
- Grave estimada: tramo de **0,7 % a 1 %** de facturación, sujeto a opciones de facturación declaradas.
- Inversión: auditoría 149,99 USD; implementación 390 USD; Delegado 95 USD/mes multiplicado por 12 si aplica.

**Parámetros completos:** `parametrosDelegado` (`SEC`, `DIR`, `CAM`, `DIM`, `FAC`, `YA`, `CONFIG`, `N`). **Atención:** los textos de los catálogos y las afirmaciones legales no deben asumirse vigentes sin revisión especializada.

## 3. Diagnóstico V3 — `calcularDiagnostico`

**Entradas:** respuestas por pregunta `tam`, `fact`, `sens`, `disp`, `dpd` (condicional si hay biometría), `contratos`, `gestion`. Para generar respuestas estables usar `respuestasDiagnosticoDesdeIndices` y los índices de `QUESTIONS`.

**Flujo:** recomputación de flags y carencias desde opciones → matriz de seis frentes → nivel de riesgo con criterios de prioridad → catálogo deduplicado de infracciones → rangos estimados según base de facturación.

- Niveles por puntaje: 1 si menos de 4; 2 desde 4; 3 desde 8; 4 desde 12; 5 desde 15, **con ajustes adicionales** por alertas críticas, observaciones e infracciones graves.
- Frente de riesgo: datos sensibles, dispositivos, contratos, solicitudes de titulares, IA, transferencias internacionales.
- Gravedad del catálogo: `grave` usa **0,7 %–1 %** por entrada y `leve` **0,1 %–0,7 %** por entrada. La sumatoria es un escenario heurístico.
- No devuelve diagnóstico final cuando faltan preguntas obligatorias; se marca `completo:false` con `faltantes[]` para evitar mostrar “sin hallazgos” con cero respuestas.

**Parámetros completos:** `parametrosDiagnostico` (`QUESTIONS`, `GAPS`, `CATALOGO`, `N`, `CONFIG`).

## Integración futura del nuevo frontend

1. Crear el nuevo componente visual siguiendo el diseño TempoLegal (pasos, feedback, validaciones accesibles, estados, resumen). 2. Recoger respuestas en objetos de entrada inmutables. 3. Importar el `.mjs` correspondiente y ejecutar la función pura. 4. Renderizar resultados y traducciones mediante diccionarios de presentación (ES/EN/PT/FR), sin alterar las reglas. 5. Comparar resultados con las calculadoras heredadas y conseguir aprobación jurídica antes de reemplazarlas.

## Riesgos y controles

- Las referencias normativas, umbrales, plazos, multas y precios incluidos son los existentes **en el código heredado**, no certificaciones legales nuevas.
- Hay afirmaciones legales contundentes en el contenido original (por ejemplo, automatismos de DPD, transferencia por servicios de nube) que requieren verificación por abogados antes de publicación.
- No enviar datos personales a servicios externos durante las pruebas; los motores puros no realizan solicitudes ni utilizan `window`, `document`, `fetch` ni cookies.
- El análisis es de código y salidas de los motores; falta regresión frente a la interfaz original en navegador.
