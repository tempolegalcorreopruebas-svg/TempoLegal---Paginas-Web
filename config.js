/* Public channels only. SMTP credentials belong in the private server configuration. */
window.TEMPO_CONFIG = Object.freeze({
  email: 'info@tempolegal.com',
  whatsapp: '593978887392',
  bookingUrl: '',
  technicalTeamPhoto: 'assets/team/equipo-informatica.webp',
  technicalTeamNames: 'Cristian Coque · Rubén Nacimba · Anthony Uribe',
  // Set an absolute URL here if WordPress is hosted outside this site.
  wordpressPostsUrl: location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? 'http://localhost/blogTempolegal/wp-json/wp/v2/posts'
    : '/wp-json/wp/v2/posts',
  defaultLanguage: 'es'
});
