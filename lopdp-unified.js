/* TempoLegal shared calculator navigation and UI translation. */
(()=>{'use strict';
const dict={"en": {"Reiniciar": "Start over", "Siguiente": "Next", "Anterior": "Back", "Volver": "Back", "Empezar": "Start", "Comenzar": "Start", "Continuar": "Continue", "Finalizar": "Finish", "Calcular": "Calculate", "Resultado": "Result", "Resultados": "Results", "Descargar": "Download", "Enviar": "Send", "Aceptar": "Accept", "Cancelar": "Cancel", "Cerrar": "Close", "Sí": "Yes", "No": "No", "No, gracias": "No, thank you", "Ver resultado": "View result", "Ver resultados": "View results", "Consultar": "Ask for guidance", "Calculadora de multas LOPDP": "LOPDP fine calculator", "Calculadora de Delegado de Protección de Datos": "Data Protection Officer calculator", "Diagnóstico LOPDP": "LOPDP compliance assessment", "¿Cuánto le pueden multar por no proteger los datos que usted trata?": "How much could you be fined for failing to protect personal data?", "¿Su organización tiene que nombrar un Delegado de Protección de Datos?": "Does your organization need to appoint a Data Protection Officer?", "Diagnóstico de cumplimiento de datos personales en Ecuador": "Personal data compliance assessment in Ecuador", "Ley Orgánica de Protección de Datos Personales · Ecuador": "Personal Data Protection Act · Ecuador", "Estimación referencial": "Indicative estimate", "Política de privacidad": "Privacy policy", "Hacer el cálculo detallado": "Run the detailed calculation", "Su WhatsApp o su correo": "Your WhatsApp number or email", "Enviármelo": "Send it to me", "¿Se va sin ver su cifra?": "Leaving before seeing your estimate?", "¿Le enviamos el resultado?": "Shall we send you the result?", "Saltar al cuestionario": "Skip to questionnaire", "Quiero el informe": "I want the report", "Hablemos": "Let’s talk", "Guardar": "Save", "Seleccione una opción": "Select an option", "Seleccionar": "Select", "Pregunta": "Question", "Preguntas": "Questions", "Información": "Information", "Tu empresa": "Your company", "Su empresa": "Your company", "Porcentaje": "Percentage", "Nivel de riesgo": "Risk level", "Alto": "High", "Medio": "Medium", "Bajo": "Low", "Obligatorio": "Mandatory", "Opcional": "Optional", "Volver al inicio": "Back to start", "Consulta gratuita": "Free consultation"}, "pt": {"Reiniciar": "Recomeçar", "Siguiente": "Próximo", "Anterior": "Anterior", "Volver": "Voltar", "Empezar": "Começar", "Comenzar": "Começar", "Continuar": "Continuar", "Finalizar": "Finalizar", "Calcular": "Calcular", "Resultado": "Resultado", "Resultados": "Resultados", "Descargar": "Baixar", "Enviar": "Enviar", "Aceptar": "Aceitar", "Cancelar": "Cancelar", "Cerrar": "Fechar", "Sí": "Sim", "No": "Não", "No, gracias": "Não, obrigado", "Ver resultado": "Ver resultado", "Ver resultados": "Ver resultados", "Consultar": "Consultar", "Calculadora de multas LOPDP": "Calculadora de multas LOPDP", "Calculadora de Delegado de Protección de Datos": "Calculadora de Encarregado de Proteção de Dados", "Diagnóstico LOPDP": "Diagnóstico de conformidade LOPDP", "¿Cuánto le pueden multar por no proteger los datos que usted trata?": "Qual pode ser a multa por não proteger os dados pessoais tratados?", "¿Su organización tiene que nombrar un Delegado de Protección de Datos?": "Sua organização precisa nomear um Encarregado de Proteção de Dados?", "Diagnóstico de cumplimiento de datos personales en Ecuador": "Diagnóstico de conformidade com a proteção de dados no Equador", "Ley Orgánica de Protección de Datos Personales · Ecuador": "Lei Orgânica de Proteção de Dados Pessoais · Equador", "Estimación referencial": "Estimativa indicativa", "Política de privacidad": "Política de privacidade", "Hacer el cálculo detallado": "Fazer o cálculo detalhado", "Su WhatsApp o su correo": "Seu WhatsApp ou e-mail", "Enviármelo": "Enviar para mim", "¿Se va sin ver su cifra?": "Vai sair sem ver sua estimativa?", "¿Le enviamos el resultado?": "Enviamos o resultado?", "Saltar al cuestionario": "Ir para o questionário", "Quiero el informe": "Quero o relatório", "Guardar": "Salvar", "Seleccione una opción": "Selecione uma opção", "Seleccionar": "Selecionar", "Pregunta": "Pergunta", "Preguntas": "Perguntas", "Información": "Informação", "Tu empresa": "Sua empresa", "Su empresa": "Sua empresa", "Porcentaje": "Percentual", "Nivel de riesgo": "Nível de risco", "Alto": "Alto", "Medio": "Médio", "Bajo": "Baixo", "Obligatorio": "Obrigatório", "Opcional": "Opcional", "Volver al inicio": "Voltar ao início", "Consulta gratuita": "Consulta gratuita"}, "fr": {"Reiniciar": "Recommencer", "Siguiente": "Suivant", "Anterior": "Précédent", "Volver": "Retour", "Empezar": "Commencer", "Comenzar": "Commencer", "Continuar": "Continuer", "Finalizar": "Terminer", "Calcular": "Calculer", "Resultado": "Résultat", "Resultados": "Résultats", "Descargar": "Télécharger", "Enviar": "Envoyer", "Aceptar": "Accepter", "Cancelar": "Annuler", "Cerrar": "Fermer", "Sí": "Oui", "No": "Non", "No, gracias": "Non, merci", "Ver resultado": "Voir le résultat", "Ver resultados": "Voir les résultats", "Consultar": "Demander conseil", "Calculadora de multas LOPDP": "Calculateur des amendes LOPDP", "Calculadora de Delegado de Protección de Datos": "Calculateur du délégué à la protection des données", "Diagnóstico LOPDP": "Diagnostic de conformité LOPDP", "¿Cuánto le pueden multar por no proteger los datos que usted trata?": "Quelle amende risquez-vous en cas de défaut de protection des données ?", "¿Su organización tiene que nombrar un Delegado de Protección de Datos?": "Votre organisation doit-elle désigner un délégué à la protection des données ?", "Diagnóstico de cumplimiento de datos personales en Ecuador": "Diagnostic de conformité à la protection des données en Équateur", "Ley Orgánica de Protección de Datos Personales · Ecuador": "Loi organique sur la protection des données personnelles · Équateur", "Estimación referencial": "Estimation indicative", "Política de privacidad": "Politique de confidentialité", "Hacer el cálculo detallado": "Effectuer le calcul détaillé", "Su WhatsApp o su correo": "Votre WhatsApp ou votre e-mail", "Enviármelo": "Me l’envoyer", "¿Se va sin ver su cifra?": "Vous partez sans voir votre estimation ?", "¿Le enviamos el resultado?": "Souhaitez-vous recevoir le résultat ?", "Saltar al cuestionario": "Aller au questionnaire", "Quiero el informe": "Je souhaite le rapport", "Guardar": "Enregistrer", "Seleccione una opción": "Sélectionnez une option", "Seleccionar": "Sélectionner", "Pregunta": "Question", "Preguntas": "Questions", "Información": "Informations", "Tu empresa": "Votre entreprise", "Su empresa": "Votre entreprise", "Porcentaje": "Pourcentage", "Nivel de riesgo": "Niveau de risque", "Alto": "Élevé", "Medio": "Moyen", "Bajo": "Faible", "Obligatorio": "Obligatoire", "Opcional": "Facultatif", "Volver al inicio": "Retour au début", "Consulta gratuita": "Consultation gratuite"}};
const lang=document.documentElement.dataset.tlLang || 'es';
const nav=document.querySelector('.tl-shared-header');
if(nav){
 const select=nav.querySelector('#language-select');
 if(select)select.addEventListener('change',()=>{window.location.href=select.value});
 nav.querySelectorAll('[data-nav-menu]').forEach(menu=>{
  const btn=menu.querySelector('.nav-menu-toggle');const panel=menu.querySelector('.nav-menu-panel');
  if(!btn||!panel)return;
  const close=()=>{panel.hidden=true;btn.setAttribute('aria-expanded','false')};
  btn.addEventListener('click',()=>{const next=panel.hidden;panel.hidden=!next;btn.setAttribute('aria-expanded',String(next))});
  document.addEventListener('pointerdown',ev=>{if(!menu.contains(ev.target))close()});
  menu.addEventListener('keydown',ev=>{if(ev.key==='Escape'){close();btn.focus()}});
 });
 const toggle=nav.parentElement.querySelector('.menu-toggle');
 if(toggle)toggle.addEventListener('click',()=>{const open=nav.classList.toggle('tl-open');toggle.setAttribute('aria-expanded',String(open))});
}
if(!dict[lang])return;
const table=dict[lang];
const translate=(value)=>{
 const trimmed=(value||'').trim();
 if(!trimmed||!table[trimmed])return value;
 return value.replace(trimmed,table[trimmed]);
};
let busy=false;
function apply(root){
 if(!root||root.closest?.('.tl-shared-header,.tl-shared-footer,script,style,svg'))return;
 if(root.nodeType===3){const changed=translate(root.nodeValue);if(changed!==root.nodeValue)root.nodeValue=changed;return}
 if(root.nodeType!==1)return;
 if(root.matches('input,textarea,select')){
  for(const a of ['placeholder','aria-label','title'])if(root.hasAttribute(a))root.setAttribute(a,translate(root.getAttribute(a)));
 }
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node;const changes=[];
 while(node=walker.nextNode()){
  if(node.parentElement?.closest('.tl-shared-header,.tl-shared-footer,script,style,svg'))continue;
  const changed=translate(node.nodeValue);if(changed!==node.nodeValue)changes.push([node,changed]);
 }
 changes.forEach(([node,changed])=>node.nodeValue=changed);
}
function sync(){if(busy)return;busy=true;try{apply(document.body)}finally{busy=false}}
const observer=new MutationObserver(mutations=>{
 if(busy)return;
 // Throttle dynamic calculator rendering to one translation pass.
 if(mutations.some(m=>!m.target.parentElement?.closest('.tl-shared-header,.tl-shared-footer')))requestAnimationFrame(sync);
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
sync();
})();