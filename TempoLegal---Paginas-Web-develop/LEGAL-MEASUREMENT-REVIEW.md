# TempoLegal — Legales y medición

Entrega de código del 27 de octubre de 2026. Conserva el diseño, las imágenes y las animaciones anteriores. No se publicó la web, no se modificaron campañas y no se activó ninguna propiedad analítica.

## Implementado

- **Privacidad 4.3 y Términos 1.2:** originales españoles cotejados contra los DOCX aprobados, incluidas las tablas. Su redacción permanece literal. Conservados los cuatro cuerpos de Privacidad que ya tenía el proyecto y las descargas originales.
- **Términos en ES/EN/PT/FR:** tres páginas traducidas, con selector de idioma, enlaces recíprocos, canonical y sitemap. Cada traducción se identifica como referencia pendiente de revisión jurídica; no se presenta como una traducción aprobada por la firma.
- **Formulario:** aviso breve del maestro sobre respuesta a la solicitud, coordinación de reunión, ausencia de obligación de contratar y ausencia de suscripción publicitaria. La casilla confirma lectura de la política; no mezcla esta solicitud con publicidad o analítica. El contrato o las medidas precontractuales siguen siendo la base indicada para consultas en la política aprobada. La clave interna histórica `privacyAccepted` se conserva por compatibilidad y representa esa confirmación de lectura.
- **Preferencias:** mapas y analítica separados, opciones sin marcar, rechazo y retirada disponibles en el pie, conservación local de la elección durante 180 días, renovación al caducar y propagación entre pestañas. La publicidad figura como no instalada y no se puede habilitar.
- **Carga previa:** no se carga Google Maps sin su autorización. El código de GA4 está preparado en modo de consentimiento básico, sin solicitudes a Google ni cola de interacciones anteriores a la aceptación. En este paquete queda desactivado y sin ID real.
- **Medición:** `clic_whatsapp` y `formulario_aceptado` preparados y deduplicados en el documento. El segundo se dispara solo ante respuesta válida de aceptación del servidor SMTP. Preparar una consulta, abrir WhatsApp o recibir un error no equivale a un formulario aceptado.
- **Datos enviados:** parámetros limitados a URL canónica sin consulta ni fragmento, título de página, idioma y origen fijo del botón. Los nombres, correos, teléfonos, mensajes, respuestas del radar, tokens, referencias de correo e identificadores de solicitud no se envían como parámetros analíticos.
- **Seguimiento comercial:** definidas por separado `conversacion_real` y `lead_calificado`, con validación humana y registro interno. No se inventó un CRM ni se etiquetó un clic como cliente o venta.

Las nuevas interfaces usan los estilos de la firma en un archivo adicional limitado a consentimiento. No se modificó ningún CSS preexistente, imagen, archivo de fuente ni archivo principal de animaciones. La nota técnica agregada a Privacidad está fuera del texto jurídico aprobado.

## Comprobaciones

- Originales legales españoles: coincidencia íntegra de texto contra sus DOCX, tras normalizar espacios de presentación.
- Cuerpos de Privacidad en los cuatro idiomas y Términos español: idénticos a la entrega anterior.
- 120 páginas canónicas, sitemap e idiomas coherentes, sin referencias locales inexistentes.
- 162 comprobaciones locales de consentimiento y medición: rechazo, aceptación separada, retirada, caducidad, almacenamiento bloqueado, exclusión de pruebas, cargas fallidas, duplicados y ausencia de campos personales en los eventos.
- 52 comprobaciones locales del formulario: confirmación de lectura, respuestas, traducciones, errores y contexto del radar.
- 64 comprobaciones en navegador: inicio, Privacidad, Términos y Contacto en los cuatro idiomas, a 320, 390, 768 y 1440 px. Sin desbordamiento horizontal, recursos de imagen rotos, mapa externo previo al permiso ni analítica habilitada en el borrador. El diálogo abre y permite rechazar.

Las pruebas de medición usaron un DOM local y un ID ficticio sin descargar el proveedor ni enviar eventos externos. La revisión de navegador utilizó el borrador con medición apagada. No sustituyen la inspección de solicitudes de una propiedad real ni la recepción de un correo en Hostinger. Las revisiones de etapas anteriores permanecen como antecedentes, no como pruebas de producción de esta entrega.

## Pendientes antes de publicar o medir en real

| Pendiente | Situación |
| --- | --- |
| ID y configuración real de GA4 | No proporcionados; medición apagada |
| Medición automática y destinos conectados de Google | Revisar en la cuenta antes de activar; desactivar la medición mejorada para evitar envíos adicionales |
| Retención de Analytics | Configurar 14 meses y no reiniciar por actividad nueva, según el documento aprobado |
| Inventario legal y técnico de producción | La política aprobada menciona GTM, Google Ads, Meta, reCAPTCHA y Clixtell. Este código no instala esos sistemas; prepara GA4 directo y mapas con consentimiento. La firma debe conciliar el documento vigente con las tecnologías que finalmente se utilicen |
| Idiomas de la política | El original menciona español e inglés; el proyecto añade portugués y francés. Se señala para la conciliación del documento, sin reescribirlo unilateralmente |
| Traducciones nuevas de Términos | Pendiente revisión jurídica de fidelidad antes de publicación |
| Hosting, correo y registros | Verificar proveedor real del buzón, configuración SMTP, recepción, acceso a registros, retención y contratos de proveedores |
| Evidencia de autorizaciones | Conservar en el archivo interno las autorizaciones de testimonios, logos e imágenes aprobados; el ZIP no acredita que esa evidencia documental exista |
| Gestión de derechos | El correo `info@tempolegal.com` está visible; comprobar recepción y procedimiento operativo de atención |
| Validación comercial | Confirmar responsable, criterios de calificación y registro interno; no hay integración CRM ni conversiones offline |
| Publicación | Conserva noindex. Sigue pendiente la revisión final de Juan Alberto y la etapa de publicación |

La política original no se cambió para resolver estas diferencias: sigue la instrucción de conservarla al pie de la letra. La nota técnica visible informa de esta implementación, pero no sustituye la conciliación del documento final. No se afirma una auditoría integral ni certificación de cumplimiento legal.

Las instrucciones de activación, exclusión de pruebas y comprobación del proveedor están en `MEASUREMENT-SETUP.md`. El inventario de esta implementación está en `technology-inventory.json` y las definiciones de eventos en `measurement-events.json`. Los pendientes anteriores de SMTP y migración de cuatro URL históricas siguen abiertos; consultar `FUNCTIONALITY-SEO-REVIEW.md`.
