# Guía de publicación · Herramientas LOPDP en tempolegal.com

Para Sistemas (Rubén y Cristian). Estas versiones pasaron el panel de revisión del 30/10 (arte, textos, conversión y QA) y la simulación completa de combinaciones. No publicar versiones anteriores.

Versión 2, 30 de octubre de 2026.

## 1. Qué se publica

Tres páginas independientes. Cada archivo es una página completa: logo, estilos y código van adentro, no necesita nada más.

| Herramienta | Archivo | Dirección en la web |
|---|---|---|
| Calculadora de multas | 2026-10-30-CALCULADORA-MULTAS-LOPDP-V22.html | tempolegal.com/herramientas/calculadora-multas-lopdp/ |
| Calculadora de Delegado | 2026-10-30-CALCULADORA-DELEGADO-LOPDP-V3.html | tempolegal.com/herramientas/calculadora-delegado-lopdp/ |
| Diagnóstico LOPDP | 2026-10-30-DIAGNOSTICO-LOPDP-TEMPOLEGAL-V3.html | tempolegal.com/herramientas/diagnostico-lopdp/ |

Las tres ya se enlazan entre sí con esas direcciones. Si cambian alguna, avisen para corregir los enlaces.

## 2. Cómo subirlas

Súbanlas como archivos sueltos, no pegadas dentro de un módulo de Divi. Los estilos de Divi y los de la herramienta chocan (botones, tarjetas, tipografía) y la página se descuadra.

1. Por el administrador de archivos del hosting o por FTP, creen la carpeta `herramientas` en la raíz del sitio, y dentro una carpeta por herramienta con el nombre de la tabla.
2. Copien cada archivo dentro de su carpeta y renómbrenlo `index.html`.
3. Abran las tres direcciones en computador y en celular y verifiquen que cargan con el logo.
4. Enlácenlas desde el menú o desde la página de Protección de Datos, y desde los blogs de LOPDP.

Si el hosting no permite carpetas fuera de WordPress, la alternativa es una página de WordPress con plantilla en blanco y un iframe a pantalla completa. Es la segunda opción, no la primera.

## 3. Guardar los datos de quien llena las herramientas (hacerlo antes de publicar)

Hoy, si una persona deja su nombre y su WhatsApp, el dato no se guarda en ningún lado. Con este paso, cada contacto queda en una hoja de Google y llega un correo a info@tempolegal.com.

1. Con la cuenta de Google de TempoLegal, crear una hoja de cálculo llamada "TempoLegal · Leads herramientas LOPDP".
2. En la hoja, ir a Extensiones > Apps Script. Borrar lo que aparezca y pegar completo el archivo `2026-10-29-CAPTURA-LEADS-APPS-SCRIPT-V1.gs`.
3. Guardar. Ir a Implementar > Nueva implementación. Tipo: Aplicación web. Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario. Implementar y autorizar los permisos.
4. Copiar la URL que termina en `/exec`. Al abrirla en el navegador debe decir "TempoLegal leads ok".
5. Pegar esa URL en los tres archivos (buscar con Ctrl+F):
   - Multas: `endpoint : ''` → `endpoint : 'URL'`
   - Delegado: `LEAD_ENDPOINT:""` → `LEAD_ENDPOINT:"URL"`
   - Diagnóstico: `LEAD_ENDPOINT:""` → `LEAD_ENDPOINT:"URL"`
   O mándenle la URL a Juan Alberto y se la dejamos pegada en una versión nueva.
6. Prueba: llenar cada herramienta hasta el final con datos de prueba. Deben aparecer tres filas en la hoja "Leads" y llegar tres correos a info@tempolegal.com.

Qué llega por cada contacto: herramienta y versión, nombre, organización, cargo, WhatsApp o correo, el resultado (multa estimada, faltas, si apunta a Delegado) y la página desde donde vino. Los contactos de quien abandona a medias llegan marcados como "Solo dejó el contacto".

## 4. Medición

Las herramientas ya publican sus eventos en `dataLayer` (inicio, pasos, resultado, contacto). Si la web tiene Google Tag Manager, los toma solo. Los píxeles de Meta y Google se cargan desde Tag Manager, no dentro de los archivos.

Para la pauta de Meta hay UN solo evento de conversión: **`tl_lead`**. Lo emiten las tres herramientas cada vez que alguien deja su contacto o abre WhatsApp. En GTM: un activador de evento personalizado `tl_lead` → etiqueta del píxel de Meta con el evento estándar `Lead`. Nada más.

## 5. Antes de dar por publicado

- [ ] Las tres direcciones abren en computador y celular, con el logo nuevo.
- [ ] La URL del Apps Script está pegada en las tres y la prueba dejó filas y correos.
- [ ] La política de privacidad de tempolegal.com menciona que los datos de estas herramientas se guardan en Google (hoja de cálculo y correo), es decir, fuera del Ecuador. Esto lo revisa Juan Alberto.
- [ ] Enlaces desde el menú, la página de Protección de Datos y los blogs.

Dudas de contenido o de cifras: Juan Alberto. El estándar con cifras, precios y textos de las tres está en `2026-10-30-ESTANDAR-HERRAMIENTAS-LOPDP-V3.md`.
