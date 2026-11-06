# TempoLegal — Separación de calculadoras (revisión 2026-11-06)

## Qué se ha separado

Se ha extraído, sin modificar una sola instrucción del código original, el JavaScript funcional embebido en las tres calculadoras. Las versiones ES/EN/PT/FR apuntan a **los mismos archivos de ejecución** en `calculator-core/`:

- `multas-runtime-1.js`: flujo, validaciones, cálculo y visualización existentes de Multas V22.
- `delegado-runtime-1.js` y `delegado-runtime-2.js`: cuestionario y resultados del Delegado V3.
- `diagnostico-runtime-1.js`: cuestionario, evaluación y resultados de Diagnóstico V3.
- `interface.css`: **solo presentación**. El rediseño se comparte entre las 12 páginas.

Se conservan los identificadores HTML originales y el orden de ejecución de scripts; los 12 HTML ya no contienen copias redundantes de la lógica principal.

## Estado y límites

Esta separación de archivos es una **primera fase arquitectónica**. El runtime heredado todavía mezcla algunas decisiones de presentación y manipulación del DOM con las fórmulas. Para obtener motores totalmente puros (`calcular(entradas) → resultado`) se requiere identificar funciones y dependencias internas y crear pruebas de regresión con casos reales. No se afirma todavía equivalencia funcional probada en navegador ni traducción completa de resultados dinámicos.

## Cómo probar

Servir desde la raíz del proyecto con Live Server (evitar `file://`), abrir cada calculadora en ES/EN/PT/FR, completar casos de prueba idénticos antes y después de la separación, comparar cálculos, mensajes y estados de formulario. Comprobar consola del navegador y vista móvil. No publicar sin validación legal/funcional.
