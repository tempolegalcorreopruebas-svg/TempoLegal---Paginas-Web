# Integración de Antony sobre Rubén

Preparada el 27 de octubre de 2026. Esta es una copia de revisión; no se ha publicado la web ni se han modificado ramas remotas de GitHub.

## Referencias verificadas

- Repositorio: `tempolegalcorreopruebas-svg/TempoLegal---Paginas-Web`.
- Base de Rubén: `97212361a701f37fbef66c141eddd955741daaa6`.
- Cambios de Antony: `47feb9ae62ab4c9e3b27b30b4623dde085c74a46`.
- Ancestro común: `62704b3a5079b320f235c21fe6db19930524cbcc`.
- Rama local de integración: `integration/antony-on-ruben`.
- El ZIP entregado por el usuario coincide con la base de Rubén en contenido. Hay 112 archivos con diferencias únicamente de finales de línea de Windows. No se importó la carpeta `.git` del ZIP.

## Conservado de la versión de Rubén

- 377 archivos existentes de estilos, imágenes, fuentes y recursos gráficos, sin cambios de contenido; se normalizan los finales de línea al comparar los archivos de texto.
- Orden y estructura de la portada: cifras, clientes, cuatro servicios principales con desplegable, enfoque, cobertura, casos, testimonios completos desplegables, equipo, método, lecturas y contacto.
- Sus cinco responsables de área, fotografías proporcionadas y fotografía conjunta, sin edición de píxeles ni sustitución de archivos. Esta integración no vuelve a certificar el origen o las autorizaciones de esas fotografías.
- Su pie organizado por familias, páginas de protección de datos y herramientas LOPDP.
- Sus textos, precios y presentación de servicios en español, enlazándolos con las páginas de detalle incorporadas.
- Su menú móvil y los controles y animaciones existentes.

## Incorporado de Antony

- Diez páginas de servicios, Nosotros y Contacto y sus versiones en cuatro idiomas.
- Artículos internos y navegación hacia los documentos diseñados.
- Recepción PHP/SMTP preparada, revisión de la solicitud, validación, prevención de abuso y duplicados y mensajes de resultado. Se conserva el teléfono opcional de Rubén y se incorpora a la revisión, WhatsApp, correo y validación del servidor.
- SEO técnico, canonical, idiomas, datos estructurados, 25 redirecciones y sitemap. El inventario conjunto incluye 131 páginas canónicas: las 120 de Antony y las 11 páginas/herramientas españolas de Rubén. No se inventaron traducciones de estas últimas.
- Originales legales íntegros y traducciones de Términos identificadas para revisión jurídica.
- Consentimiento independiente para mapas y analítica, retirada de permisos y medición preparada pero desactivada.
- Navegación desde archivos locales que abre cada documento directamente.

## Cómo se resolvieron los conflictos

La fusión produjo 19 archivos con conflictos: portada, configuración, contenido, mejoras de interfaz, artículos, casos, perfiles y documentos legales compartidos. Se conservaron los cuerpos y la estructura de Rubén y se adaptaron las adiciones funcionales y de navegación de Antony; no se eligió una rama completa sobre la otra.

Se corrigieron referencias a elementos del radar y sectores que ya no están en la portada de Rubén. Las herramientas y sus archivos reutilizables se conservan. También se repararon 12 acciones de Contacto que apuntaban a una sección inexistente y se conectaron las lecturas locales. Se unificó el control del mapa para que la retirada de permiso funcione también en las páginas de protección de datos.

Los archivos compartidos HTML y JavaScript sí cambian para integrar funciones y enlaces. La conservación del diseño no significa que todos los archivos permanezcan idénticos. Los textos legales españoles conservan íntegro su contenido, comprobado frente a la base suministrada.

## Formulario: ubicación privada

La rama Antony contenía el endpoint público, pero no su implementación privada. La fuente necesaria se añade en `server/tempo-private/`, con acceso web denegado en `.htaccess` y sin credenciales reales. Al instalar en Hostinger, copiar esa carpeta a una ubicación hermana de `public_html`, llamada `tempo-private`, fuera de la raíz pública, como espera `api/contact.php`. El directorio `server/` es material de instalación; no debe publicarse como contenido del sitio.

No se activó SMTP ni se enviaron correos externos. El formulario sigue informando que el envío directo no está disponible mientras el servidor no se configure.

## Comprobaciones realizadas

- 377 recursos y estilos de Rubén conservados; sin destinos locales inexistentes ni conflictos pendientes.
- Sintaxis de los JavaScript principales revisada.
- Texto de los documentos legales españoles conservado.
- 52 comprobaciones locales del formulario y 162 de consentimiento/medición, con proveedores simulados y sin envíos externos.
- 46 comprobaciones del servicio PHP y 4 adicionales del teléfono opcional; ninguna conexión SMTP externa.
- 524 comprobaciones en navegador: 131 páginas a 320, 390, 768 y 1440 píxeles, sin desbordamiento horizontal ni imágenes cargadas rotas. Preferencias de privacidad operativas y tecnologías opcionales bloqueadas antes del permiso.
- Revisión manual del formulario en la portada de Rubén: preparación y visualización de consulta, teléfono y canales alternativos, sin enviar el mensaje.
- Navegación local contrastada con raíces de archivos simuladas, incluida una ruta Windows con espacios. No equivale a una sesión nativa en el ordenador del usuario.

Las pruebas en vista previa no ejecutan PHP ni las redirecciones Apache. Antes de producción siguen pendientes SMTP, inspección de la propiedad real de GA4, conciliación de la política con las tecnologías finales, revisión jurídica y visual de la firma y aprobación de publicación. Se conserva `noindex`. Las páginas históricas de laboral, preguntas frecuentes y marcas siguen pendientes de migración completa; protección de datos ahora está cubierta por la página de Rubén. Falta cotejar el inventario completo de WordPress.

Los informes anteriores describen sus entregas originales. Este documento rige el estado de la integración.
