# Estándar de las herramientas web LOPDP de TempoLegal

Versión 3, 30 de octubre de 2026. Incluye las correcciones del panel de revisión (arte, textos, conversión y QA) del 30/10. Por ahora las tres herramientas son solo de TempoLegal (tempolegal.com). Siguen siendo independientes y comparten estilo, cifras y textos.

| Herramienta | Versión vigente | Dirección |
|---|---|---|
| Calculadora de multas | 2026-10-30-CALCULADORA-MULTAS-LOPDP-V22.html | tempolegal.com/herramientas/calculadora-multas-lopdp/ |
| Calculadora de Delegado | 2026-10-30-CALCULADORA-DELEGADO-LOPDP-V3.html | tempolegal.com/herramientas/calculadora-delegado-lopdp/ |
| Diagnóstico LOPDP | 2026-10-30-DIAGNOSTICO-LOPDP-TEMPOLEGAL-V3.html | tempolegal.com/herramientas/diagnostico-lopdp/ |

Cada archivo lleva su nombre, versión y fecha dentro del código (`<meta name="tl-version">`), y cada una enlaza a las otras dos desde el pie.

## Cifras (las tres dicen lo mismo)

| Dato | Valor publicado |
|---|---|
| Sistemas implementados | 130 |
| Organizaciones con TempoLegal como Delegado | más de 60 (+60) |
| Organizaciones asesoradas | +250 |
| Fecha de corte | octubre de 2026 |
| Sanciones de la SPDP | USD 744.473 en cuatro resoluciones sancionatorias, contra LigaPro y la FEF |
| Plazo de implementación | 8 a 12 días hasta entregar el sistema implementado y auditado (no se escribe "cumplido": es una promesa jurídica absoluta) |
| Plazo del Delegado | venció el 26 de mayo de 2026 |
| Respuesta | un abogado escribe normalmente el mismo día hábil |

## Honorarios públicos (base comercial TempoLegal; siempre "desde" y + IVA)

| Servicio | Precio |
|---|---|
| Implementación LOPDP | desde USD 390,00 + IVA, pago único |
| Delegado de Protección de Datos externo | desde USD 95,00 + IVA/mes |
| Auditoría de cumplimiento | desde USD 149,99 + IVA, pago único |
| Implementación + un año de Delegado (calculadora de Delegado) | desde USD 1.530,00 + IVA |
| Auditoría + implementación (diagnóstico) | desde USD 539,99 + IVA |

Las comparaciones "lo que arriesga equivale a X veces lo que cuesta resolverlo" se cortan en "más de 50 veces" y no se muestran por debajo de 2 veces.

## Contacto

WhatsApp +593 97 888 7392 · info@tempolegal.com · Av. de los Shyris y Eloy Alfaro, Edificio Parque Central, norte de Quito.

## Identidad visual

- Logo refinado del 15 de octubre de 2026 (SVG horizontal a color, incrustado); isotipo como ícono de pestaña.
- Color con sentido, igual en las tres: teal #06738F para la marca y la acción; rojo #d03b3b para lo grave y el monto de la multa; ámbar #e8a317 para lo leve o por revisar; verde #1a9a4a para lo que está bien; azul profundo #155464 como apoyo.
- Etiquetas del encabezado: "Gratis" en verde, la duración en ámbar, "Sin dejar datos para empezar" en teal.
- Misma cabecera, antetítulo "Ley Orgánica de Protección de Datos Personales · Ecuador", título con acento en teal, bloque de cifras y pie con descargo.
- Montos siempre "USD 8.280", nunca "$8.280". Sin emojis, sin modo oscuro, sin CumpliDatos.

## Textos fijos

- Encima de toda cifra: "Estimación referencial · no es asesoría legal".
- Botón de WhatsApp: "Conversar con un abogado por WhatsApp" (en multas el cierre dice "Quiero hablar con un abogado").
- Botón del formulario: "Enviarme el informe". Lo que se entrega se llama "informe".
- Nunca se dice que algo no le aplica: "todo apunta a que le corresponde" o "hay que revisarlo con un abogado".
- Selección de opciones siempre en teal; el rojo queda solo para gravedad y montos de multa.
- Evento único de conversión para Meta/GTM: `tl_lead` en el dataLayer (lo emiten las tres en cada formulario, rescate y clic de WhatsApp), con el detalle en `origen`.

## Captura de datos

Un solo Apps Script (`2026-10-29-CAPTURA-LEADS-APPS-SCRIPT-V1.gs`) recibe los contactos de las tres herramientas, los guarda en la hoja "Leads" y avisa a info@tempolegal.com. Instalación en la guía de publicación.

## Pendientes

1. Instalar el Apps Script y pegar la URL en las tres (sin eso el contacto se pierde).
2. Mencionar en la política de privacidad que estos datos se guardan en Google, fuera del Ecuador.
3. Confirmar las direcciones finales en tempolegal.com.
