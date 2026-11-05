# TempoLegal — revisión de rutas y herramientas (05-11-2026)

- Se corrigió el prefijo `data-base` para páginas que cargan `enhancements.js`. Al renderizar imágenes dinámicas, el código usa la raíz compartida del sitio; no la carpeta del idioma.
- Se implementó una línea 1→2→3→4 con avance suavizado dependiente del scroll (sin temporizador de reproducción).
- Se añadió una capa de estilos e interacciones no invasiva a las tres herramientas LOPDP y sus copias de idioma. No se modificaron sus cálculos, validaciones, umbrales, datos ni conexión de formularios.
- Las herramientas mantienen su idioma de contenido original cuando no hay traducción disponible.
- Ejecutar desde un servidor local HTTP para las pruebas completas.
