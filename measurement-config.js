'use strict';
// Activate only after the production checklist and the account settings in MEASUREMENT-SETUP.md.
window.TEMPO_MEASUREMENT_CONFIG = Object.freeze({
  enabled: false,
  environment: 'staging',
  measurementId: '',
  allowedHosts: Object.freeze(['tempolegal.com', 'www.tempolegal.com'])
});
