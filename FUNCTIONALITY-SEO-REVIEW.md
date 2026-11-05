# TempoLegal — Funcionamiento, navegación y SEO

**Antecedente de la versión 9.** La etapa posterior está documentada en `LEGAL-MEASUREMENT-REVIEW.md`; el inventario actual tiene 120 páginas canónicas e incluye las traducciones de Términos.

Entrega del 27 de octubre de 2026. Implementación preparada para Hostinger con PHP; sin publicación ni modificación del sitio actual.

## Implementado

- Recepción de consultas mediante un endpoint PHP y SMTP autenticado, con destino configurado en `info@tempolegal.com`.
- Formulario en Contacto y envío explícito después de revisar la consulta en el formulario de la home. Se conserva la continuación por WhatsApp o por la aplicación de correo.
- Validación en el servidor, aceptación expresa para atender la consulta, token de sesión, control de origen, límite de solicitudes, campo antiautomatización e idempotencia.
- Confirmación con referencia únicamente cuando el servidor de correo acepta el mensaje. Una respuesta incierta no genera reenvíos automáticos ni una confirmación ficticia.
- Contexto del radar conservado cuando la consulta procede de esa herramienta.
- Tres lecturas integradas en el proyecto y conectadas desde la home; sus enlaces ya no llevan al sitio antiguo.
- Inventario de 117 páginas canónicas, títulos y descripciones por página, canonical, hreflang recíproco, Open Graph, Twitter y datos estructurados acordes con el contenido visible.
- Sitemap coherente con ese inventario y 25 redirecciones específicas sin cadenas entre sus destinos. Las URL publicadas de representación, contabilidad, SAS, trámites, privacidad y términos se conservan como destinos principales.
- Página 404 y configuración de Apache/LiteSpeed preparada para Hostinger.

Los estilos preexistentes, los archivos de imágenes, el orden de las secciones y los archivos de animaciones principales permanecen iguales a la versión 8. Los ajustes de JavaScript se limitan al formulario, enlaces y navegación.

## Activación del correo

El código está preparado; la recepción en Hostinger todavía no está activada ni probada con el buzón real. No se recibieron ni incluyeron credenciales SMTP.

El ZIP contiene dos carpetas. El contenido de `TempoLegal-Final` corresponde a `public_html`. La carpeta `tempo-private` debe quedar al lado de `public_html`, fuera de la web pública. En el servidor se copia `config.example.php` a `config.php`, se completan los datos del proveedor real del buzón y el secreto de aplicación, y se activa `enabled`. Las instrucciones completas están en `tempo-private/README.md`.

No hacen falta Composer, una base de datos, WordPress ni colas para este formulario. Se incluye PHPMailer 7.1.1 con su licencia. La comprobación de certificados SMTP permanece activada.

Hasta configurar el servidor, el visitante conserva los canales alternativos y ve que el envío directo no está disponible. El sistema no simula una reserva de cita ni garantiza ubicación del mensaje en la bandeja de entrada por el mero acuse SMTP.

## Verificación realizada

| Comprobación | Resultado |
| --- | --- |
| Páginas canónicas | 117 verificadas |
| Archivos HTML, incluidas variantes de compatibilidad y 404 | 143 |
| Referencias locales a páginas y recursos | Sin destinos inexistentes |
| Hreflang y sitemap | Destinos coherentes y referencias recíprocas |
| Redirecciones específicas | 25 destinos definidos; sin cadenas entre ellos |
| Pantallas | 117 páginas a 320, 390, 768 y 1440 px: 468 comprobaciones sin desbordamiento horizontal |
| Imágenes cargadas | Sin recursos de imagen rotos; se excluye el elemento oculto sin fotografía asignada |
| Formulario PHP | 46 comprobaciones locales de validación, límites, duplicados, errores y generación de correo |
| Interfaz del formulario | 52 comprobaciones locales de consentimiento, traducciones, respuestas y contexto del radar |
| Correos externos enviados en pruebas | 0 |
| Textos de privacidad y términos | Conservados en el cuerpo de los documentos |

Las pruebas PHP se ejecutaron en PHP 8.5 WebAssembly; las pruebas de estados de la interfaz usaron respuestas locales simuladas. La navegación y la presentación se revisaron además en navegador. La conexión SMTP, la recepción final y las reglas de Apache/LiteSpeed requieren comprobación en el hosting real. La vista previa estática no ejecuta PHP ni aplica `.htaccess`.

## Alcance de la migración y pendientes concretos

`URL-MAP.csv` y `seo-inventory.json` documentan las rutas de esta entrega. `redirect-map.json` contiene las equivalencias específicas. La normalización de `index.html` también está preparada en `.htaccess`.

`LEGACY-URL-REVIEW.csv` coteja 15 URL históricas presentes en el documento rector. Once están cubiertas por páginas canónicas de esta entrega. Cuatro necesitan una página completa o revisión de contenido antes de sustituir el sitio actual:

- `/derecho-laboral-ecuador/`
- `/preguntas-frecuentes/`
- `/proteccion-de-datos-personales-ecuador/`
- `/registro-de-marcas/`

No se añadieron redirecciones de esos destinos hacia una página no equivalente. Esta lista no representa el inventario completo de WordPress: la recuperación del sitemap público no produjo un inventario utilizable en esta revisión. Antes de la sustitución debe cotejarse una exportación completa de WordPress o Search Console, incluidas publicaciones y otras URL posicionadas.

La web dispone de versiones ES/EN/PT/FR para sus grupos de páginas traducidas. El documento de Términos conserva únicamente su original español aprobado; sus traducciones corresponden a la etapa legal.

## Indexación y publicación

La entrega conserva `noindex` y añade una cabecera de borrador en `.htaccess`. Su retirada sigue en el paso de aprobación final y publicación. El sitemap está preparado para esa activación; no se ha enviado a Search Console. No se presenta esta implementación como una garantía de posicionamiento ni como una migración ya ejecutada.

## Referencias técnicas

- [Google: versiones localizadas](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: migraciones de URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Hostinger: recepción mediante SMTP](https://www.hostinger.com/support/11393648-php-mail-limitation-explained-how-to-improve-email-delivery-with-smtp/)
- [PHPMailer 7.1.1](https://github.com/PHPMailer/PHPMailer/releases/tag/v7.1.1)
