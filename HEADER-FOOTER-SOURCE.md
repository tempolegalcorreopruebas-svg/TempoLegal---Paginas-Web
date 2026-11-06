# Header y footer - fuente única

**Regla de mantenimiento:** la portada `index.html` (ES) y las portadas `en/index.html`, `pt/index.html`, `fr/index.html` son la referencia de estructura, CSS y textos para el header y footer. Las páginas internas, incluidas las calculadoras, deben sincronizar estos dos componentes desde la portada de su idioma, adaptando solo las rutas relativas.

No crear cabeceras/pies alternativos, ni añadir un segundo selector de idioma. El selector en las calculadoras debe conservar la identidad de la herramienta al navegar entre idiomas. Los enlaces locales deben abrir el `index.html` correspondiente.

En esta entrega se sincronizaron las 12 calculadoras y sus hojas de estilo con las portadas actuales. Si el header/footer cambia, volver a sincronizarlos en todas las páginas antes de publicar.
