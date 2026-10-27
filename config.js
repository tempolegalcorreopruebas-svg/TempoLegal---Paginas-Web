/* Complete los canales reales de la firma para activar el envío.
 * Sin canales configurados, la página prepara y descarga la solicitud localmente.
 * WhatsApp: código de país + número, solo dígitos. Correo: dirección real.
 */
window.TEMPO_CONFIG = Object.freeze({
  email: 'info@tempolegal.com',
  whatsapp: '593978887392',
  bookingUrl: '',
  technicalTeamPhoto: '', // Foto conjunta de los 3 informáticos (tarea 0.1), p. ej. 'assets/team/equipo-informatica.webp'
  technicalTeamNames: '', // Nombres de izquierda a derecha, p. ej. 'Nombre 1 · Nombre 2 · Nombre 3'

  defaultLanguage: 'es' // Respaldo si el navegador no usa un idioma disponible.
});
