# Panel de revisión de las herramientas LOPDP · 30 de octubre de 2026

Cuatro revisores independientes (dirección de arte, textos comerciales, conversión para Meta Ads y QA técnico móvil) recorrieron las tres herramientas en celular y escritorio, con capturas y volcados de texto de cada pantalla. Encontraron 48 hallazgos; los verifiqué uno por uno y apliqué todos los que bloqueaban o importaban. Versiones resultantes: **Multas V22, Delegado V3, Diagnóstico V3**.

## Lo grave que apareció (y ya está corregido)

1. **El Diagnóstico entregaba un informe mutilado.** Por un error de código, cuatro secciones llegaban vacías a quien ya había dejado su contacto: la multa estimada del propio caso, la comparación de las dos cifras, el detalle multa por multa y el régimen sancionatorio. Era la peor pieza posible para pauta: prometía la cifra y no la mostraba.
2. **El formulario de la calculadora de multas se veía de otra página.** Una línea de CSS dañada desde la V19 dejaba los campos sin estilo, diminutos (30 px) justo en el momento de pedir el contacto. Reconstruido: campos de 50 px, fondo de marca, igual a las otras dos.
3. **El consentimiento del rescate del Delegado se rompía en celular**: el checkbox se estiraba al 100 % y el texto de autorización se salía de la pantalla. En una firma que vende LOPDP, un consentimiento ilegible. Corregido.
4. **La versión del archivo viajaba mal en cada lead de multas** (texto sin resolver en vez de "V22"). Corregido.
5. **"Queda cumplido y auditado" era una promesa jurídica absoluta** (afirmar que el cliente cumple la ley) repetida en las tres. Ahora dice "implementado y auditado": mismo golpe, sin flanco legal. Si prefiere recuperar "cumplido", es un cambio de una palabra, pero no lo recomiendo con pauta encendida.
6. **Quedaban emojis** (lupa, señales de grave/leve) contra la regla de la casa. Fuera; la gravedad ahora la dice el color.

## Lo que mejora la venta (aplicado)

- **La cifra primero.** En multas, el bloque "este es el cálculo rápido / afínelo" estaba ENCIMA de la multa; el primer botón que se ofrecía era más trabajo. Ahora la cifra golpea primero y el "afinar" va después.
- **La tabla de faltas ya no se lee al revés.** Las filas decían "Nombró un Delegado", "Inscribió al delegado…" (en afirmativo) bajo el título "Lo que le falta": el lector cansado entendía lo contrario. Ahora: "Nombrar por escrito a un Delegado…", y la sopa de 22 montos repetidos se redujo a una línea de rangos más el monto por falta.
- **La barra fija de multas servía de poco**: en celular ocultaba el mensaje y pedía un correo a secas. Ahora muestra la cifra ("USD 7.848 en multas · el informe es gratis") con botón de WhatsApp prellenado y botón al formulario.
- **El Delegado no tenía botón de arranque** en el primer pantallazo. Ahora: "Ver si me toca nombrar Delegado". Aun así, es el flujo más largo (8 pasos): para la pauta fría, los destinos son Multas y Diagnóstico; el Delegado recibe tráfico desde las otras dos (los enlaces ya existen).
- **No se llegaba a resultados vacíos**: en multas ya no se puede avanzar sin responder, y el WhatsApp/correo del formulario ahora se validan de verdad (antes "123" pasaba).
- **El rescate de multas saltaba con cualquier cambio de aplicación** (contestar un WhatsApp = modal encima). Ahora solo tras 20 segundos fuera, como en las otras dos.
- **Red de seguridad de leads**: mientras el endpoint no esté instalado, el "gracias" del Delegado y del Diagnóstico ofrece "Asegurar mi informe por WhatsApp" con los datos prellenados: ningún contacto se pierde en silencio.
- **Un solo evento de conversión para Meta: `tl_lead`** en las tres (antes había tres esquemas de nombres y el píxel habría perdido conversiones). En GTM: activador `tl_lead` → evento Lead del píxel.
- Repeticiones que cansaban, podadas: "Superintendencia" (hasta 11 veces por pantalla) alterna con "la autoridad de datos"; el caso LigaPro/FEF se cuenta una sola vez; menos "sin costo".
- Selección de opciones siempre en teal (antes en multas se marcaba en rojo, que se leía como error), títulos que quedaban decapitados bajo la barra en el Delegado, "Expediente" → "Informe" en el Diagnóstico, precios ancla añadidos al cierre del Diagnóstico, barra de WhatsApp del Diagnóstico aparece al primer gesto de scroll, botones de toque pequeños agrandados, fechas y "USD" uniformes.

## Lo que el panel validó (sin tocar)

Trato de usted impecable, cero tuteo; los resultados parecen informe profesional y no página casera; peso excelente para 3G (96–153 KB, cero recursos externos, interactiva en menos de 30 ms); sin desbordes en 320/390/1280 ni en apaisado; impresión limpia; navegable por teclado; wa.me correcto en las tres. Frases que venden y quedaron protegidas: "No es una multa: son 15", "Los papeles listos el día que le toquen la puerta", "Una infracción leve, casi cien mil dólares".

## Pendiente (no es de código)

1. Instalar el Apps Script y pegar la URL `/exec` en las tres (guía para Sistemas, 10 minutos). Con eso el botón de WhatsApp de respaldo del "gracias" desaparece solo.
2. En GTM: activador `tl_lead` → píxel de Meta, evento Lead.
3. Política de privacidad: mencionar que estos datos se guardan en Google.
4. Recomendación de pauta: presupuesto a **Multas** (mejor embudo: 8 toques hasta la cifra) y **Diagnóstico**; el **Delegado** como paso 2 desde las otras, no como destino de anuncio frío.

## Verificación final

Sobre las versiones V22/V3/V3: recorridos completos en celular y escritorio sin un solo error de JavaScript, y simulación exhaustiva de combinaciones de respuestas de los tres motores con revisión del texto pintado en pantalla (sin NaN, sin montos fuera de los rangos legales de los arts. 71 y 72, sin frases que absuelvan, sin emojis, sin tuteo).
