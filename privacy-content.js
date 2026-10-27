'use strict';
// Shared UI is loaded first; complete legal text is prerendered from privacy-policy.json.
Object.entries({
  "es": {
    "legalPageTitle": "Política de Privacidad y Protección de Datos Personales | Tempo Legal",
    "legalDescription": "Política de Privacidad y Protección de Datos Personales · TempoLegal · V4.3."
  },
  "en": {
    "legalPageTitle": "Privacy and Personal Data Protection Policy | Tempo Legal",
    "legalDescription": "Privacy and Personal Data Protection Policy · TempoLegal · V4.3."
  },
  "pt": {
    "legalPageTitle": "Política de Privacidade e Proteção de Dados Pessoais | Tempo Legal",
    "legalDescription": "Política de Privacidade e Proteção de Dados Pessoais · TempoLegal · V4.3."
  },
  "fr": {
    "legalPageTitle": "Politique de confidentialité et de protection des données personnelles | Tempo Legal",
    "legalDescription": "Politique de confidentialité et de protection des données personnelles · TempoLegal · V4.3."
  }
}).forEach(([language, values]) => Object.assign(window.TEMPO_CONTENT[language], values));
