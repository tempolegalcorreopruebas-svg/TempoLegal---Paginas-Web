# Integración de herramientas LOPDP · 4 de noviembre de 2026

Entrega de código para revisión. No se ha publicado en tempolegal.com ni se ha enviado ningún contacto real.

## Incluido

| Herramienta aprobada | Versión | Archivo en el proyecto |
| --- | --- | --- |
| Calculadora de multas | V22 · 2026-10-30 | `herramientas/calculadora-multas-lopdp/index.html` |
| Calculadora de Delegado | V3 · 2026-10-30 | `herramientas/calculadora-delegado-lopdp/index.html` |
| Diagnóstico LOPDP | V3 · 2026-10-30 | `herramientas/diagnostico-lopdp/index.html` |

- Páginas independientes con su logo, CSS y JavaScript incorporados. No se importan estilos de Divi ni del resto de la web.
- Se mantienen las preguntas, cálculos, precios, condiciones, resultados y diseño de los archivos aprobados. No se incorpora contenido de `ANTERIORES`.
- Accesos a las tres herramientas en los menús compartidos y en las cuatro portadas. Las portadas portuguesa y francesa recibieron el menú compartido existente para dar acceso a las tres herramientas.
- Enlaces directos desde las 16 páginas existentes de Protección de Datos: ocho españolas y sus ocho versiones inglesas. Ya contenían accesos a las tres herramientas; se actualizaron las rutas sin duplicar secciones.
- Accesos adicionales en las 16 versiones de lecturas sobre biometría, filtraciones y Delegado. El bloque reutiliza las tipografías y colores de la web.
- Las herramientas nuevas están solamente en español, tal como se entregaron. Los menús ingleses, portugueses y franceses lo indican. No se presentan las herramientas antiguas inglesas como traducciones de las nuevas.
- Seis rutas antiguas `/herramientas-lopdp/…/` y `/en/herramientas-lopdp/…/` llevan a las versiones nuevas. Hay redirecciones Apache y documentos de respaldo para abrir el proyecto localmente. Se conservan consultas y fragmentos con JavaScript.
- Enlaces internos de las herramientas hacia las páginas que existen en el proyecto, sin enviar al visitante a la web antigua. Canonical, inventario SEO y sitemap actualizados. Se mantiene `noindex` para la revisión.
- Fuentes originales, fotografías, retratos, animaciones del sitio y pies existentes conservados. Se compararon los 426 archivos de recursos existentes, sin cambios de bytes.

La política de privacidad aprobada se conserva literalmente. La incorporación del tratamiento mediante Google Sheets y correo sigue pendiente de revisión de Juan Alberto, según la guía recibida.

## Pendientes antes de publicar

1. **Instalar Apps Script con la cuenta Google de TempoLegal.** El archivo original está en `_tools/lopdp/source/2026-10-29-CAPTURA-LEADS-APPS-SCRIPT-V1.gs`. La guía original y el informe del panel están en esa misma carpeta. El servidor Apache del proyecto bloquea el acceso público a `_tools`.
2. **Configurar la URL de implementación que termina en `/exec`.** Actualmente los tres espacios de endpoint están vacíos. Los resultados se calculan y se muestran, pero los contactos no se guardan en Google ni se envían los correos de notificación. Se mantiene el respaldo por WhatsApp que traen los archivos aprobados; nadie debe asumir que abrir el informe equivale a recepción confirmada del contacto.
3. **Probar la recepción real:** un contacto ficticio identificado por herramienta; comprobar tres filas en la hoja `Leads` y tres correos en `info@tempolegal.com`. Una respuesta opaca de `fetch` con `no-cors` no confirma por sí sola esas dos entregas.
4. **Revisión de privacidad:** confirmar el texto aprobado sobre Google como proveedor de hoja/correo y tratamiento fuera del Ecuador. No se inventó una cláusula legal ni se sustituyó el documento vigente.
5. **Medición:** los eventos originales de `dataLayer`, incluido `tl_lead`, se conservan. No se ha instalado GTM ni activado Meta/Google. La configuración existente de analítica permanece desactivada. Si se activa la pauta, configurar y comprobar el evento con la política de consentimiento del sitio; no insertar identificadores en los slots de píxel de las herramientas.
6. **Páginas RR. HH. y videovigilancia:** no están en este proyecto. Se conservaron las dos direcciones públicas suministradas dentro de las herramientas, pero no se verificó su disponibilidad pública ni se crearon páginas con información inventada. Deben incorporarse y enlazarse cuando se reciban sus contenidos.
7. Aprobación visual y funcional final, retirada coordinada de `noindex` y publicación en el hosting real. El ZIP no realiza estas acciones.

## Configuración reproducible

Desde la raíz del proyecto, con Python 3:

```bash
python _tools/configure-lopdp-endpoint.py 'https://script.google.com/macros/s/ID_REAL_DE_IMPLEMENTACION/exec'
```

El comando valida el formato y configura la misma URL en los tres HTML. No instala Apps Script ni envía contactos. No utilizar una URL de ejemplo en producción.

Los archivos originales completos están bajo `_tools/lopdp/source`. Para regenerar la integración:

```bash
python _tools/integrate-lopdp-tools.py
```

El importador conserva una URL de endpoint existente si es única y coherente en las herramientas. No borra esa configuración al regenerar. Si se reconstruyen páginas con los generadores históricos de landings/traducciones, ejecutar este importador al final: esos generadores preceden a esta entrega. El generador de cabecera ya omite tanto las herramientas independientes como sus rutas de redirección.

Los ajustes técnicos sobre los originales son rutas, metadatos, apertura local de carpetas, escape equivalente de las etiquetas del HTML descargable del diagnóstico para evitar interferencias de servidores de vista previa y supresión de datos de contacto de un aviso de consola. No se modifica el motor jurídico ni se añaden dependencias externas.

## Verificación realizada

- Sintaxis de todos los scripts incorporados en los tres HTML y de `i18n.js`.
- Importador idempotente: una segunda ejecución no altera los archivos.
- 469 destinos de enlaces a las herramientas comprobados localmente, sin destinos inexistentes.
- Las 16 landings de Protección de Datos contienen enlaces a las tres versiones nuevas dentro de su contenido.
- Comparación de recursos y pies respecto a la entrega anterior, sin cambios.
- 26 comprobaciones de renderizado: herramientas en 1440, 768, 390 y 360 px; portadas, muestra de landings española/inglesa y lectura en escritorio/celular. Sin desbordamiento horizontal ni imágenes con carga fallida. Las imágenes diferidas aún no solicitadas no se cuentan como imágenes rotas.
- Recorridos de las tres herramientas con respuestas simuladas hasta el resultado. Informe ampliado del diagnóstico probado con datos ficticios, con endpoint vacío y sin envío externo.
- Calculadora de Delegado: rechazo de WhatsApp `123`, con explicación visible.
- Apertura del menú y navegación al archivo nuevo verificadas en el navegador.
- Configurador de endpoint probado en copias aisladas: rechaza URL inválida sin escribir y actualiza los tres archivos con una URL válida de prueba. El ZIP final conserva endpoints vacíos.

No se ejecutó otra simulación exhaustiva de combinaciones ni se afirma una auditoría jurídica nueva. El informe del panel del 30 de octubre se incluye como antecedente de los archivos recibidos. La recepción real en Google, correo, GTM/Meta y el hosting de producción no se puede dar por comprobada sin su configuración.
