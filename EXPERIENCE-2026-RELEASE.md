# TempoLegal — actualización de experiencia (5 de noviembre de 2026)

Versión de revisión local construida sobre el ZIP proporcionado: `TempoLegal-LOPDP-tools-integrated (1).zip`. No publicada.

## Cambios aplicados
- Nueva capa CSS/JS compartida (`experience-2026.css`, `experience-2026.js`) en 173 documentos del sitio, con rutas relativas ajustadas a la profundidad de cada página.
- Pantalla breve de carga con logo en las cuatro portadas; nunca bloquea la página sin JS, tiene retirada de seguridad y respeta movimiento reducido.
- Indicador de disponibilidad del botón flotante de WhatsApp con pulsaciones discretas, respetando movimiento reducido.
- Entrada suave y progresiva de secciones interiores al desplazarse; degradación elegante cuando IntersectionObserver no está disponible.
- Estados de interacción para tarjetas compatibles y mejoras en enfoque por teclado.
- Se preservaron intactos los HTML de las tres herramientas LOPDP: cálculos, precios, preguntas y captura.

## No se afirma como resuelto
- Las diferencias de contenidos/componentes entre las landings en español e inglés, portugués y francés preexistían y requieren auditoría página a página y traducción editorial; esta capa visual transversal no las iguala por completo.
- No se configuraron endpoints externos de Apps Script, ni se han probado envíos reales.
- El proyecto continúa con noindex para revisión y requiere aprobación antes de publicar.

## Prueba local
Desde la carpeta raíz ejecutar `python -m http.server 8000` y abrir `http://localhost:8000/`, `/en/`, `/pt/`, `/fr/` y las páginas de herramientas. No abrir sólo como archivo si se desea probar rutas y formularios.
