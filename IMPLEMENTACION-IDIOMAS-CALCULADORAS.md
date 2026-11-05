# Integración de herramientas y secuencia de trabajo

Se incorporó el mismo encabezado y pie de página de las portadas ES/EN/PT/FR en las 12 variantes de herramientas (3 herramientas × 4 idiomas). Los enlaces de cabecera y el selector de idioma se construyen con rutas relativas al sitio, y el menú de servicios responde a clic y Escape.

La interfaz inicial de las herramientas y parte del contenido dinámico se adaptan con un diccionario de términos en `lopdp-unified.js`, sin cambiar las fórmulas originales. **Quedan textos extensos que producen los scripts internos de las calculadoras en español y requieren traducción humana y pruebas funcionales por idioma antes de publicar.** No afirmar localización completa.

La sección «Cómo trabajamos» utiliza un tramo visual fijo (sticky) con avance de línea ligado al scroll nativo en escritorio. No intercepta ni bloquea el scroll y respeta `prefers-reduced-motion`. En pantallas pequeñas conserva desplazamiento normal para no atrapar al visitante.

Comprobar: funcionamiento de menús, selector, formulario, resultados de las 3 calculadoras, diseño desktop/mobile, scripts sin errores y redirecciones por idioma.
