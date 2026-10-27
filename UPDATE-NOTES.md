# 26 octubre 2026 — Textos de HOME V05 en la HOME española

Fuente: `ACTUALIZACION_DPD_DPO_HOME_2026-10-26/01_HOME/HOME_V05_REVISADA_2026-10-26` (Cambios_antes_despues.md y la maqueta). Solo se modifica la versión española. El diseño y los estilos originales se conservan. Respaldo previo: `_respaldos/BASE_ANTES_HOME_V05_2026-10-26.zip`.

Cambios en `index.html` y en el bloque `es` de `content.js`:
- Title, Open Graph, Twitter y JSON-LD con "Quito y Ecuador", y la nueva meta descripción.
- Hero con "un equipo jurídico, contable y tecnológico".
- Encabezado e introducción de servicios.
- Resúmenes de los servicios 01–07; el 05 pasa a llamarse "Constitución de SAS", también en el formulario.
- Precios específicos: DPD externo desde USD 95 + IVA al mes; SAS desde USD 140 + IVA, con su condición.
- H2 de soft landing, primer paso del método, H2 de guías y texto de contacto con respuesta el mismo día hábil.
- Frase ratificada de Eleazar.
- Pie con servicios agrupados en tres familias más "Otras áreas", y los sectores de datos en un desplegable.

Los enlaces del pie apuntan a `#servicios` hasta que existan las páginas. `data-url-publicacion` conserva la URL propuesta en V05.

`enhancements.js` muestra `price`/`priceNote` solo si el servicio los tiene; los demás idiomas no cambian. Los estilos nuevos están en `home-review.css`.

No aplicado: la nota "Explore la selección con las flechas", porque esta HOME usa el carrusel automático, no flechas. Tampoco la línea de apoyo del hero, porque esta HOME ya muestra "Respuesta el mismo día" en el bloque de compromiso.

Comprobado en navegador local:
- Textos renderizados.
- Panel de servicios en escritorio y acordeón en móvil, con precio SAS.
- Pie a 1440 y 360 px y desplegable de sectores.
- Sin desbordamiento a 1440, 390 y 360 px.
- Sin errores de JavaScript en `/` y `/en/`.

Pendiente: revisión visual del titular y traducción EN/PT/FR de estos textos.

# 26 octubre 2026 — Primera integración de HOME española

Borrador estático para revisión visual. No publicado. Seguimiento y respaldo en las carpetas hermanas `_seguimiento/` y `_respaldos/`, fuera de la web pública.

Se conserva la identidad, los archivos CSS originales y los retratos originales. `home-review.css` aplica los ajustes solo a la HOME española. La estructura pasa a doce secciones; cuatro servicios principales y cinco adicionales mediante details nativo. Cinco testimonios con su comienzo literal y ampliación, sin duplicar Eleazar. Cinco fichas de equipo con profesiones separadas del cargo; Rolando queda con fotografía pendiente. Se incorpora la foto grupal suministrada completa, distinta de la pendiente de informática.

Los bloques retirados (radar, protección de datos extenso y FAQ) y sus scripts originales se conservan en la carpeta hermana `_componentes_reutilizables/`; no subir esa carpeta a producción. El radar no se inicializa en la HOME española. Las otras homepages conservan sus componentes.

Servicios, perfiles, testimonios y publicaciones existen en el HTML inicial; los scripts mantienen sus interacciones. La consulta prepara un borrador local: empresa y servicio obligatorios, teléfono opcional, descripción de 10 a 2000 caracteres. No hay confirmación de recepción ni envío automático. La HOME de revisión tiene noindex/nofollow.

Pruebas locales: servicios 4/9/4, cinco citas por teclado, enlace Eleazar, menú móvil/Escape, acordeón, preparación de consulta, 360/390/768/1440 sin desbordamiento observado, contenido y details sin JavaScript, cuatro homepages sin errores JavaScript. Citas cotejadas, enlaces y anclas locales sin faltantes, originales CSS y retratos sin cambios. Estas pruebas no acreditan producción, auditoría integral de accesibilidad ni rendimiento.

Pendientes: aprobación visual, retrato limpio de Rolando, foto específica de los tres informáticos, revisión completa de los 81 controles y de las páginas de servicio, versiones lingüísticas revisadas, integración real futura en WordPress. No ejecutar los generadores históricos sin adaptarlos.

## Notas de la base anterior (conservadas como antecedente)

# Text update with the original presentation restored

The pre-Astra presentation is restored. All CSS files and all files in `assets/team/` match the prior version byte for byte. Existing section order, portrait cards, service panels, mobile accordions, automatic client marquee, Quito pulses, number effects, hero animation and consultation dialog are preserved.

Approved October 2026 information is fitted into existing text locations: business services, soft landing, 250+ organizations, 130+ implementations, 63+ DPO appointments, +20 foreign companies, nine countries, credentials, contact details and legal provider identification. Rolando's confirmed information appears as text in the team introduction; the four original portraits remain in their original positions.

The three case cards retain their presentation and now introduce SOLCA, GMA and CCE. Their detail pages use the established case template. The previous Pazmiño and Asista detail pages remain available. Four article positions remain, including the existing featured biometric article and the three guides specified in the supplied content package.

The supplied privacy policy V4.3 remains intact. Terms and Legal Notice V1.2 use the existing legal-page presentation and reproduce all 33 approved text blocks. Source Word documents are included under `assets/legal/`.

Browser checks covered desktop service selection, mobile accordions, automatic marquee movement, restored animation hooks and responsive page widths. Local asset and page references were checked. The six original interaction and animation scripts are unchanged; case data lookups and contact configuration have only the updates needed by the new copy.

This package is not published. The consultation dialog prepares a local draft for the visitor to review and continue through WhatsApp or email; it does not send messages or reserve an appointment automatically.
