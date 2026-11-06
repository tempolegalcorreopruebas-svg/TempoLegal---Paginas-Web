
"use strict";
/* ── Medición ──────────────────────────────────────────────────────
   TL.track(evento, datos) publica en dataLayer (GA4 / Tag Manager) y en el
   píxel de Meta cuando están presentes. Eventos que emite la herramienta:
     calc_inicio · calc_paso (n, id) · calc_actividad (sector)
     calc_personas (total) · calc_facturacion (rango) · calc_resultado
       (multa, infracciones, score, delegado, servicio)
     calc_cta (lugar) · calc_lead (canal) · calc_abandono (paso)
   Para atribuir campañas, el UTM de origen viaja en cada evento.        */
/* ╔══════════════════════════════════════════════════════════════════╗
   ║  CONFIGURAR ANTES DE PUBLICAR                                    ║
   ║  endpoint: a dónde va el lead (su CRM, un webhook, admin-ajax).  ║
   ║            Mientras esté vacío, el formulario NO finge un envío: ║
   ║            abre WhatsApp con los datos escritos.                 ║
   ║  ruc:      para el aviso de privacidad. Sin esto, el responsable ║
   ║            no queda identificado y el aviso no cumple.           ║
   ╚══════════════════════════════════════════════════════════════════╝ */
const ENVIO = {
  endpoint : '',  // URL /exec del Apps Script de TempoLegal (ver GUIA de publicación)
  whatsapp : '593978887392',
  titular  : 'Juan Alberto Gómez Benalcázar',
  ruc      : 'RUC PENDIENTE',
  domicilio: 'Av. de los Shyris y Eloy Alfaro, Edificio Parque Central, Quito'
};

const TL = (window.TL = window.TL || {});
TL.utm = (()=>{ try{ const q=new URLSearchParams(location.search); const o={};
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k=>{ if(q.get(k)) o[k]=q.get(k); });
  return o; }catch(e){ return {}; } })();
/* Cortafuegos. Ningún dato que una persona haya escrito sale hacia un tercero,
   por descuido de hoy ni de mañana: se filtra por nombre de clave y se recorta
   el largo. Y los píxeles de Meta y Google esperan al consentimiento; dataLayer
   es de primera parte y lo gobierna el contenedor del sitio. */
const CLAVES_VEDADAS=/nombre|nom|correo|mail|email|tel|whats|wa$|cedula|ruc|cargo|organiza|org$|direccion|dato/i;
TL.consentido = () => { try{
  return window.TL_CONSENT===true ||
    /(^|;)\s*(cookie_consent|cmplz_marketing|complianz_policy_id|_iub_cs)=/.test(document.cookie);
}catch(e){ return false; } };
TL.track = (evento, datos={}) => {
  const limpio={};
  for(const [k,v] of Object.entries(datos)){
    if(CLAVES_VEDADAS.test(k)) continue;
    limpio[k] = typeof v==='string' ? v.slice(0,64) : v;
  }
  const carga = {event:evento, herramienta:'calculadora-multas-lopdp', ...TL.utm, ...limpio};
  try{ (window.dataLayer=window.dataLayer||[]).push(carga); }catch(e){}
  try{ if(/lead/.test(evento)) (window.dataLayer=window.dataLayer||[]).push({event:'tl_lead',herramienta:'calculadora-multas',origen:evento}); }catch(e){}
  if(!TL.consentido()) return;            /* sin consentimiento, nada a terceros */
  try{ if(typeof fbq==='function'){
    const mapa={calc_inicio:'ViewContent', calc_resultado:'Lead', calc_lead:'CompleteRegistration', calc_cta:'InitiateCheckout'};
    if(mapa[evento]) fbq('trackCustom', mapa[evento], carga);
  } }catch(e){}
  try{ if(typeof gtag==='function') gtag('event', evento, carga); }catch(e){}
};

/* Marca TempoLegal incrustada: el archivo viaja solo, sin rutas externas. */
const LOGO="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MDguMTQzOSAxMjcuMjE1IiB3aWR0aD0iNzA4IiBoZWlnaHQ9IjEyNyI+PHBhdGggZmlsbD0iIzAyMzU0NiIgc3Ryb2tlPSIjMDIzNTQ2IiBzdHJva2Utd2lkdGg9IjEuNzAyMSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBkPSJNIDMzLjQwNjQgNzguMjYwNiBMIDU2LjE0NzUgMTAxLjAwMTYgTCAxMDIuODA5NiA1NC4zMzk1IEwgNTYuMTQ3NSA3LjY3NzQgTCA5LjQ4NTQgNTQuMzM5NSBMIDE4LjE1MTcgNjMuMDA1OCBMIDIwLjU1ODkgNjAuNTk4NiBMIDE0LjI5OTggNTQuMzM5NSBMIDU2LjE0NzUgMTIuNDkxOCBMIDk3Ljk5NTIgNTQuMzM5NSBMIDU2LjE0NzUgOTYuMTg3MiBMIDM1LjgxMzcgNzUuODUzMyBBIDEuNzAyMSAxLjcwMjEgMCAwIDAgMzMuNDA2NCA3OC4yNjA2IFoiLz48cGF0aCBmaWxsPSIjMDY3NTkwIiBzdHJva2U9IiMwNjc1OTAiIHN0cm9rZS13aWR0aD0iMS43MDIxIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGQ9Ik0gNzguODg4NiA0OC45NTQ0IEwgNTYuMTQ3NSAyNi4yMTM0IEwgOS40ODU0IDcyLjg3NTUgTCA1Ni4xNDc1IDExOS41Mzc2IEwgMTAyLjgwOTYgNzIuODc1NSBMIDk0LjE0MzMgNjQuMjA5MiBMIDkxLjczNjEgNjYuNjE2NCBMIDk3Ljk5NTIgNzIuODc1NSBMIDU2LjE0NzUgMTE0LjcyMzIgTCAxNC4yOTk4IDcyLjg3NTUgTCA1Ni4xNDc1IDMxLjAyNzggTCA3Ni40ODE0IDUxLjM2MTcgQSAxLjcwMjEgMS43MDIxIDAgMCAwIDc4Ljg4ODYgNDguOTU0NCBaIi8+PHBhdGggZmlsbD0iIzA2NzU5MCIgZD0iTSAxNDIuOTM3NCA0MS4yNTQ5IEwgMTI3LjA1OTEgNDEuMjU0OSBMIDEyNy4wNTkxIDM4LjMxNDUgQyAxMjcuMDU5MSAzNS42NzIzIDEyOC42NzQzIDM0LjAxMTYgMTMxLjI1MDIgMzQuMDExNiBMIDE2Ny40MjE2IDM0LjAxMTYgTCAxNjcuNDIxNiAzNi45NTYxIEMgMTY3LjQyMTYgMzkuNTE5NyAxNjUuNzI3NyA0MS4yNTQ5IDE2My4yMzA0IDQxLjI1NDkgTCAxNTEuMzk0MiA0MS4yNTQ5IEwgMTUxLjM5NDIgODQuOTMwNSBDIDE1MS4zOTQyIDg3LjU3MjggMTQ5LjcwNDUgODkuMjMzNSAxNDcuMjAzMSA4OS4yMzM1IEwgMTQyLjkzNzQgODkuMjMzNSBaIE0gMTQyLjkzNzQgNDEuMjU0OSIvPjxwYXRoIGZpbGw9IiMwNjc1OTAiIGQ9Ik0gMTgwLjM2MzUgMzQuMDExNiBMIDIxOC4yMjQ2IDM0LjAxMTYgTCAyMTguMjI0NiAzNy4xMDUyIEMgMjE4LjIyNDYgMzkuNzQ3NSAyMTYuNzU0NCA0MS4yNTQ5IDIxNC4xMDM4IDQxLjI1NDkgTCAxODguODE2MiA0MS4yNTQ5IEwgMTg4LjgxNjIgNTguMzc5OCBMIDIxMS45NzUxIDU4LjM3OTggTCAyMTEuOTc1MSA2MS4zMjAyIEMgMjExLjk3NTEgNjQuMDM3MCAyMTAuNTA0OSA2NS41NDQ1IDIwNy44NTg2IDY1LjU0NDUgTCAxODguODE2MiA2NS41NDQ1IEwgMTg4LjgxNjIgODEuOTkwMSBMIDIxNC4wMzM0IDgxLjk5MDEgQyAyMTYuNjA1MyA4MS45OTAxIDIxOC4yMjQ2IDgzLjcyNTQgMjE4LjIyNDYgODYuMjg4OSBMIDIxOC4yMjQ2IDg5LjIzMzUgTCAxODAuMzYzNSA4OS4yMzM1IFogTSAxODAuMzYzNSAzNC4wMTE2Ii8+PHBhdGggZmlsbD0iIzA2NzU5MCIgZD0iTSAyMzIuNDg3NyAzNC4wMTE2IEwgMjM1LjM1NzcgMzQuMDExNiBMIDI1OS43NjMyIDY1LjMyMDggTCAyODQuMjQzMiAzNC4wMTE2IEwgMjg3LjExMzMgMzQuMDExNiBMIDI4Ny4xMTMzIDg5LjIzMzUgTCAyODMuMjE2MiA4OS4yMzM1IEMgMjgwLjQyMDcgODkuMjMzNSAyNzguNjU2NCA4Ny4zNDUwIDI3OC42NTY0IDg0LjU1MzcgTCAyNzguNjU2NCA1My4wOTk1IEwgMjU5Ljc2MzIgNzguMTQyNyBMIDI0MC45NDQ1IDUzLjI0ODUgTCAyNDAuOTQ0NSA4NC41NTM3IEMgMjQwLjk0NDUgODcuMzQ1MCAyMzkuMTgwMiA4OS4yMzM1IDIzNi4zODQ4IDg5LjIzMzUgTCAyMzIuNDg3NyA4OS4yMzM1IFogTSAyMzIuNDg3NyAzNC4wMTE2Ii8+PHBhdGggZmlsbD0iIzA2NzU5MCIgZD0iTSAzMjguMDY3OSA2NC43MTYyIEMgMzM2LjAwNzEgNjQuNzE2MiAzNDAuMjY4NiA1OS41ODQ5IDM0MC4yNjg2IDUzLjI0ODUgQyAzNDAuMjY4NiA0Ni43NjMxIDMzNS44NTgwIDQxLjI1NDkgMzI3Ljc3MzkgNDEuMjU0OSBMIDMxNC42ODY5IDQxLjI1NDkgTCAzMTQuNjg2OSA2NC43MTYyIFogTSAzMDYuMjMwMSAzNC4wMTE2IEwgMzI4LjA2NzkgMzQuMDExNiBDIDM0MS43Mzg4IDM0LjAxMTYgMzQ4LjcyNTQgNDIuNTM4OCAzNDguNzI1NCA1My4yNDg1IEMgMzQ4LjcyNTQgNjMuODgzOCAzNDEuNzM4OCA3MS44MDYzIDMyOC4yMTI5IDcxLjgwNjMgTCAzMTQuNjg2OSA3MS44MDYzIEwgMzE0LjY4NjkgODQuNzgxNSBDIDMxNC42ODY5IDg3LjQ5ODIgMzEyLjk5MzEgODkuMjMzNSAzMTAuNDIxMyA4OS4yMzM1IEwgMzA2LjIzMDEgODkuMjMzNSBaIE0gMzA2LjIzMDEgMzQuMDExNiIvPjxwYXRoIGZpbGw9IiMwNjc1OTAiIGQ9Ik0gMzg4Ljk0MjkgODIuODk3MSBDIDQwMC4wNDIwIDgyLjg5NzEgNDA4LjM0OTcgNzMuMjM5MyA0MDguMzQ5NyA2MS42MjI1IEMgNDA4LjM0OTcgNTAuMjMzNiA0MDAuMDQyMCA0MC4zNDgwIDM4OC45NDI5IDQwLjM0ODAgQyAzNzcuOTE0MyA0MC4zNDgwIDM2OS42ODExIDUwLjE1NDkgMzY5LjY4MTEgNjEuNjIyNSBDIDM2OS42ODExIDczLjE2NDcgMzc3LjkxNDMgODIuODk3MSAzODguOTQyOSA4Mi44OTcxIE0gMzYxLjIyNDMgNjEuNjIyNSBDIDM2MS4yMjQzIDQ1Ljg1NjEgMzcyLjYyMTUgMzIuODgxMCAzODguOTQyOSAzMi44ODEwIEMgNDA1LjMzNDcgMzIuODgxMCA0MTYuODAyNCA0NS44NTYxIDQxNi44MDI0IDYxLjYyMjUgQyA0MTYuODAyNCA3Ny40NjM1IDQwNS4zMzQ3IDkwLjM2NDEgMzg4Ljk0MjkgOTAuMzY0MSBDIDM3Mi42MjE1IDkwLjM2NDEgMzYxLjIyNDMgNzcuNDYzNSAzNjEuMjI0MyA2MS42MjI1Ii8+PHBhdGggZmlsbD0iIzA2NzU5MCIgZD0iTSA0MzMuNDk2NSAzNC4wMTE2IEwgNDM3LjgzMjYgMzQuMDExNiBDIDQ0MC4zMzQwIDM0LjAxMTYgNDQyLjAyMzcgMzUuNjcyMyA0NDIuMDIzNyAzOC4zMTQ1IEwgNDQyLjAyMzcgODEuOTkwMSBMIDQ2NS4zMjc2IDgxLjk5MDEgQyA0NjcuODI5MCA4MS45OTAxIDQ2OS41MTg3IDgzLjcyNTQgNDY5LjUxODcgODYuMjg4OSBMIDQ2OS41MTg3IDg5LjIzMzUgTCA0MzMuNDk2NSA4OS4yMzM1IFogTSA0MzMuNDk2NSAzNC4wMTE2Ii8+PHBhdGggZmlsbD0iIzA2NzU5MCIgZD0iTSA0ODIuNjA5OCAzNC4wMTE2IEwgNTIwLjQ3MDkgMzQuMDExNiBMIDUyMC40NzA5IDM3LjEwNTIgQyA1MjAuNDcwOSAzOS43NDc1IDUxOS4wMDA2IDQxLjI1NDkgNTE2LjM1NDMgNDEuMjU0OSBMIDQ5MS4wNjI1IDQxLjI1NDkgTCA0OTEuMDYyNSA1OC4zNzk4IEwgNTE0LjIyMTQgNTguMzc5OCBMIDUxNC4yMjE0IDYxLjMyMDIgQyA1MTQuMjIxNCA2NC4wMzcwIDUxMi43NTEyIDY1LjU0NDUgNTEwLjEwNDggNjUuNTQ0NSBMIDQ5MS4wNjI1IDY1LjU0NDUgTCA0OTEuMDYyNSA4MS45OTAxIEwgNTE2LjI3OTcgODEuOTkwMSBDIDUxOC44NTE2IDgxLjk5MDEgNTIwLjQ3MDkgODMuNzI1NCA1MjAuNDcwOSA4Ni4yODg5IEwgNTIwLjQ3MDkgODkuMjMzNSBMIDQ4Mi42MDk4IDg5LjIzMzUgWiBNIDQ4Mi42MDk4IDM0LjAxMTYiLz48cGF0aCBmaWxsPSIjMDY3NTkwIiBkPSJNIDU4Ni40MTkxIDY0LjU2NzEgQyA1ODUuOTA1NiA3OC45MDA2IDU3NS45MDQwIDkwLjM2NDEgNTU5LjUxMjIgOTAuMzY0MSBDIDU0My43MDQzIDkwLjM2NDEgNTMxLjc5NzcgNzcuNDYzNSA1MzEuNzk3NyA2MS42OTcxIEMgNTMxLjc5NzcgNDUuOTMwNiA1NDQuMjIyMCAzMi45NTU1IDU1OS41MTIyIDMyLjk1NTUgQyA1NjguNjI3NSAzMi45NTU1IDU3Ni41NjY2IDM3LjQ4MjEgNTgxLjYzOTkgNDQuMzQ4NiBMIDU3OC4wMzY4IDQ2LjQ2MDcgQyA1NzUuOTA0MCA0Ny42NjU5IDU3NC4yODg4IDQ3LjI4OTAgNTcyLjMwNTEgNDUuNTUzOCBDIDU2OC44NDcwIDQyLjMxMTAgNTY0LjQzNjQgNDAuNDI2NyA1NTkuNTEyMiA0MC40MjY3IEMgNTQ4LjYzMjYgNDAuNDI2NyA1NDAuMTc1OCA1MC4yMzM2IDU0MC4xNzU4IDYxLjY5NzEgQyA1NDAuMTc1OCA3My4wMTU2IDU0OC4xMTUwIDgyLjY2OTMgNTU5LjI5MjcgODIuODk3MSBDIDU2OS4yOTAxIDgzLjA0NjIgNTc3LjMwMzggNzYuNzA5OCA1NzcuOTYyMyA2Ny41ODIxIEwgNTYyLjA4NDAgNjcuNTgyMSBDIDU1OS40Mzc2IDY3LjU4MjEgNTU3Ljg5MjkgNjYuMTQ5MSA1NTcuODkyOSA2My4zNTc4IEwgNTU3Ljg5MjkgNTkuODg3MyBMIDU4Ni4yNzAwIDU5Ljg4NzMgQyA1ODYuNDE5MSA2MS40NzM0IDU4Ni40MTkxIDYzLjQzMjMgNTg2LjQxOTEgNjQuNTY3MSIvPjxwYXRoIGZpbGw9IiMwNjc1OTAiIGQ9Ik0gNjMzLjg0MjcgNzIuMjU3NyBMIDYyMi43Mzk1IDQ3Ljk2ODIgTCA2MTEuNzEwOSA3Mi4yNTc3IFogTSA2MjEuNDE4NCAzNC4wMTE2IEwgNjI0LjA2NDggMzQuMDExNiBMIDY1MC44MjI2IDg5LjIzMzUgTCA2NDQuNzk2OCA4OS4yMzM1IEMgNjQyLjY2NDAgODkuMjMzNSA2NDAuOTcwMSA4OC4xNzc0IDY0MC4wMTc2IDg2LjIxNDQgTCA2MzYuNTU5NSA3OC43NDc0IEwgNjA4Ljk5NDEgNzguNzQ3NCBMIDYwNS40NjE0IDg2LjIxNDQgQyA2MDQuNTc5MyA4OC4xNzc0IDYwMi44MTkyIDg5LjIzMzUgNjAwLjY4NjQgODkuMjMzNSBMIDU5NC43MzEwIDg5LjIzMzUgWiBNIDYyMS40MTg0IDM0LjAxMTYiLz48cGF0aCBmaWxsPSIjMDY3NTkwIiBkPSJNIDY2My44MzkyIDM0LjAxMTYgTCA2NjguMTc1MiAzNC4wMTE2IEMgNjcwLjY3NjcgMzQuMDExNiA2NzIuMzY2NCAzNS42NzIzIDY3Mi4zNjY0IDM4LjMxNDUgTCA2NzIuMzY2NCA4MS45OTAxIEwgNjk1LjY3MDIgODEuOTkwMSBDIDY5OC4xNzE3IDgxLjk5MDEgNjk5Ljg2MTQgODMuNzI1NCA2OTkuODYxNCA4Ni4yODg5IEwgNjk5Ljg2MTQgODkuMjMzNSBMIDY2My44MzkyIDg5LjIzMzUgWiBNIDY2My44MzkyIDM0LjAxMTYiLz48L3N2Zz4=";

/* ══ BASE NORMATIVA ══════════════════════════════════════════════════
   LOPDP: art. 67 infracciones leves · art. 68 graves · art. 71 sanciones
   leves (0,1–0,7 % del volumen de negocio) · art. 72 graves (0,7–1 %).
   Solo existen infracciones leves y graves. Ámbito: sector privado.
   Art. 42 EIPD · art. 43 notificación en 5 días (LOFC añade el CSIRT)
   Arts. 48–49 delegado; el art. 49 prevé su responsabilidad personal.
   RGLOPDP art. 55 perfil · art. 56 incompatibilidades · art. 90 la
   sanción se impone sin perjuicio de la responsabilidad civil o penal.
   Res. 2025-0022-R modelo MPRIV-1 · Res. 2026-0005-R MTGE
   (umbral 6, plazo DPD vencido el 26 de mayo de 2026) · Res. 2025-0028-R DPD.
   ═══════════════════════════════════════════════════════════════════ */
const RATES={leve:[0.001,0.007], grave:[0.007,0.010]};
/* Parámetros comerciales */
const CARTERA={delegados:63, implementaciones:130, dias:'8 a 12 días'};

/* Los tres servicios. El diagnóstico recomienda uno según el resultado. */
const SERVICIOS={
  delegado:{k:'delegado', n:'Delegado de Protección de Datos externo', p:95.0, u:'+ IVA/mes', pago:'Servicio mensual',
    d:'Designamos al delegado, lo inscribimos ante la autoridad de datos y hacemos ese trabajo por usted todo el año.',
    para:'Para quien ya está implementado y solo necesita quién responda.'},
  auditoria:{k:'auditoria', n:'Auditoría de cumplimiento', p:149.99, u:'+ IVA, pago único', pago:'Un solo pago + IVA',
    d:'Revisamos lo que ya tiene, encontramos los huecos y le entregamos el informe con el plan.',
    para:'Para quien ya hizo parte del trabajo y necesita saber qué le falta.'},
  implementacion:{k:'implementacion', n:'Implementación LOPDP', p:390.0, u:'+ IVA, pago único', pago:'Un solo pago + IVA',
    d:'Todo el sistema de protección de datos armado, documentado y auditado en 8 a 12 días.',
    para:'Para quien parte de cero o tiene la mayoría de obligaciones abiertas.'}
};
const recomendar = r => {
  const dpdObl = r.duties.some(d=>d.id==='dpd_desig');
  if(r.score>=80) return dpdObl ? SERVICIOS.delegado : SERVICIOS.auditoria;
  return r.score>=50 ? SERVICIOS.auditoria : SERVICIOS.implementacion;
};
/* Costo del primer año. Los doce meses de delegado solo se suman a quien está
   obligado a tenerlo: cobrárselos a quien no lo necesita infla la cuenta y
   contradice lo que la propia herramienta le acaba de decir. */
const costoAnio = (rec,dpdObl) => (rec.k==='delegado' ? 0 : rec.p) + (dpdObl ? SERVICIOS.delegado.p*12 : 0);

/* ─────────────────────────────────────────────────────────────────
   ENLACES. Las URLs marcadas con pronto:1 aún no están publicadas:
   cambie el href y quite pronto:1 cuando lo estén.
   ───────────────────────────────────────────────────────────────── */
const URL={
  base:'../../proteccion-de-datos-personales-ecuador/',
  dpd:'../../proteccion-de-datos-personales-ecuador/delegado-proteccion-datos-externo-ecuador/',
  salud:'../../proteccion-de-datos-personales-ecuador/proteccion-datos-clinicas-salud-ecuador/',
  educacion:'../../proteccion-de-datos-personales-ecuador/proteccion-datos-colegios-instituciones-educativas-ecuador/',
  software:'../../proteccion-de-datos-personales-ecuador/proteccion-datos-empresas-software-apps-ecuador/',
  rrhh:'https://tempolegal.com/lopdp-recursos-humanos-ecuador/',
  video:'https://tempolegal.com/videovigilancia-lopdp-ecuador/',
  contacto:'../../contactanos/',
  privacidad:'../../politica-de-privacidad/',
  normograma:'#normograma',
  calcDpd:'../calculadora-delegado-lopdp/',
  appDiag:'../diagnostico-lopdp/'
};

/* landing sectorial que corresponde a cada sector del formulario */
const SECTOR_LANDING={
  salud:{u:URL.salud, t:'Protección de datos en clínicas y centros de salud',
         d:'Historia clínica, secreto profesional y el choque entre conservar y eliminar.'},
  educacion:{u:URL.educacion, t:'Protección de datos en colegios e instituciones educativas',
         d:'Datos de menores, consentimiento de representantes y biometría en el aula.'},
  telecom:{u:URL.software, t:'Protección de datos en empresas de software y apps',
         d:'Privacidad desde el diseño, encargados en la nube y transferencias internacionales.'},
  seguridad:{u:URL.video, t:'Videovigilancia y LOPDP',
         d:'Cuándo una cámara deja de ser seguridad y pasa a ser tratamiento de datos.'}
};

const SOLUCIONES=[
 {n:1, ic:'', t:'Diagnóstico y mapeo de riesgos', p:'Días 1 a 3', u:URL.base,
  d:'Levantamos qué datos trata, de quién, con qué base legal y dónde viven. En tres días tiene el inventario que la Superintendencia le va a pedir primero.'},
 {n:2, ic:'', t:'Implementación del cumplimiento', p:'Días 4 a 12', u:URL.base,
  d:'Redactamos y dejamos firmados el registro de actividades, las políticas, los avisos y los contratos con sus proveedores. Al día doce está implementado y auditado.'},
 {n:3, ic:'', t:'Delegado de Protección de Datos externo', p:'Permanente', u:URL.dpd,
  d:'Ponemos un delegado que sí cumple el perfil y la independencia que exige el reglamento, lo inscribimos ante la Superintendencia y respondemos por él.'},
 {n:4, ic:'', t:'Defensa ante la Superintendencia', p:'Cuando haga falta', u:URL.contacto,
  d:'Requerimientos, inspecciones, medidas correctivas y brechas de seguridad. Es el momento en que los plazos se cuentan en días y no en semanas.'}
];

const HERRAMIENTAS=[
 {ic:'', t:'Calculadora de multas', d:'La que acaba de usar. Cuánto le pueden multar y por qué artículo.', u:'#', aqui:1, c:0},
 {ic:'', t:'Calculadora de Delegado de Protección de Datos', d:'Le dice si está obligado a nombrarlo y cuánto le costaría no hacerlo.', u:URL.calcDpd, c:1},
 {ic:'', t:'Normograma LOPDP', d:'Las 81 normas de protección de datos del Ecuador, ordenadas y enlazadas.', u:URL.normograma, pronto:1, c:2},
 {ic:'', t:'Diagnóstico LOPDP', d:'Seis frentes revisados en dos minutos, con la norma que exige cada cosa.', u:URL.appDiag, c:5}
];

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>'USD '+Math.round(n).toLocaleString('es-EC');
const dec=n=>n.toLocaleString('es-EC',{minimumFractionDigits:2,maximumFractionDigits:2});
const C=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c8)'];

/* ── perfiles de sector: llevan tipo, sector y los defaults del MTGE ── */
const PERFIL_SECTOR=[
 {v:'salud',      ic:'', l:'Salud',                       d:'Consultorio, clínica, laboratorio, farmacia', dpd:1, c:0, mt:{volumen:'d',frecuencia:'c',permanencia:'c',alcance:'a'}, def:{titulares:'b',categorias:'c'},
  k:'medico doctor doctora psicologo psicologa odontologo dentista dental veterinaria veterinario fisioterapia laboratorio clinico analisis farmacia botica clinica hospital consultorio nutricionista optica enfermeria terapia imagenologia'},
 {v:'educacion',  ic:'', l:'Educación',                   d:'Colegio, escuela, instituto, universidad',    dpd:1, c:1, mt:{volumen:'c',frecuencia:'c',permanencia:'c',alcance:'a'}, def:{titulares:'b',categorias:'c'},
  k:'colegio escuela jardin guarderia academia ingles instituto universidad capacitacion cursos profesor tutoria idiomas conservatorio centro de estudios'},
 {v:'financiero', ic:'', l:'Financiero y seguros',        d:'Banco, cooperativa, aseguradora, bróker',     dpd:1, c:2, mt:{volumen:'d',frecuencia:'c',permanencia:'c',alcance:'b'}, def:{titulares:'c',categorias:'c'},
  k:'banco cooperativa caja credito prestamo seguros aseguradora broker corredor casa de valores fintech cobranza factoring inversion mutualista'},
 {v:'comercio',   ic:'', l:'Comercio o venta en línea',   d:'Tienda, distribuidora, supermercado, e-commerce', dpd:0, c:4, mt:{volumen:'b',frecuencia:'c',permanencia:'c',alcance:'b'}, def:{titulares:'c',categorias:'b'},
  k:'tienda almacen local comercial supermercado minimarket distribuidora mayorista importadora ecommerce venta en linea catalogo boutique libreria ferreteria papeleria'},
 {v:'telecom',    ic:'', l:'Tecnología y telecom',        d:'Software, ISP, soporte TI, inteligencia artificial', dpd:1, c:5, mt:{volumen:'c',frecuencia:'c',permanencia:'c',alcance:'b'}, def:{titulares:'c',categorias:'b'},
  k:'software desarrollo app aplicacion sistemas soporte informatica ti isp internet telefonia datacenter hosting nube inteligencia artificial startup'},
 {v:'legal',      ic:'', l:'Servicios profesionales',     d:'Estudio jurídico, contable, consultoría, arquitectura', dpd:0, c:6, mt:{volumen:'c',frecuencia:'b',permanencia:'c',alcance:'b'}, def:{titulares:'a',categorias:'c'},
  k:'abogado abogada estudio juridico notaria contador contadora contabilidad auditoria consultoria asesoria arquitecto ingeniero diseno traduccion agencia aduanera'},
 {v:'seguridad',  ic:'', l:'Seguridad y videovigilancia', d:'Guardianía, conjunto o edificio, cámaras, GPS', dpd:1, c:7, mt:{volumen:'b',frecuencia:'c',permanencia:'c',alcance:'a'}, def:{titulares:'b',categorias:'b'},
  k:'guardiania vigilancia privada camaras videovigilancia circuito cerrado alarma gps rastreo urbanizacion conjunto condominio edificio administracion monitoreo biometrico huella control de acceso'},
 {v:'hoteleria',  ic:'🏨', l:'Hotelería, turismo y comida', d:'Hotel, hostal, restaurante, agencia de viajes', dpd:0, c:3, mt:{volumen:'b',frecuencia:'c',permanencia:'b',alcance:'b'}, def:{titulares:'c',categorias:'b'},
  k:'hotel hostal hosteria hospedaje airbnb restaurante cafeteria bar catering heladeria panaderia agencia de viajes turismo tour operadora reservas huespedes eventos'},
 {v:'transporte', ic:'', l:'Transporte y logística',      d:'Courier, encomiendas, taxis, flota, bodegaje',  dpd:0, c:5, mt:{volumen:'b',frecuencia:'c',permanencia:'b',alcance:'b'}, def:{titulares:'c',categorias:'b'},
  k:'transporte courier encomienda paqueteria delivery domicilio taxi bus cooperativa de transporte carga camion flota logistica bodega almacenaje naviera aduana alquiler de autos rentacar concesionario automotriz vehiculos'},
 {v:'inmobiliario',ic:'', l:'Inmobiliario y construcción', d:'Constructora, corredor de bienes raíces, arriendos', dpd:0, c:6, mt:{volumen:'c',frecuencia:'b',permanencia:'c',alcance:'a'}, def:{titulares:'b',categorias:'b'},
  k:'inmobiliaria bienes raices corredor constructora construccion obra arriendo alquiler venta de casas lotizacion urbanizacion promotora'},
 {v:'rrhh',       ic:'👥', l:'Recursos humanos y selección', d:'Reclutamiento, nómina, tercerización de personal', dpd:0, c:7, mt:{volumen:'c',frecuencia:'c',permanencia:'c',alcance:'b'}, def:{titulares:'b',categorias:'c'},
  k:'recursos humanos rrhh talento humano reclutamiento seleccion hojas de vida hoja de vida cv nomina roles de pago tercerizacion outsourcing headhunter bolsa de empleo'},
 {v:'deportivo',  ic:'⚽', l:'Club, federación o gremio',   d:'Club deportivo, colegio profesional, fundación, ONG', dpd:1, c:0, nl:1, mt:{volumen:'b',frecuencia:'b',permanencia:'c',alcance:'b'}, def:{titulares:'c',categorias:'c'},
  k:'club deportivo federacion liga gremio asociacion camara colegio profesional gimnasio fundacion ong sin fines de lucro iglesia socios afiliados'},
 {v:'publicidad', ic:'📣', l:'Publicidad y perfilamiento',  d:'Marketing, bases de datos, elaboración de perfiles', dpd:1, c:1, mt:{volumen:'c',frecuencia:'c',permanencia:'c',alcance:'c'}, def:{titulares:'c',categorias:'b'},
  k:'publicidad marketing agencia digital redes sociales community manager base de datos data perfiles segmentacion mailing call center telemercadeo encuestas radio television periodico revista medios de comunicacion prensa'},
 {v:'otro',       ic:'', l:'Otro tipo de negocio',        d:'Taller, manufactura, agricultura, servicios varios', dpd:0, c:2, mt:{volumen:'a',frecuencia:'b',permanencia:'b',alcance:'a'}, def:{titulares:'b',categorias:'a'},
  k:'taller mecanica lavadora imprenta fabrica manufactura industria agricultura floricola ganaderia mineria peluqueria barberia spa estetica lavanderia gimnasio limpieza mantenimiento funeraria floristeria otro otra ninguno no se'}
];
const SEC = v => PERFIL_SECTOR.find(x=>x.v===v) || PERFIL_SECTOR[PERFIL_SECTOR.length-1];

/* Personas cuyos datos maneja. Se preguntan por separado porque casi nadie
   tiene la misma cantidad de trabajadores que de clientes: un bróker con tres
   empleados puede manejar diez mil cotizaciones. Los valores n son el punto
   medio de cada rango, para no castigar a quien está en el borde. */
const TRAB=[
 {v:'a', l:'Solo yo',            n:1},
 {v:'b', l:'De 2 a 5',           n:4},
 {v:'c', l:'De 6 a 20',          n:13},
 {v:'d', l:'De 21 a 100',        n:60},
 {v:'e', l:'Más de 100',         n:300}
];
const CLI=[
 {v:'a', l:'Menos de 50',              n:25},
 {v:'b', l:'Entre 50 y 300',           n:175},
 {v:'c', l:'Entre 300 y 1.000',        n:650},
 {v:'d', l:'Entre 1.000 y 10.000',     n:5500},
 {v:'e', l:'Entre 10.000 y 100.000',   n:55000},
 {v:'f', l:'Más de 100.000',           n:250000}
];
const totalPersonas = S => (TRAB.find(x=>x.v===S.trab)||{n:0}).n + (CLI.find(x=>x.v===S.cli)||{n:0}).n;
function titularesBucket(S){
  const t=totalPersonas(S); if(!t) return null;
  return t<=1000?'a':t<=10000?'b':t<=100000?'c':'d';
}

const RANGOS=[
 {v:'a', l:'Menos de USD 100 mil',        val:60000},
 {v:'b', l:'Entre USD 100 mil y 500 mil', val:280000},
 {v:'c', l:'Entre USD 500 mil y 2 millones', val:1100000},
 {v:'d', l:'Entre USD 2 y 10 millones',   val:5000000},
 {v:'e', l:'Más de USD 10 millones',       val:20000000}
];

const ESTADOS=[
 {v:'nada',    ic:'🚫', c:7, l:'No tengo nada todavía',        d:'Ni política, ni registro, ni delegado', cumple:[]},
 {v:'basico',  ic:'', c:1, l:'Tengo lo básico',                   d:'Una política de privacidad publicada, y poco más', cumple:['politica']},
 {v:'medio',   ic:'', c:3, l:'Tengo varias cosas',                d:'Política, contratos y atiendo peticiones, pero sin delegado registrado', cumple:['politica','contratos','arco','encargado']},
 {v:'avanzado',ic:'', c:2, l:'Tengo delegado y documentación',    d:'Delegado registrado, RAT y políticas al día', cumple:['politica','contratos','arco','encargado','rat','consent','dpd_desig','dpd_reg']},
 {v:'nose',    ic:'🤷', c:4, l:'No sé qué tenemos',                 d:'Nadie en la organización lleva esto, o no entiendo la pregunta', cumple:[], inseguro:1}
];

const FALTA={
 dpd_desig:'Nombrar por escrito a un Delegado de Protección de Datos',
 dpd_reg:'Inscribir a ese delegado ante la autoridad de datos',
 dpd_perfil:'Un delegado con el título y los años que pide la ley',
 dpd_indep:'Un delegado que no sea el dueño, ni el de sistemas, ni un familiar',
 medidas:'Tener los datos con clave, bajo llave y con reglas por escrito',
 rat:'Tener por escrito qué datos guarda, de quién y para qué',
 consent:'La aceptación por escrito de sus clientes, sabiendo para qué',
 brechas:'Tener escrito qué hacer, y a quién avisar, si se le filtran datos',
 eipd:'Medir por escrito el riesgo antes de usar datos delicados',
 riesgos:'Tener escrito qué puede salir mal y cómo lo evita',
 contratos:'Firmar un anexo de datos con su contador, su sistema y sus proveedores',
 arco:'Definir quién responde, y en cuántos días, si alguien pide ver o borrar sus datos',
 diseno:'Pedir solo los datos que de verdad necesita',
 politica:'Publicar un aviso de privacidad y mantenerlo al día',
 encargado:'Revisar que quien maneja sus datos por fuera sepa protegerlos'
};
const DUTIES=[
 {id:'dpd_desig', n:'Nombró por escrito a un Delegado de Protección de Datos', law:'Art. 48 LOPDP · infracción del art. 68', cat:'grave', w:10, only:'dpd', dl:'Plazo vencido: 31 de diciembre de 2025 y 26 de mayo de 2026', acc:`Designe por escrito a un Delegado de Protección de Datos e inscríbalo ante la Superintendencia.`},
 {id:'dpd_reg',   n:'Inscribió a ese delegado ante la Superintendencia', law:'Art. 48 LOPDP · Res. SPDP-SPD-2025-0028-R', cat:'grave', w:6, only:'dpd', acc:`Inscriba a su Delegado de Protección de Datos en el sistema de la Superintendencia. Designarlo por dentro no basta.`},
 {id:'dpd_perfil',n:'Ese delegado tiene el título y los años que pide la ley', law:'Art. 55 RGLOPDP · tercer nivel en Derecho, Sistemas, Comunicación o Tecnologías, y 5 años de experiencia', cat:'grave', w:5, only:'dpd', acc:`Verifique que tenga título universitario en Derecho, Sistemas, Comunicación o Tecnología y cinco años de experiencia.`},
 {id:'dpd_indep', n:'Ese delegado no es el dueño, ni el de sistemas, ni un familiar', law:'Art. 56 RGLOPDP · no puede ser representante legal, oficial de cumplimiento, jefe de TI o seguridad, socio ni pariente de administradores', cat:'grave', w:5, only:'dpd', acc:`Esa persona no puede ser el representante legal, el jefe de sistemas, un socio ni un familiar de los dueños.`},
 {id:'medidas',  n:'Los datos están con clave, bajo llave y con reglas por escrito', law:'Art. 68 núm. 1 LOPDP · el tipo más sancionado en Ecuador', cat:'grave', w:12, acc:`Ponga clave a las computadoras y a los archivos con datos, guarde los papeles bajo llave y deje por escrito quién puede ver qué.`},
 {id:'rat',      n:'Tiene por escrito qué datos guarda, de quién y para qué', law:'Art. 68 núms. 10 y 11 LOPDP', cat:'grave', w:8, acc:`Haga una lista escrita de qué datos guarda, de quién, para qué y por cuánto tiempo.`},
 {id:'consent',  n:'Sus clientes aceptaron por escrito, sabiendo para qué', law:'Art. 68 núm. 2 LOPDP · uso para fines distintos a los declarados', cat:'grave', w:8, acc:`Cambie el papel o la casilla con que sus clientes aceptan: debe decir para qué usa sus datos y quedar guardado.`},
 {id:'brechas',  n:'Tiene escrito qué hacer, y a quién avisar, si se le filtran datos', law:'Art. 43 LOPDP reformado por la LOFC · SPDP, ARCOTEL y CSIRT · infracción del art. 68 núm. 7', cat:'grave', w:8, acc:`Escriba un procedimiento de una página: si se filtran datos, quién avisa, a quién y en cinco días.`},
 {id:'eipd',     n:'Midió por escrito el riesgo antes de usar datos delicados', law:'Art. 42 LOPDP · Res. 2025-0003-R · infracción del art. 68 núm. 5', cat:'grave', w:8, only:'eipd', acc:`Haga una evaluación de impacto antes de seguir tratando datos sensibles.`},
 {id:'riesgos',  n:'Tiene escrito qué puede salir mal y cómo lo evita', law:'Art. 68 núm. 4 LOPDP · el tipo aplicado a la FEF en enero de 2026', cat:'grave', w:6, acc:`Escriba qué puede salir mal con los datos que guarda y qué hace usted para evitarlo.`},
 {id:'contratos',n:'Firmó un anexo de datos con su contador, su sistema y sus proveedores', law:'Art. 68 núm. 9 LOPDP · Res. 2025-0006-R', cat:'grave', w:6, acc:`Firme un anexo de protección de datos con su contador, su sistema y quien más maneje sus datos.`},
 {id:'arco',     n:'Sabe quién responde, y en cuántos días, si un cliente pide ver o borrar sus datos', law:'Art. 67 núm. 1 LOPDP', cat:'leve', w:6, acc:`Defina quién responde cuando un cliente pida ver, corregir o borrar sus datos, y en cuántos días.`},
 {id:'diseno',   n:'Pide solo los datos que de verdad necesita', law:'Art. 67 núm. 2 LOPDP · el tipo aplicado a LigaPro en enero de 2026', cat:'leve', w:6, acc:`Antes de pedir un dato nuevo, pregúntese si de verdad lo necesita. Pida lo mínimo.`},
 {id:'politica', n:'Tiene publicado un aviso de privacidad al día', law:'Art. 67 núm. 3 LOPDP', cat:'leve', w:5, acc:`Publique un aviso de privacidad donde sus clientes puedan verlo.`},
 {id:'encargado',n:'Revisó que quien maneja sus datos por fuera sepa protegerlos', law:'Art. 67 núm. 4 LOPDP', cat:'leve', w:5, acc:`Revise que las empresas a las que les pasa datos tengan con qué protegerlos.`}
];

const MTGE={
 titulares:{n:'Número de titulares',o:[{v:'a',l:'Hasta 1.000',p:1},{v:'b',l:'1.001 a 10.000',p:2},{v:'c',l:'10.001 a 100.000',p:3},{v:'d',l:'Más de 100.000',p:4}]},
 volumen:{n:'Tipos de dato por titular',o:[{v:'a',l:'Hasta 10 campos',p:0.5},{v:'b',l:'11 a 30 campos',p:1},{v:'c',l:'31 a 100 campos',p:2},{v:'d',l:'Más de 100 campos',p:3}]},
 categorias:{n:'Categorías de datos',o:[{v:'a',l:'Solo datos básicos',p:0.5},{v:'b',l:'Una categoría especial',p:2},{v:'c',l:'Varias especiales o grupos vulnerables',p:3}]},
 frecuencia:{n:'Frecuencia',o:[{v:'a',l:'Puntual',p:0.5},{v:'b',l:'Periódica',p:1},{v:'c',l:'Continua',p:2}]},
 permanencia:{n:'Permanencia',o:[{v:'a',l:'Ocasional',p:0.5},{v:'b',l:'Temporal',p:1},{v:'c',l:'Prolongada, 3 años o más',p:2}]},
 alcance:{n:'Alcance geográfico',o:[{v:'a',l:'Local',p:1},{v:'b',l:'Nacional',p:2},{v:'c',l:'Global',p:3}]}
};
/* Traducción de cada variable del modelo a una frase que entienda cualquiera */
const PLAIN={
 titulares:{a:'Guarda datos de hasta 1.000 personas',b:'Guarda datos de entre 1.001 y 10.000 personas',
            c:'Guarda datos de entre 10.001 y 100.000 personas',d:'Guarda datos de más de 100.000 personas'},
 volumen:{a:'De cada persona guarda pocos datos',b:'De cada persona guarda una decena de datos',
          c:'De cada persona guarda bastantes datos',d:'De cada persona guarda un expediente completo'},
 categorias:{a:'Solo maneja datos básicos, como nombre y teléfono',b:'Entre sus datos hay alguno delicado, como salud o huella',
             c:'Maneja varios datos delicados, o datos de menores de edad'},
 frecuencia:{a:'Usa esos datos de vez en cuando',b:'Usa esos datos cada cierto tiempo',c:'Usa esos datos todos los días'},
 permanencia:{a:'Los guarda poco tiempo',b:'Los guarda un tiempo limitado',c:'Los guarda tres años o más'},
 alcance:{a:'Atiende solo en su ciudad o su zona',b:'Atiende en todo el país',c:'Atiende también fuera del Ecuador'}
};

const MTGE_MAX=Object.values(MTGE).reduce((t,k)=>t+Math.max(...k.o.map(o=>o.p)),0);

function mtgeScore(s){
  const d=SEC(s.sector).mt, full={...d, titulares:s.titulares, categorias:s.categorias};
  let total=0; const rows=[];
  Object.entries(MTGE).forEach(([k,def],idx)=>{
    const sel=def.o.find(o=>o.v===full[k])||def.o[0]; total+=sel.p;
    rows.push({k,v:sel.v,n:def.n,l:sel.l,p:sel.p,max:Math.max(...def.o.map(o=>o.p)),c:C[idx],inferido: MODO==='rapido' ? true : !(k==='titulares'||k==='categorias')});
  });
  return {total,rows,granEscala: total>=6 && (full.titulares||'a')!=='a'};
  /* Criterio: la gran escala requiere alcanzar el umbral de puntos y además
     que el tratamiento involucre a más de 1.000 titulares. */
}
function severity(s){
  const imp=clamp(({a:.2,b:.4,c:.6,d:.9}[s.titulares]??.4)+({a:0,b:.2,c:.35}[s.categorias]??0),0,1);
  let it=s.incidente==='si'?.70:s.incidente==='nose'?.60:.35;
  if(s.spdp==='requerimiento')it=Math.max(it,.80);
  if(s.spdp==='medidas')it=Math.max(it,.85);
  if(s.spdp==='sancion')it=Math.max(it,.90);
  const re=s.spdp==='sancion'?.20:0;
  /* SDI = 2(IED + INT + RER), conforme al numeral 2.3 del modelo MPRIV-1 de la
     Resolución SPDP-SPD-2025-0022-R. El factor 2 es el catalizador de agravación
     y atenuación previsto en ese modelo. */
  const CATALIZADOR = 2;
  const base=clamp(.6*imp+.4*it+re,.15,1);
  const m=base*CATALIZADOR, a=clamp(m*.7,.1,4), c=clamp(m*1.35,.1,4);
  return {a,b:m,c,pert:(a+4*m+c)/6,impacto:imp,intenc:it,reinc:re>0,sdi:m};
}
function fineFor(cat,s,sv,pdi){
  const [lo,hi]=RATES[cat];
  const min=lo*s.vdn, max=hi*s.vdn;
  const cdi=min+(pdi/100)*(max-min), at=f=>clamp(cdi*f,min,max);
  return {min:at(sv.a),prob:at(sv.pert),max:at(sv.c),legalMin:min,legalMax:max};
}
function applicable(s,mt){
  const sec=SEC(s.sector);
  /* El listado sectorial obliga a las organizaciones; para una persona natural
     (un psicólogo, un odontólogo con consultorio propio) el delegado solo entra
     si además su tratamiento alcanza la gran escala. */
  const dpdObl = mt.granEscala || (!!sec.dpd && s.persona!=='natural');
  const eipdObl=mt.granEscala||s.categorias!=='a';
  return DUTIES.filter(d=>!d.only||(d.only==='dpd'&&dpdObl)||(d.only==='eipd'&&eipdObl));
}
function compute(s){
  const mt=mtgeScore(s), duties=applicable(s,mt), done=new Set(s.cumple||[]);
  const gaps=duties.filter(d=>!done.has(d.id));
  const wT=duties.reduce((t,d)=>t+d.w,0), wD=duties.reduce((t,d)=>t+(done.has(d.id)?d.w:0),0);
  const score=Math.round(wT?wD/wT*100:100), pdi=100-score, sv=severity(s);
  const fines={leve:fineFor('leve',s,sv,pdi),grave:fineFor('grave',s,sv,pdi)};
  const rows=gaps.map(d=>({...d,f:fines[d.cat]})), sum=k=>rows.reduce((t,r)=>t+r.f[k],0);
  const sec=SEC(s.sector), isNat=s.persona==='natural';
  const graves=gaps.filter(g=>g.cat==='grave').length, sensible=s.categorias!=='a', muchos=['c','d'].includes(s.titulares);
  const lv=(b,c)=>c?'alto':b?'medio':'bajo';

  return {mt,duties,gaps:rows,done:duties.filter(d=>done.has(d.id)),score,pdi,sev:sv,fines,graves,
          overdue:gaps.filter(g=>g.dl).length,sec,isNat,
          total:{min:sum('min'),prob:sum('prob'),max:sum('max')}};
}

/* ── 5 preguntas ─────────────────────────────────────────────────── */
/* ── Las preguntas ───────────────────────────────────────────────────
   Ya no se pregunta por el contacto previo con la Superintendencia: quien
   no tiene nada implementado casi nunca ha tenido contacto, y quien ya fue
   sancionado no necesita que le implementen, necesita que lo defiendan. Eso
   se resuelve con un control opcional en el resultado.                    */
const Q_RAPIDO=[
 {id:'sector',q:'¿A qué se dedica?',help:'Escriba su actividad o elija la más parecida. Si no ve la suya, la última opción sirve igual.',type:'sector'},
 {id:'datos',q:'¿De cuántas personas guarda datos?',help:'Cuéntelas por separado, que casi nunca son la misma cantidad.',type:'datos'},
 {id:'vdn',q:'¿Cuánto factura al año, más o menos?',help:'Un rango basta. La multa es un porcentaje de esa cifra: por eso cambia tanto de un negocio a otro.',type:'vdn'},
 {id:'estado',q:'¿Qué tiene hoy en protección de datos?',help:'Responda sin miedo. «Nada» y «no sé» son las respuestas más comunes, y el resultado sale igual.',type:'estado'}
];

const Q_DETALLE=[
 {id:'sector',q:'¿A qué se dedica su organización?',help:'Escriba su actividad o elija la más parecida. Varias de estas tienen exigencias propias, sin importar el tamaño.',type:'sector'},
 {id:'datos',q:'¿De cuántas personas guarda datos, y de qué tipo?',help:'Cuéntelas por separado, que casi nunca son la misma cantidad.',type:'datos'},
 {id:'vdn',q:'¿Cuánto facturó el último año?',help:'Los ingresos que declaró al SRI. Sobre esa cifra se calcula cada multa.',type:'vdn'},
 {id:'cumple',q:'Marque lo que sí tiene hoy',help:'Marque solo lo que puede probar con un documento. Cada casilla que quede vacía es una multa aparte, y a la derecha ve cuánto suma.',type:'duties'}
];
let MODO='rapido';
const Q = () => MODO==='rapido' ? Q_RAPIDO : Q_DETALLE;

const PERFILES=[
 {n:'Odontólogo',   d:'Consultorio · $85 K',      c:0, s:{sector:'salud',persona:'natural',vdn:85000,titulares:'b',categorias:'b',cumple:['politica'],incidente:'nose',spdp:'ninguno'}},
 {n:'Bróker de seguros',d:'Persona natural · $180 K',c:2,s:{sector:'financiero',persona:'natural',vdn:180000,titulares:'b',categorias:'c',cumple:['politica','arco'],incidente:'no',spdp:'ninguno'}},
 {n:'Cafetería',    d:'Fidelización · $140 K',    c:4, s:{sector:'otro',persona:'compania',vdn:140000,titulares:'a',categorias:'a',cumple:['politica','arco','encargado'],incidente:'no',spdp:'ninguno'}},
 {n:'Estudio jurídico',d:'4 abogados · $320 K',   c:6, s:{sector:'legal',persona:'compania',vdn:320000,titulares:'a',categorias:'c',cumple:['politica','contratos','arco'],incidente:'no',spdp:'ninguno'}},
 {n:'Farmacia',     d:'Cadena pequeña · $650 K',  c:0, s:{sector:'salud',persona:'compania',vdn:650000,titulares:'c',categorias:'b',cumple:['politica'],incidente:'nose',spdp:'ninguno'}},
 {n:'Colegio',      d:'1.200 alumnos · $1,8 M',   c:1, s:{sector:'educacion',persona:'compania',vdn:1800000,titulares:'b',categorias:'c',cumple:['politica','contratos'],incidente:'no',spdp:'ninguno'}},
 {n:'Clínica',      d:'45.000 pacientes · $2,4 M',c:0, s:{sector:'salud',persona:'compania',vdn:2400000,titulares:'c',categorias:'c',cumple:['politica','rat','contratos','arco'],incidente:'si',spdp:'ninguno'}},
 {n:'E-commerce',   d:'80.000 clientes · $3,5 M', c:4, s:{sector:'comercio',persona:'compania',vdn:3500000,titulares:'c',categorias:'b',cumple:['politica','arco','encargado','contratos'],incidente:'no',spdp:'ninguno'}},
 {n:'Club deportivo',d:'Biometría · $6 M',        c:0, s:{sector:'deportivo',persona:'compania',vdn:6000000,titulares:'d',categorias:'c',cumple:['politica','rat'],incidente:'si',spdp:'medidas'}},
 {n:'Cooperativa',  d:'250.000 socios · $12 M',   c:2, s:{sector:'financiero',persona:'compania',vdn:12000000,titulares:'d',categorias:'c',cumple:['politica','rat','contratos','arco','encargado','dpd_desig','dpd_reg'],incidente:'no',spdp:'requerimiento'}}
];

/* casos resueltos publicados por la SPDP */
const CASOS=[
 {e:'LigaPro',f:'Diciembre 2025',m:259644.01,art:'Art. 68 núm. 1 · grave',c:0,
  res:'RES-SPDP-ICS-2025-0002', u:'https://spdp.gob.ec/wp-content/uploads/2025/12/Resolucion-No.-RES-SPDP-ICS-2025-0002-0004-final-.pdf',
  d:'Medidas de seguridad insuficientes en la app Fan ID, con reconocimiento facial. El consentimiento para tratar datos biométricos se obtuvo de forma inválida.',
  x:'Ordenada la notificación a 14.398 titulares y la eliminación de sus datos de todas las bases.'},
 {e:'LigaPro',f:'Enero 2026',m:95502.63,art:'Art. 67 núm. 2 · leve',c:1,
  res:'RES-SPDP-ICS-2025-0005', u:'https://spdp.gob.ec/wp-content/uploads/2026/01/RESOLUCION-Nro.-RES-SPDP-ICS-2025-0005VF-of.pdf',
  d:'Falta de protección de datos desde el diseño y por defecto en la misma aplicación, respecto de los datos biométricos.',
  x:'Un mes para rediseñar la aplicación. Diez días para pagar. Una infracción leve, casi cien mil dólares.'},
 {e:'FEF',f:'Diciembre 2025',m:194856.16,art:'Art. 68 núm. 1 · grave',c:2,
  res:'RES-SPDP-ICS-PASN-2025-0003', u:'https://spdp.gob.ec/wp-content/uploads/2025/12/RESOLUCION-Nro.-RES-SPDP-ICS-PASN-2025-0003-f-signed_redacted-1.pdf',
  d:'Consentimiento inválido en la app Fan FEF, usada para la venta de entradas de la selección.',
  x:'Actualizar el RAT, adoptar una política conforme a la ley, notificar a los titulares y eliminar los datos.'},
 {e:'FEF',f:'Enero 2026',m:194469.85,art:'Art. 68 núm. 4 · grave',c:5,
  res:'RES-SPDP-ICS-2025-0006', u:'https://spdp.gob.ec/wp-content/uploads/2026/01/RESOLUCION-Nro.-RES-SPDP-ICS-2025-0006-signed-2.pdf',
  d:'Metodología de análisis de riesgos inadecuada. La evaluación de impacto no se ajustó a la naturaleza de los datos y concluyó que los riesgos eran inexistentes.',
  x:'Un mes para reformular la metodología y la EIPD. Tener una evaluación mal hecha se sancionó igual que no tenerla.'}
];

const CARTERA_TXT=`Somos el Delegado de Protección de Datos de <b>más de 60 organizaciones</b> y hemos implementado el sistema de protección de datos en <b>más de 130 compañías y personas naturales</b>. <b>De ocho a doce días</b> desde que arrancamos hasta entregarle el sistema implementado y auditado.`;
const BRANDS={
 tempolegal:{ini:'TL',name:'TempoLegal',
  h1:'¿Cuánto le pueden multar por <em>no proteger los datos</em> que usted guarda?',
  sub:'Si guarda nombres, cédulas, correos o teléfonos de clientes, trabajadores o proveedores, la ley le obliga a protegerlos. Cuatro preguntas, menos de un minuto.',
  lead:'Le enviamos su lista de pendientes, en orden y con plazos',
  leadSub:'Dos páginas, gratis y sin compromiso: qué le falta, por dónde empezar, qué plazo ya se le venció y cuánto demora cada cosa. Es el mismo documento con el que abrimos un caso. Con eso en la mano, un abogado le escribe para ver el suyo.',
  btn:'Enviarme el informe', mail:'info@tempolegal.com',
  cta:{crit:'Quiero hablar con un abogado',mid:'Quiero hablar con un abogado',good:'Quiero hablar con un abogado'},
  cost:'',},
};

const DEF={sector:undefined,persona:'compania',vdn:280000,rango:'b',trab:undefined,cli:undefined,titulares:undefined,categorias:undefined,cumple:[],incidente:undefined,spdp:'ninguno',estado:undefined,inseguro:0};
let S={...DEF,cumple:[]}, i=0;
const $=id=>document.getElementById(id);
const brand=()=>BRANDS[document.documentElement.dataset.brand];
const visible=()=>Q().filter(q=>!(q.skipIf&&q.skipIf(S)));

function paintBrand(){
  const b=brand(); $('h1').innerHTML=b.h1; $('sub').textContent=b.sub;
  $('logotop').src=LOGO; $('logotop').alt=b.name; const lf=$('logofin'); if(lf) lf.src=LOGO; $('social').innerHTML=CARTERA_TXT;
  if(!$('result').classList.contains('hidden')) renderResult();
}
/* La marca CumpliDatos queda definida arriba pero desactivada: por ahora la
   herramienta sale solo bajo TempoLegal. Para reactivarla basta con volver a
   poner los dos botones de marca en la barra superior. */

$('pgrid').innerHTML=PERFILES.map((p,x)=>
 `<button class="pcard" data-p="${x}" style="--cc:${C[p.c]}"><span class="pn">${p.n}</span><span class="pd">${p.d}</span></button>`).join('');
$('pgrid').querySelectorAll('.pcard').forEach(b=>{b.onclick=()=>{
  const pf=PERFILES[+b.dataset.p]; S={...DEF,...pf.s, esPerfil:pf.n};
  $('hero').classList.add('hidden');renderResult();};});

function arrancar(modo,conservar){ const _rs=$('restart'); if(_rs) _rs.style.visibility='visible';
  MODO=modo;
  TL.track('calc_inicio',{modo});
  if(!conservar){ S={...DEF,cumple:[]}; LIVE=0; }
  YA_MIDIO=false;
  $('hero').classList.add('hidden'); $('result').classList.add('hidden');
  $('flow').classList.remove('hidden'); i=0; render(); window.scrollTo({top:0,behavior:'smooth'});
}
$('start').onclick=()=>arrancar('rapido');
$('startDet').onclick=e=>{e.preventDefault();arrancar('detallado');};
$('restart').onclick=()=>{S={...DEF,cumple:[]};$('result').classList.add('hidden');$('flow').classList.add('hidden');$('hero').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});};
$('back').onclick=()=>{ if(i>0){i--;render();} else $('restart').click(); };
$('next').onclick=()=>{const l=visible(); if(i<l.length-1){i++;render();} else renderResult();};
document.addEventListener('keydown',e=>{
  if($('flow').classList.contains('hidden'))return;
  const et=((e.target||{}).tagName||'').toUpperCase();
  if(et==='INPUT'||et==='TEXTAREA'||et==='SELECT'||(e.target||{}).isContentEditable) return;
  if(e.key==='ArrowLeft')$('back').click();
  else if(e.key==='ArrowRight'||(e.key==='Enter'&&et!=='BUTTON'&&et!=='A'))$('next').click();
});

function render(){
  const list=visible(), q=list[i];
  $('steps').innerHTML=list.map((_,x)=>
    `<button class="sdot ${x<i?'done':x===i?'now':''}" data-s="${x}" ${x>i?'disabled':''} title="Paso ${x+1}"></button>`).join('');
  $('steps').querySelectorAll('.sdot').forEach(d=>{d.onclick=()=>{i=+d.dataset.s;render();};});
  $('next').textContent=(i===list.length-1)?'Ver mi resultado →':'Continuar →';
  $('back').textContent=i===0?'← Inicio':'← Volver';

  let body=`<div class="stepnum">Paso ${i+1} de ${list.length}</div><h2 class="q">${q.q}</h2><p class="qhelp">${q.help}</p>`;

  if(q.type==='sector'){
    body+=`<div class="buscar"><span class="lupa"></span>
      <input id="qsec" type="text" autocomplete="off" placeholder="Escriba a qué se dedica: restaurante, taller, bróker, colegio…">
      <button type="button" class="limpiar hidden" id="qclr" aria-label="Limpiar">✕</button></div>`;
    body+=`<div class="opts grid" id="secgrid">`+PERFIL_SECTOR.map(o=>
      `<button class="opt" data-v="${o.v}" data-busca="${o.l} ${o.d} ${o.k||''}" aria-pressed="${S.sector===o.v}" style="--cc:${C[o.c]}">
        <span class="ic">${o.ic}</span><span style="flex:1"><span class="lbl">${o.l}</span><span class="dsc">${o.d}</span></span></button>`).join('')+`</div>`;
    body+=`<div class="nohay hidden" id="nosec">No encontramos esa actividad en la lista. <b>Elija «Otro tipo de negocio»</b>: el cálculo sale igual de completo.</div>`;
  } else if(q.type==='vdn'){
    body+=`<div class="subq" style="--sc:${C[0]}">¿Factura como persona natural o como compañía?</div>
      <div class="opts two" data-g="persona">
        ${['natural','compania'].map((v,x)=>`<button class="opt" data-v="${v}" aria-pressed="${S.persona===v}" style="--cc:${C[x]}">
          <span class="ic">${v==='natural'?'':''}</span><span class="lbl">${v==='natural'?'Persona natural':'Compañía'}</span></button>`).join('')}
      </div>
      <div class="subq" style="--sc:${C[1]}">Ingresos del último año</div>
      <div class="opts" data-g="rango">${RANGOS.map((o,x)=>
        `<button class="opt" data-v="${o.v}" aria-pressed="${S.rango===o.v}" style="--cc:${C[x%8]}">
          <span class="box"></span><span class="lbl">${o.l}</span>
          <span class="pts rojo">${fmt(o.val*0.007)} – ${fmt(o.val*0.01)} por falta grave</span></button>`).join('')}</div>
      <div class="subq" style="--sc:${C[2]}">Si prefiere, escriba la cifra exacta</div>
      <div class="money"><span>USD</span><input id="vdn" inputmode="numeric" value="${S.vdn.toLocaleString('es-EC')}"></div>`;
  } else if(q.type==='datos'){
    const tot=totalPersonas(S);
    body+=`<p class="qnota">Cuente a todos, no solo a los que le compran. Un proveedor con su nombre y su cédula en el sistema cuenta igual que un cliente. Es muy común tener tres trabajadores y mil personas más en las bases, porque cada cotización, cada factura y cada lista de contactos suma.</p>
      <div class="subq" style="--sc:${C[0]}">¿Cuántas personas trabajan con usted?</div><div class="opts grid" data-g="trab">`+
      TRAB.map(o=>`<button class="opt" data-v="${o.v}" aria-pressed="${S.trab===o.v}" style="--cc:${C[0]}">
        <span class="box"></span><span class="lbl">${o.l}</span></button>`).join('')+`</div>
      <div class="subq" style="--sc:${C[1]}">¿De cuántas personas de afuera guarda datos? Clientes, pacientes, socios, proveedores, contactos</div><div class="opts grid" data-g="cli">`+
      CLI.map(o=>`<button class="opt" data-v="${o.v}" aria-pressed="${S.cli===o.v}" style="--cc:${C[1]}">
        <span class="box"></span><span class="lbl">${o.l}</span></button>`).join('')+`</div>
      <div class="totp${tot?'':' hidden'}" id="totp"></div>`;
    if(MODO==='detallado'){
      body+=`<div class="subq" style="--sc:${C[4]}">¿Qué tipo de datos son?</div><div class="opts" data-g="categorias">`+
      [['a','Solo datos básicos','Nombre, cédula, correo, teléfono'],
       ['b','Además algún dato delicado','Salud, huella o rostro, datos financieros, ideología u orientación'],
       ['c','Varios datos delicados, o datos de niños','Historia clínica, datos de menores, antecedentes penales']]
      .map(([v,l,d])=>
        `<button class="opt dut" data-v="${v}" aria-pressed="${S.categorias===v}" style="--cc:${C[4]}">
        <span class="box"></span><span style="flex:1"><span class="lbl">${l}</span><span class="dsc">${d}</span></span></button>`).join('')+`</div>`;
    }
  } else if(q.type==='duties'){
    const mt=mtgeScore(S), all=applicable(S,mt);
    const dpd=all.filter(d=>d.only==='dpd'), rest=all.filter(d=>d.only!=='dpd');
    const btn=d=>`<button class="opt dut" data-duty="${d.id}" aria-pressed="${S.cumple.includes(d.id)}" style="--cc:${d.cat==='grave'?'var(--critical)':'var(--serious)'}">
        <span class="box"></span><span style="flex:1"><span class="lbl">${d.n}</span><span class="dsc">${S.persona==='natural'?d.law.split('—')[0].trim():d.law}</span>
        <span class="tagline ${d.cat==='grave'?'tag-grave':'tag-leve'}">Infracción ${d.cat}</span></span><span class="dueamt" data-amt="${d.id}"></span></button>`;
    body+=`<div class="opts two" style="margin-bottom:6px">
      <button class="opt" id="qNada" style="--cc:${C[7]}"><span class="ic"></span><span class="lbl">No cuento con nada</span></button>
      <button class="opt" id="qNose" style="--cc:${C[4]}"><span class="ic"></span><span style="flex:1"><span class="lbl">No sé qué me están preguntando</span><span class="dsc">Le damos el resultado igual</span></span></button></div>`;
    if(dpd.length) body+=`<div class="subq" style="--sc:var(--critical)">Su delegado de protección de datos. Son cuatro requisitos distintos y hay que cumplir los cuatro</div><div class="opts">${dpd.map(btn).join('')}</div>`;
    body+=`<div class="subq" style="--sc:${C[1]}">El resto de lo que le pide la ley</div><div class="opts">${rest.map(btn).join('')}</div>`;
  } else if(q.type==='estado'){
    body+=`<div class="opts">`+ESTADOS.map(o=>
      `<button class="opt" data-v="${o.v}" aria-pressed="${S.estado===o.v}" style="--cc:${C[o.c]}">
        <span class="ic">${o.ic}</span><span style="flex:1"><span class="lbl">${o.l}</span><span class="dsc">${o.d}</span></span></button>`).join('')+`</div>
      <p class="qhelp" style="margin:16px 0 0">Si quiere el detalle exacto obligación por obligación, puede hacer el <a href="#" id="toDet" style="color:var(--brand-ink);font-weight:650">cálculo detallado</a>.</p>`;
  }
  $('step').innerHTML=body;

  const toDet=$('toDet');
  if(toDet) toDet.onclick=e=>{e.preventDefault();arrancar('detallado',true);};
  const vdnEl=$('vdn');
  if(vdnEl) vdnEl.oninput=()=>{const raw=vdnEl.value.replace(/[^\d]/g,'');S.vdn=Math.max(0,parseInt(raw||'0',10));
    vdnEl.value=S.vdn?S.vdn.toLocaleString('es-EC'):'';S.rango=null;
    $('step').querySelectorAll('[data-g="rango"] .opt').forEach(b=>b.setAttribute('aria-pressed','false'));updateHint();};

  $('step').querySelectorAll('.opt').forEach(btn=>{btn.onclick=()=>{
    if(btn.dataset.duty){
      const id=btn.dataset.duty;
      S.cumple=S.cumple.includes(id)?S.cumple.filter(x=>x!==id):[...S.cumple,id];
      btn.setAttribute('aria-pressed',S.cumple.includes(id));
    } else {
      const g=btn.parentElement.dataset.g;
      if(g){
        S[g]=btn.dataset.v;
        if(g==='rango'){const r=RANGOS.find(o=>o.v===btn.dataset.v);S.vdn=r.val;if(vdnEl)vdnEl.value=r.val.toLocaleString('es-EC');}
        if(g==='trab'||g==='cli'){ S.titulares=titularesBucket(S)||S.titulares; pintarTotal();
          if(S.trab&&S.cli) TL.track('calc_personas',{total:totalPersonas(S), trabajadores:S.trab, externos:S.cli}); }
        if(g==='rango') TL.track('calc_facturacion',{rango:btn.dataset.v});
        btn.parentElement.querySelectorAll('.opt').forEach(b=>b.setAttribute('aria-pressed',b===btn));
      } else {
        S[q.id]=btn.dataset.v;
        if(q.type==='estado'){
          const e=ESTADOS.find(x=>x.v===btn.dataset.v);
          S.cumple=[...e.cumple]; S.inseguro=e.inseguro||0;
          S.incidente = e.inseguro?'nose':'no'; S.spdp='ninguno';
        }
        if(q.type==='sector'){ TL.track('calc_actividad',{sector:btn.dataset.v}); }
        if(q.type==='sector'&&MODO==='rapido'){
          const d=SEC(btn.dataset.v).def; S.categorias=d.categorias;
          if(!S.cli) S.titulares=d.titulares;   /* supuesto provisional, hasta el paso siguiente */
        }
        $('step').querySelectorAll('.opt').forEach(b=>b.setAttribute('aria-pressed',b===btn));
        setTimeout(()=>$('next').click(),180);
      }
    }
    updateHint();
  };});
  const qN=$('qNada'), qS=$('qNose');
  if(qN) qN.onclick=e=>{e.stopPropagation();S.cumple=[];S.inseguro=0;
    $('step').querySelectorAll('.opt[data-duty]').forEach(b=>b.setAttribute('aria-pressed','false'));
    $('next').click();};
  if(qS) qS.onclick=e=>{e.stopPropagation();S.cumple=[];S.inseguro=1;
    S.incidente=S.incidente||'nose';S.spdp=S.spdp||'ninguno';renderResult();};
  armarBuscador(); pintarTotal(); updateHint();
  TL.track('calc_paso',{paso:i+1, de:visible().length, id:q.id, modo:MODO});
  window.scrollTo({top:0,behavior:'smooth'});
}

function pintarTotal(){
  const el=$('totp'); if(!el) return;
  const t=totalPersonas(S), mt=mtgeScore(S);
  el.classList.toggle('hidden',!t);
  if(!t) return;
  el.innerHTML=`Usted guarda datos de <b>unas ${t.toLocaleString('es-EC')} personas</b>. `+
    'Cada una de ellas puede reclamarle por su cuenta, y esa cifra pesa en cómo se calcula la multa.';
  el.style.setProperty('--tp','var(--brand)');
}

const sinTildes = t => (t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

function armarBuscador(){
  const inp=$('qsec'); if(!inp) return;
  const filtrar=()=>{
    const t=sinTildes(inp.value.trim());
    $('qclr').classList.toggle('hidden', !t);
    let visibles=0;
    $('secgrid').querySelectorAll('.opt').forEach(b=>{
      const heno = sinTildes(b.dataset.busca);
      const ok = !t || t.split(/\s+/).filter(Boolean).every(w => heno.includes(w));
      b.classList.toggle('hidden', !ok); if(ok) visibles++;
    });
    const otro=$('secgrid').querySelector('.opt[data-v="otro"]');
    if(t && visibles===0 && otro) otro.classList.remove('hidden');
    $('nosec').classList.toggle('hidden', !(t && visibles===0));
  };
  inp.oninput=filtrar;
  inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault();
    const v=$('secgrid').querySelector('.opt:not(.hidden)'); if(v) v.click(); } };
  $('qclr').onclick=()=>{ inp.value=''; filtrar(); inp.focus(); };
}

function updateHint(){
  const q=visible()[i], mt=mtgeScore(S);
  if(q.type==='duties'){
    const g=applicable(S,mt).filter(d=>!S.cumple.includes(d.id)).length;
    $('hint').textContent=g===0?'No le queda ninguna sin marcar':`${g} sin marcar, ${g===1?'una multa aparte':'una multa aparte cada una'}`;
  } else if(q.type==='vdn'){ $('hint').textContent=S.vdn?`Cada falta grave: ${fmt(S.vdn*0.007)} – ${fmt(S.vdn*0.01)}`:''; }
  else if(q.type==='datos'){ const t=totalPersonas(S);
    $('hint').textContent = t ? `${t.toLocaleString('es-EC')} personas en total` : 'Responda las dos: casi nunca son la misma cantidad'; }
  else $('hint').textContent='';
  refreshDutyAmounts(); liveUpdate();
  const need = q.type==='sector' ? !!S.sector
    : q.type==='datos' ? !!(S.trab&&S.cli)
    : q.type==='vdn' ? S.vdn>0
    : q.type==='estado' ? !!S.estado : true;
  const nx=$('next'); if(nx) nx.disabled=!need;
}

/* ── contador de multas en vivo ─────────────────────────────────────
   Recalcula el total con lo que el usuario lleva respondido y lo anima.
   Antes de la primera respuesta se queda en cero y en gris.            */
let LIVE=0, LIVETOK=0, FIGTOK=0;
let YA_MIDIO=false;   /* el resultado se mide una vez, no en cada repintado */
function liveUpdate(){
  const box=$('live'), v=$('liveV'), d=$('liveD');
  if(!box||!v) return;
  if(!S.sector){ box.classList.add('espera'); v.textContent='USD 0'; LIVE=0;
    $('liveB').innerHTML=''; $('liveL').innerHTML='';
    d.textContent='Empiece por la primera pregunta'; return; }
  const r=compute(S), target=r.total.prob;
  const lista=visible(), idxVdn=lista.findIndex(q=>q.type==='vdn');
  const revelar = idxVdn<0 || i>=idxVdn;
  const hechas=new Set(r.done.map(x=>x.id));
  $('liveB').innerHTML = r.duties.map(x=>{
    const c = hechas.has(x.id) ? 'var(--good)' : x.cat==='grave' ? 'var(--critical)' : 'var(--warning)';
    return `<i style="background:${c}" title="${x.n}"></i>`;
  }).join('');
  $('liveL').innerHTML = `<span><i style="background:var(--critical)"></i>falta grave</span>`+
    `<span><i style="background:var(--warning)"></i>falta leve</span>`+
    `<span><i style="background:var(--good)"></i>ya lo tiene</span>`;
  if(!revelar){
    box.classList.add('espera'); v.textContent='—'; LIVE=0;
    d.innerHTML = `Le faltan <b>${r.gaps.length}</b> de las ${r.duties.length} cosas que le pide la ley · díganos cuánto factura y le ponemos la cifra`;
    return;
  }
  box.classList.remove('espera');
  const enDeberes = lista[i] && lista[i].type==='duties';
  d.innerHTML = r.gaps.length
    ? `<b>${r.gaps.length}</b> ${r.gaps.length===1?'multa':'multas'}${r.graves?`, ${r.graves} por falta grave`:''} · ${enDeberes?'baja con cada casilla que marque':'se ajusta con cada respuesta'}`
    : 'Con lo que ha marcado, no le queda ninguna multa abierta';
  if(Math.round(target)===Math.round(LIVE)){ v.textContent=fmt(target); return; }
  box.classList.add('bump'); setTimeout(()=>box.classList.remove('bump'),230);
  const from=LIVE, t0=performance.now(), tok=++LIVETOK; LIVE=target;
  (function tick(t){ if(tok!==LIVETOK) return;
    const p=Math.min(1,(t-t0)/620), e=1-Math.pow(1-p,3);
    v.textContent=fmt(from+(target-from)*e); if(p<1) requestAnimationFrame(tick); })(t0);
}

/* monto en rojo junto a cada obligación del diagnóstico detallado */
function refreshDutyAmounts(){
  const marcas=document.querySelectorAll('.opt[data-duty] .dueamt');
  if(!marcas.length) return;
  const r=compute(S);
  marcas.forEach(el=>{
    const id=el.dataset.amt, g=r.gaps.find(x=>x.id===id);
    if(S.cumple.includes(id)){ el.className='dueamt ok'; el.textContent='✓ lo tiene'; }
    else { el.className='dueamt'; el.textContent=g?'+ '+fmt(g.f.prob):''; }
  });
}

/* ── resultado ───────────────────────────────────────────────────── */
function renderResult(){
  const r=compute(S), b=brand();
  $('flow').classList.add('hidden'); $('hero').classList.add('hidden');
  const el=$('result'); el.classList.remove('hidden');
  const band=r.score>=80?{k:'good',l:'En regla',c:'var(--good)'}:r.score>=50?{k:'mid',l:'A medias',c:'var(--warning)'}:{k:'crit',l:'En rojo',c:'var(--critical)'};

  const caseCard=c=>`<div class="case${c.slot?' slot':''}" style="--cc:${C[c.c]}">
    <div class="ch"><span class="cn">${c.e}</span><span class="cf">${c.f}</span></div>
    <div class="cm">${c.m!=null?fmt(c.m):'[monto]'}</div>
    <div class="cart">${c.art}</div><div class="cd">${c.d}</div><div class="cx">${c.x}</div>
    ${c.u?`<a class="cres" href="${c.u}" target="_blank" rel="noopener">${c.res} · leer la resolución ↗</a>`:''}</div>`;

  const aviso = S.esPerfil ? '' : S.inseguro
    ? `<div class="sec" style="--hc:${C[4]};background:color-mix(in srgb,var(--warning) 8%,transparent)">
        <h3>Nos dijo que no sabe qué tiene</h3>
        <p class="lead-in" style="margin:0 0 12px">Es lo que más nos responden, y no es un problema para empezar. Eso sí, hay algo que conviene tener claro desde ya. Ante la Superintendencia, <b>quien tiene que probar que cumple es usted</b>. Si no lo puede mostrar en un papel, para el expediente es como si no lo tuviera. Por eso este cálculo parte de que no hay nada guardado por escrito.</p>
        <button class="btn ghost sm" id="toDet2">Ir marcando lo que sí tengo →</button></div>`
    : (MODO==='rapido'
      ? `<div class="sec" style="--hc:${C[3]};background:var(--sunken)">
        <h3>Este es el cálculo rápido</h3>
        <p class="lead-in" style="margin:0 0 12px">Salió de sus cuatro respuestas; el resto lo asumimos con lo habitual en su actividad. Sirve para saber de qué tamaño es el problema. Afinarlo toma dos minutos más y casi siempre cambia la cifra.</p>
        <button class="btn ghost sm" id="toDet2">Afinar mi cálculo →</button></div>`
      : '');

  const rec = recomendar(r);
  const dpdObl = r.duties.some(d=>d.id==='dpd_desig');
  const dpdFalta = r.gaps.some(g=>g.id==='dpd_desig');
  const soloArt = t => t.split('—')[0].split('·')[0].trim();
  /* En los diagnósticos de personas naturales no mostramos los casos de LigaPro
     y de la FEF: son cifras de federaciones deportivas y distraen del caso real. */
  const verCasos = !r.isNat;

  /* Si el usuario marcó todo, no hay multa que calcular. En vez de mostrarle
     cero y una comparación vacía, se le muestra lo que se está ahorrando: la
     multa que tendría si dejara caer lo que ya construyó. */
  const enRegla = r.gaps.length===0;
  const siCae = enRegla ? compute({...S,cumple:[]}).total.prob : 0;

  const enExpediente = S.spdp==='requerimiento'||S.spdp==='medidas'||S.spdp==='sancion';
  const defensa = enExpediente?`<div class="sec" style="--hc:var(--critical);background:color-mix(in srgb,var(--critical) 8%,transparent)">
    <h3>En su caso lo primero no es implementar</h3>
    <p class="lead-in" style="margin:0 0 12px">${S.spdp==='sancion'
      ? 'Si ya hay una resolución sancionatoria, lo que corre son los días para apelar y para pagar. Eso se atiende primero, y en paralelo se arma el cumplimiento, porque además es lo que atenúa la siguiente.'
      : 'Un requerimiento o una inspección tiene término para contestar, y ese término no se suspende porque usted esté implementando. Se contesta primero, con lo que haya, y se implementa en paralelo.'}</p>
    <a class="btn sm" href="${URL.contacto}" target="_blank" rel="noopener">Quiero hablar con un abogado hoy</a></div>`:'';

  const top3 = r.gaps.filter(g=>!g.only||g.only!=='dpd').slice().sort((a,b)=>b.w-a.w).slice(0,2);
  const pasoDpd = dpdObl && dpdFalta
    ? `<li style="margin-bottom:9px;font-size:14.5px"><b>Designe un Delegado de Protección de Datos y regístrelo ante la Superintendencia.</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">En su caso sí es obligatorio, y el plazo venció el 26 de mayo de 2026. Art. 48 LOPDP</div></li>`
    : '';
  const paso1 = enExpediente
    ? `<li style="margin-bottom:9px;font-size:14.5px"><b>Cuente los días del término y conteste dentro del plazo.</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Esto va antes que todo lo demás. Llámenos hoy mismo si el plazo ya está corriendo.</div></li>`
    : `<li style="margin-bottom:9px;font-size:14.5px"><b>Hable con un abogado antes de mover nada.</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Es lo primero porque de ahí sale qué le aplica de verdad y qué no. Escríbanos: la primera conversación es gratis.</div></li>`;
  const acciones = enRegla && !enExpediente
   ? `<div class="sec" style="--hc:var(--good);background:color-mix(in srgb,var(--good) 5%,transparent)">
    <h3>Lo que le toca ahora es no perderlo</h3>
    <p class="lead-in">Ya hizo la parte difícil. Esto es lo que la deja en pie.</p>
    <ol style="margin:0;padding-left:20px">
      <li style="margin-bottom:9px;font-size:14.5px"><b>Haga que un abogado revise si lo que tiene sirve como prueba.</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Tenerlo y poder demostrarlo son dos cosas distintas, y en un expediente solo cuenta la segunda. Esa revisión es lo que hacemos en la auditoría.</div></li>
      <li style="margin-bottom:9px;font-size:14.5px"><b>Vuelva a mirar esto cada vez que algo cambie.</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Un sistema nuevo, un proveedor nuevo o un dato más que empiece a pedir, y una parte de lo que tiene deja de servir.</div></li>
      <li style="margin-bottom:9px;font-size:14.5px"><b>Guarde todo fechado y firmado.</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Un documento sin fecha no prueba desde cuándo cumple, y esa fecha es justo lo que le van a preguntar.</div></li>
    </ol></div>`
   : `<div class="sec" style="--hc:var(--good);background:color-mix(in srgb,var(--good) 5%,transparent)">
    <h3>Lo primero que debe hacer</h3>
    <p class="lead-in">En orden, y sin tecnicismos.</p>
    <ol style="margin:0;padding-left:20px">
      ${paso1}
      ${pasoDpd}
      ${top3.map(g=>`<li style="margin-bottom:9px;font-size:14.5px"><b>${g.acc}</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">${soloArt(g.law)}</div></li>`).join('')}
    </ol>
    <p style="font-size:13px;color:var(--ink-2);margin:14px 0 0;padding-top:12px;border-top:1px solid var(--line-2)">${dpdObl
      ? 'El Delegado de Protección de Datos no le hace falta a todo el mundo, pero en su caso todo apunta a que sí. Más abajo le explicamos por qué.'
      : 'Sobre el Delegado de Protección de Datos: no todos están obligados a tenerlo, y con estas preguntas no alcanza para decidirlo. Es de las primeras cosas que revisamos con usted.'}</p>
    </div>`;

  const costoAno = costoAnio(rec,dpdObl);
  const expuesto = enRegla ? siCae : r.total.prob;
  const veces = expuesto/costoAno;
  const ratioTxt = enRegla
    ? `Mantenerlo al día cuesta desde <b>${fmt(costoAno)}</b> al año. Volver a armarlo desde cero, si lo deja caer, le costaría eso mismo más la multa de la izquierda.`
    : veces>=2
    ? `En plata: lo que arriesga hoy es <b>${veces>50?'más de 50':(veces<10?Math.round(veces*10)/10:Math.round(veces)).toLocaleString('es-EC')} veces</b> lo que cuesta ${dpdObl?'resolverlo y sostenerlo un año entero':'resolverlo'}, que empieza en ${fmt(costoAno)}.`
    : `Aquí la multa no es lo más caro, y por eso la cuenta se ve pareja: la orden de corregir en un mes, la demanda de cada persona afectada y el hábeas data no dependen de cuánto facture usted, y esos no tienen techo. Resolverlo empieza en <b>${fmt(costoAno)}</b>.`;

  const perfilBanner = S.esPerfil?`<div class="sec" style="--hc:${C[4]};background:color-mix(in srgb,var(--c5) 8%,transparent)">
    <h3>Esto es un ejemplo, no su caso</h3>
    <p class="lead-in" style="margin:0 0 12px">Está viendo el caso tipo de <b>${S.esPerfil}</b>. El suyo es distinto, y calcularlo toma un minuto.</p>
    <button class="btn sm" id="miCaso">Calcular mi caso →</button></div>`:'';

  el.innerHTML=`
  ${perfilBanner}
  <div class="hero-fig${enRegla?' ok':''}">
    <div class="lbl">${enRegla?'Lo que hoy se está ahorrando':'Lo que le pueden multar hoy'}</div>
    <div class="fig" id="fig">USD 0</div>
    <div class="disc">Estimación referencial · no es asesoría legal</div>
    <div class="rng">${enRegla
      ? 'Es lo que le podrían cobrar si dejara caer lo que ya tiene armado.'
      : `Entre ${fmt(r.total.min)} y ${fmt(r.total.max)}, según cómo califique la Superintendencia`}</div>
    ${enRegla
      ? `<p class="ctx ok"><b>Hoy no tenemos una multa que calcularle.</b> Cumple las ${r.duties.length} cosas que le pide la ley. Lo que se cae solo es la vigencia: basta con que cambie de sistema, entre un proveedor nuevo o empiece a pedir un dato más, y una parte de esto deja de servirle como prueba.</p>`
      : r.gaps.length>1
      ? `<p class="ctx"><b>No es una multa: son ${r.gaps.length}.</b> Cada cosa que hoy le falta se cobra por separado, y todas pueden salir del mismo expediente.${verCasos?' en Ecuador ya se cobraron USD 744.473 así, en un solo caso.':' Y como factura como persona natural, la responsabilidad civil y penal recae directamente sobre usted, no sobre una compañía.'}</p>`
      : `<p class="ctx"><b>Le queda una sola cosa por resolver</b>, y es esta: ${r.gaps[0].n.toLowerCase()}. Ese monto es lo que le pueden cobrar por ella.</p>`}
    ${(!enRegla && r.total.prob < 1500)?`<p class="ctx warn"><b>No lea solo esa cifra.</b> Como se calcula sobre lo que usted factura, en su caso la multa sale baja, y es la parte barata del problema. Lo que no cambia con el tamaño es todo lo demás. La orden de corregir en un mes llega igual, la demanda de cada persona afectada llega igual, y el juicio de hábeas data procede con que usted no conteste.</p>`:''}
  </div>

  ${S.esPerfil?'':aviso}
  <div class="tiles">
    <div class="tile" style="--tc:${enRegla?'var(--good)':'var(--critical)'}"><div class="k">Multas que se le suman</div><div class="v">${r.gaps.length}</div>
      <div class="badge" style="color:${enRegla?'var(--good)':'var(--muted)'}">${enRegla?'Ninguna, por ahora':`${r.graves} de ellas por falta grave`}</div></div>
    <div class="tile" style="--tc:${dpdObl?(dpdFalta?'var(--critical)':'var(--good)'):'var(--c1)'}"><div class="k">Delegado de Protección de Datos</div>
      <div class="v" style="font-size:23px">${dpdObl?(dpdFalta?'Le falta':'Lo tiene'):'Por revisar'}</div>
      <div class="badge" style="color:${dpdObl?(dpdFalta?'var(--critical)':'var(--good)'):'var(--c1)'}"><span class="dot" style="background:${dpdObl?(dpdFalta?'var(--critical)':'var(--good)'):'var(--c1)'}"></span>${dpdObl?(dpdFalta?'El plazo venció el 26 de mayo de 2026':'Designado y registrado'):'Hay que verlo con un abogado'}</div></div>
    <div class="tile" style="--tc:${band.c}"><div class="k">Cuánto cumple hoy</div><div class="v">${r.score}<span style="font-size:16px;color:var(--muted)">/100</span></div>
      <div class="badge" style="color:${band.c}"><span class="dot" style="background:${band.c}"></span>${band.l}</div></div>
  </div>

  

  <div class="spdpq">
    <span class="sq">¿La Superintendencia ya le escribió?</span>
    <div class="sqopts" id="sqopts">
      <button class="sqb${S.spdp==='ninguno'||!S.spdp?' on':''}" data-sp="ninguno">No, nunca</button>
      <button class="sqb${S.spdp==='requerimiento'?' on':''}" data-sp="requerimiento">Me llegó un oficio o me vinieron a revisar</button>
      <button class="sqb${S.spdp==='sancion'?' on':''}" data-sp="sancion">Ya me sancionaron</button>
    </div>
  </div>

  ${defensa}
${acciones}

  <div class="cta-medio">
    <div class="cmt"><b>Esa lista, completa y por escrito, se la mandamos gratis.</b>
      <span>Dos páginas con todo lo que le falta, en orden, con los plazos de cada cosa. Sin costo y sin compromiso.</span></div>
    <button class="btn sm" id="ctaMedio">Quiero el informe →</button>
  </div>
  <div class="scale">
    <h3>Dos cifras, y usted decide cuál paga</h3>
    <p class="sh">La de la izquierda no la decide usted: basta una denuncia y que no alcance a corregir a tiempo. La de la derecha sí la decide usted, y además le sirve para vender, para licitar y para no andar pensando en esto.</p>
    <div class="pans">
      <div class="pan" style="--pc:var(--critical)">
        <div class="pk">La consecuencia · ${enRegla?'si lo deja caer':'si no hace nada'}</div>
        <div class="pv">${fmt(enRegla?siCae:r.total.prob)}</div>
        <div class="pu">Solo en multas. Lo que sigue no tiene techo.</div>
        <ul>
          <li>Una multa por cada cosa que le falte, todas juntas</li>
          <li>Un mes para arreglar de golpe todo lo que le falta</li>
          <li>Una demanda de cada persona cuyos datos guarda</li>
          <li>Un juicio de hábeas data, que procede con que usted no conteste</li>
        </ul>
      </div>
      <div class="vs">frente a</div>
      <div class="pan" style="--pc:var(--brand)">
        <div class="pk">La inversión · si lo resuelve</div>
        <div class="pv">desde USD ${dec(rec.p)}</div>
        <div class="pu"><b>${rec.n}</b> · ${rec.pago}</div>
        <ul>
          <li>${rec.para}</li>
          <li><b>En ${CARTERA.dias} está implementado y auditado</b>, no en meses</li>
          <li>Nosotros hacemos el trabajo y usted solo revisa y firma</li>
          <li>Los papeles listos el día que le toquen la puerta</li>
        </ul>
      </div>
    </div>
    <p class="ratio">${ratioTxt}</p>
    <div class="tres">
      ${Object.values(SERVICIOS).map(x=>`<div class="tcell${x.k===rec.k?' rec':''}">
        ${x.k===rec.k?'<span class="rb">Lo suyo</span>':''}
        <div class="tn">${x.n}</div><div class="tp"><span class="tdesde">desde</span> USD ${dec(x.p)}<span> ${x.u}</span></div>
        <div class="tdd">${x.d}${(x.k==='delegado'&&!dpdObl)?' <b style="color:var(--brand-ink);font-weight:650">Si le corresponde a usted es de lo primero que revisamos.</b>':''}</div></div>`).join('')}
    </div>
    <p class="tnota">Los tres se contratan por separado. Los valores son <b>desde</b>: el precio final depende del tamaño de la organización y del tipo de datos que maneje, y se lo confirmamos por escrito antes de empezar. La implementación y la auditoría son un solo pago más IVA; el delegado es mensual.</p>
  </div>

  <div class="lead">
    <h3>${b.lead}</h3><p>${b.leadSub}</p>
    <form id="leadform"><div class="fields">
      <label class="full"><span>Su nombre</span>
        <input id="nom1" type="text" name="nombre" autocomplete="name" placeholder="Nombre y apellido" required></label>
      <label><span>Organización</span>
        <input id="org1" type="text" name="organizacion" autocomplete="organization" placeholder="Nombre del negocio"></label>
      <label><span>Su cargo</span>
        <input id="car1" type="text" name="cargo" autocomplete="organization-title" placeholder="Gerente, dueño, jefe de..."></label>
      <div class="full"><span class="fl">¿Por dónde se lo enviamos?</span>
        <div class="seg" id="seg">
          <button type="button" data-v="wa" class="on">WhatsApp</button>
          <button type="button" data-v="mail">Correo</button>
        </div></div>
      <label class="full hidden" id="wmail"><span>Su correo</span>
        <input id="mail1" type="email" name="email" autocomplete="email" inputmode="email" placeholder="nombre@sudominio.com"></label>
      <label class="full" id="wwa"><span>Su WhatsApp</span>
        <input id="wa1" type="tel" name="whatsapp" autocomplete="tel" inputmode="tel" placeholder="09 9999 9999" required></label></div>
      <label class="consent"><input type="checkbox" id="consent1" name="consentimiento" required><span>Autorizo a <b>${b.name}</b> a usar estos datos para <b>enviarme el documento</b> y para <b>contactarme sobre mi caso</b>. Sé que puedo retirar esta autorización cuando quiera.</span></label>
      <button class="btn" type="submit">${b.btn}</button>
      <p class="leaderr hidden" id="leaderr" role="alert"></p>
      <p class="leadmicro">Responsable: ${b.name}, Quito. Usamos sus datos solo para enviarle el documento y contactarlo sobre su caso. Puede pedir que los borremos escribiendo a ${b.mail}. <a href="${URL.privacidad}" target="_blank" rel="noopener" style="color:var(--brand-ink)">Política de privacidad</a>.</p>
      <p class="leadproof">Un aviso como este, visible antes de pedirle el dato y no escondido en un enlace, es parte de lo que la ley exige a quien recoge datos personales. También a usted.</p></form>
    <div class="thanks" id="thanks"><b>✓ Recibido.</b> Le enviamos el documento al contacto que nos dejó, por lo general dentro de las siguientes horas hábiles. Si no le aparece, búsquelo en el correo no deseado o escríbanos a ${b.mail} y se lo reenviamos.
      <div style="margin-top:10px;font-size:13.8px;color:var(--ink-2)">Un abogado de TempoLegal le escribe para ver su caso, normalmente el mismo día hábil, tal como usted lo autorizó. Le va a hacer unas preguntas cortas sobre su operación: son las que hacen falta para pasarle una propuesta con precio cerrado. Si prefiere que no le escribamos, responda ese correo y listo.</div></div>
  </div>

  <div class="ruta">
    <h3 class="secth"><span></span>Cómo lo resolvemos</h3>
    <p class="sectp">Somos el Delegado de Protección de Datos de <b>más de 60 organizaciones</b> y hemos implementado el sistema de protección de datos en <b>más de 130 compañías y personas naturales</b>. <b>De ocho a doce días</b> desde que arrancamos hasta entregarle el sistema implementado y auditado. El primer tramo empieza sin que usted firme nada.</p>
    <div class="rgrid">
      ${SOLUCIONES.map(x=>`<a class="rcard" href="${x.u}" target="_blank" rel="noopener" style="--rc:${C[x.n-1]}">
        <span class="rn">${x.n}</span><span class="ric">${x.ic}</span>
        <div class="rp">${x.p}</div><div class="rt">${x.t}</div><div class="rd">${x.d}</div>
        <div class="rl">Ver el servicio <span>&rarr;</span></div></a>`).join('')}
    </div>
    ${SECTOR_LANDING[S.sector]?`<a class="sect" href="${SECTOR_LANDING[S.sector].u}" target="_blank" rel="noopener">
      <span class="si">${r.sec.ic}</span>
      <div><div class="st">${SECTOR_LANDING[S.sector].t}</div><div class="sd">${SECTOR_LANDING[S.sector].d}</div></div>
      <span class="sa">&rarr;</span></a>`:''}
  </div>

  

  ${r.gaps.length?`<details class="fold" style="--hc:var(--critical)"><summary><b>Ver las ${r.gaps.length} multas una por una</b><span>Con el artículo de cada una y cuánto suma</span></summary>
  <div class="sec" style="--hc:var(--critical)"><h3>Multa por multa</h3>
    <p class="lead-in" style="margin:0 0 10px">Cada falta grave: <b>${fmt(r.fines.grave.min)} – ${fmt(r.fines.grave.max)}</b> · cada leve: <b>${fmt(r.fines.leve.min)} – ${fmt(r.fines.leve.max)}</b>, sobre su facturación.</p>
    <table><thead><tr><th>Lo que le falta</th><th>Gravedad</th><th class="r">Multa estimada</th></tr></thead><tbody>
    ${r.gaps.map(g=>`<tr><td><div class="nm">${FALTA[g.id]||g.n}</div><div class="lg">${verCasos?g.law:soloArt(g.law)}</div>${g.dl?`<div class="dl">${g.dl}</div>`:''}</td>
      <td style="white-space:nowrap"><span class="pill ${g.cat==='grave'?'g':'l'}">${g.cat==='grave'?'Grave':'Leve'}</span></td>
      <td class="r"><span class="amt">${fmt(g.f.prob)}</span></td></tr>`).join('')}
    </tbody></table></div>
</details>`:''}

  <details class="fold" style="--hc:${C[0]}"><summary><b>El Delegado de Protección de Datos</b><span>${dpdObl?'En su caso todo apunta a que sí le corresponde':'Falta información para saber si le corresponde'}</span></summary>
  <div class="sec" style="--hc:${C[0]}">
    <div class="verdict ${dpdObl?'on':'duda'}"><span class="ico">${dpdObl?'!':'?'}</span>
      <div><div class="vt">${dpdObl?'En su caso todo apunta a que sí le corresponde':'Con estas preguntas todavía no se puede decidir'}</div>
      <div class="vd">${dpdObl
        ? `Es una persona designada por escrito y registrada ante la Superintendencia, que responde por cómo se tratan los datos de su organización. A usted le aparece por ${r.mt.granEscala?'la cantidad y el tipo de datos que maneja':'la actividad a la que se dedica'}, y el plazo para tenerlo venció el <b>26 de mayo de 2026</b>. Le va a servir además para todo lo demás: es quien firma y sostiene el resto de la documentación.`
        : `No todos están obligados a tener uno, y con cuatro preguntas no alcanza para decidirlo. La obligación depende también de qué hace exactamente con esos datos: si los cruza entre sistemas, si los entrega a terceros, si los saca del país, si arma perfiles o decide cosas de forma automática, y de la actividad exacta que consta en su RUC. <b>Si resulta que sí le corresponde y no lo tiene, son cuatro multas más que las que le calculamos arriba.</b> Es de las primeras cosas que revisamos.`}</div></div></div>
    <div class="porques">
      <div class="pqt">Esto es lo que alcanzamos a ver de su caso</div>
      ${r.mt.rows.map(m=>`<div class="pq"><span class="pqd" style="background:${m.p>=m.max*0.66?'var(--critical)':m.p>=m.max*0.4?'var(--warning)':'var(--good)'}"></span>${PLAIN[m.k][m.v]||m.l}${m.inferido?' <span style="color:var(--muted)">(supuesto de su sector)</span>':''}</div>`).join('')}
    </div>
  </div>
</details>
${verCasos?`<details class="fold" style="--hc:${C[2]}"><summary><b>Multas que la Superintendencia ya impuso</b><span>Cuatro resoluciones publicadas, dos organizaciones</span></summary>
  <div class="sec" style="--hc:${C[2]}">
    <h3>Esto ya pasó en Ecuador</h3>
    <p class="lead-in">A las dos las sancionaron dos veces por el mismo caso: la primera multa no cerró el expediente.</p>
    <div class="cases">${CASOS.map(caseCard).join('')}</div>
    <div class="casetotal"><span>Suma de las cuatro resoluciones publicadas a la fecha de esta página</span><b>${fmt(744472.65)}</b></div>
    <p class="lead-in" style="margin:14px 0 0">${r.total.prob<40000
      ?`Son organizaciones grandes y su multa sería mucho menor, porque se calcula sobre lo que usted factura. <b>Lo que no cambia con el tamaño es el resto:</b> la orden de borrar datos, el mes de plazo para arreglarlo y la demanda de cada persona afectada son iguales para un consultorio que para una federación.`
      :`Una evaluación de impacto mal hecha costó USD 194.470. No tenerla y tenerla mal se sancionan igual.`}</p>
  </div>
</details>`:''}
${r.done.length?`<details class="fold" style="--hc:var(--good)"><summary><b>Lo que ya tiene a su favor</b><span>${r.done.length} obligaciones que sí cumple</span></summary>
<div class="sec" style="border:0"><div class="ok-row">${r.done.map(d=>`<span class="ok">✓ ${d.n}</span>`).join('')}</div></div>
</details>`:''}

  <div class="close">
    <h3>${S.inseguro?'Empecemos por saber qué tiene':band.k==='good'?'Ya hizo lo difícil. Falta poder demostrarlo.':band.k==='mid'?'Va bien, pero le faltan las piezas que pesan.':'Lo que haga hoy es lo que va a poder mostrar después.'}</h3>
    <p>${S.inseguro
      ? 'Nadie llega sabiendo esto. Déjenos su nombre y por dónde ubicarlo, y un abogado de TempoLegal le escribe para ver qué hay y qué no en su organización. Sin costo y sin compromiso.'
      : band.k==='good'
      ? `Hoy cumple ${r.score} de 100. Lo que falta ya no es construir: es dejar la evidencia por escrito y mantenerla al día. Déjenos sus datos y un abogado le escribe para revisar qué le falta acreditar.`
      : `Tiene ${r.graves} ${r.graves===1?'falta grave':'faltas graves'} sobre la mesa y ${r.overdue?'un plazo que ya se le venció':'plazos corriendo'}. Déjenos su nombre y por dónde ubicarlo: un abogado de TempoLegal le escribe, le hace las preguntas que hagan falta y le dice por dónde empezar. Sin costo y sin compromiso.`}</p>
    <div class="cbtns">
      <button class="btn">${b.cta[band.k]}</button>
      <a class="btn ghost" href="${URL.base}" target="_blank" rel="noopener">Ver todo lo que hacemos</a>
    </div>
    <p class="cmini">¿Prefiere escribirnos? <a href="${URL.contacto}" target="_blank" rel="noopener">tempolegal.com/contactanos</a></p>
  </div>

  <div class="ctas">
    <button class="btn ghost" id="again">&larr; Cambiar mis respuestas</button>
    <button class="btn ghost" id="home">Ver ejemplos de otros negocios</button>
  </div>

  


`;

  const fig=$('fig'), target=r.total.prob, t0=performance.now(), figtok=++FIGTOK;
  (function tick(t){ if(figtok!==FIGTOK) return;
    const p=Math.min(1,(t-t0)/850),e=1-Math.pow(1-p,3);
    fig.textContent=fmt(target*e); if(p<1)requestAnimationFrame(tick);})(t0);
  const cm=$('ctaMedio');
  if(cm) cm.onclick=()=>{ TL.track('calc_cta',{lugar:'medio'});
    document.querySelector('.lead').scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>{const n=$('nom1'); if(n) n.focus();},420); };
  const sq=$('sqopts');
  if(sq) sq.querySelectorAll('.sqb').forEach(x=>x.onclick=()=>{
    /* el repintado rehace el formulario: se rescata lo que el usuario ya escribió */
    const guardado={};
    ['nom1','org1','car1','mail1','wa1'].forEach(id=>{const n=$(id); if(n) guardado[id]=n.value;});
    S.spdp=x.dataset.sp; renderResult();
    Object.entries(guardado).forEach(([id,v])=>{const n=$(id); if(n&&v) n.value=v;});
  });
  const t2=$('toDet2'); if(t2) t2.onclick=()=>arrancar('detallado',true);
  $('again').onclick=()=>arrancar(MODO,true);
  $('home').onclick=()=>{ $('restart').click(); const ej=document.querySelector('.ejemplos');
    if(ej){ ej.open=true; setTimeout(()=>ej.scrollIntoView({behavior:'smooth',block:'center'}),380); } };
  const seg=$('seg');
  if(seg) seg.querySelectorAll('button').forEach(x=>x.onclick=()=>{
    seg.querySelectorAll('button').forEach(y=>y.classList.toggle('on',y===x));
    const wa=x.dataset.v==='wa';
    $('wmail').classList.toggle('hidden',wa); $('wwa').classList.toggle('hidden',!wa);
    $('mail1').required=!wa; $('wa1').required=wa;
    TL.track('calc_canal',{canal:wa?'whatsapp':'correo'});
    setTimeout(()=>(wa?$('wa1'):$('mail1')).focus(),60);
  });
  $('leadform').onsubmit=async e=>{e.preventDefault();
    const porCorreo=$('wwa').classList.contains('hidden');
    const _wa=($('wa1')||{}).value||'', _ml=($('mail1')||{}).value||'';
    const waOk=/^(0?9\d{8}|5939\d{8})$/.test(_wa.replace(/\D/g,'')), mlOk=/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(_ml);
    if(!porCorreo && !waOk){ $('leaderr').textContent='Ese WhatsApp no parece un número ecuatoriano: son diez dígitos y empieza con 09.';
      $('leaderr').classList.remove('hidden'); $('wa1').focus(); return; }
    if(porCorreo && !mlOk){ $('leaderr').textContent='Ese correo no parece completo. Revise que tenga arroba y dominio.';
      $('leaderr').classList.remove('hidden'); $('mail1').focus(); return; }
    $('leaderr').classList.add('hidden');
    const lead={
      nombre:($('nom1')||{}).value||'', organizacion:($('org1')||{}).value||'',
      cargo:($('car1')||{}).value||'', correo:($('mail1')||{}).value||'',
      whatsapp:($('wa1')||{}).value||'', canal:porCorreo?'correo':'whatsapp',
      consentimiento:!!($('consent1')||{}).checked,
      consent_ts:new Date().toISOString(), aviso_version:'2026-10',
      multa:Math.round(r.total.prob), infracciones:r.gaps.length, graves:r.graves,
      cumplimiento:r.score, sector:S.sector, persona:S.persona, rango:S.rango,
      delegado:dpdObl?'aplica':'por revisar', spdp:S.spdp, servicio:rec.k,
      origen:TL.utm, url:location.href
    };
    TL.track('calc_lead',{canal:lead.canal, servicio:rec.k});

    if(ENVIO.endpoint){
      try{
        await fetch(ENVIO.endpoint,{method:'POST',mode:'no-cors',keepalive:true,
          headers:{'Content-Type':'text/plain;charset=utf-8'},
          body:JSON.stringify(Object.assign({herramienta:'Calculadora de multas',version:'V22'},lead))});
      }catch(err){
        $('leaderr').textContent='No pudimos enviarlo. Escríbanos a '+b.mail+' y se lo mandamos igual.';
        $('leaderr').classList.remove('hidden'); return;
      }
      $('leadform').style.display='none'; $('thanks').style.display='block'; return;
    }

    /* Sin endpoint configurado no se simula un envío: se abre WhatsApp con los
       datos ya escritos, para que el lead llegue de verdad a alguien. */
    const msg=encodeURIComponent(
      `Hola, soy ${lead.nombre||'(sin nombre)'}${lead.organizacion?' de '+lead.organizacion:''}.\n`+
      `Usé la calculadora de multas de TempoLegal.\n`+
      `Resultado: ${fmt(r.total.prob)} en ${r.gaps.length} multas (${r.graves} graves).\n`+
      `Actividad: ${r.sec.l}. Cumplimiento: ${r.score}/100.\n`+
      `Quiero la lista de lo que me falta.`);
    window.open(`https://wa.me/${ENVIO.whatsapp}?text=${msg}`,'_blank','noopener');
    $('leadform').style.display='none'; $('thanks').style.display='block';
    $('sticky').dataset.done='1';stickyOn(false);};
  const mc=$('miCaso'); if(mc) mc.onclick=()=>{S={...DEF,cumple:[]};arrancar('rapido');};
  document.querySelectorAll('.close .btn:not(.ghost)').forEach(x=>x.onclick=()=>{
    TL.track('calc_cta',{lugar:'cierre'});
    document.querySelector('.lead').scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>{const m=$('nom1')||$('mail1'); if(m) m.focus();},420);});
  $('sxt').innerHTML = enRegla
    ? `<b>Está en regla</b> · le mandamos la constancia`
    : `<b>${fmt(r.total.prob)}</b> en multas · el informe es gratis`;
  const _swa=$('swa'); if(_swa) _swa.href='https://wa.me/'+ENVIO.whatsapp+'?text='+encodeURIComponent(
    enRegla ? 'Hola, usé la calculadora de multas de TempoLegal y quiero la constancia de mi caso.'
            : 'Hola, usé la calculadora de multas de TempoLegal. Me salió '+fmt(r.total.prob)+' en '+r.gaps.length+' multas y quiero el informe gratis.');
  if(S.esPerfil) TL.track('calc_perfil',{perfil:S.esPerfil});
  else if(!YA_MIDIO){ YA_MIDIO=true; TL.track('calc_resultado',{
    multa:Math.round(enRegla?siCae:r.total.prob), infracciones:r.gaps.length, graves:r.graves,
    cumplimiento:r.score, delegado:dpdObl?'aplica':'por revisar', en_regla:enRegla,
    servicio:rec.k, sector:S.sector, persona:S.persona, rango:S.rango, modo:MODO}); }
  watchForm(); setTimeout(evalSticky,300);
  window.scrollTo({top:0,behavior:'smooth'});
}
/* barra fija: aparece tras los indicadores, se oculta si el formulario real está a la vista */
const sticky=$('sticky');
function stickyOn(v){ sticky.hidden=!v; sticky.classList.toggle('on',v); document.body.classList.toggle('haspad',v); }
let formVisible=false;
const io=new IntersectionObserver(es=>{formVisible=es.some(e=>e.isIntersecting);evalSticky();},{threshold:0});
function watchForm(){
  io.disconnect();            /* suelta los nodos del repintado anterior */ const lf=document.querySelector('.lead'); if(lf) io.observe(lf); }
function evalSticky(){
  const enResultado=!$('result').classList.contains('hidden');
  const pasoTiles=window.scrollY>620;
  stickyOn(enResultado && pasoTiles && !formVisible && !$('sticky').dataset.done);
}
window.addEventListener('scroll',evalSticky,{passive:true});
$('sxb').onclick=()=>{
  TL.track('calc_cta',{lugar:'barra_fija'});
  document.querySelector('.lead').scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(()=>{const m=$('nom1'); if(m) m.focus();},420);
};
$('swa').onclick=()=>{ TL.track('calc_lead',{canal:'whatsapp_barra'}); };
/* ── Rescate de abandono ─────────────────────────────────────────── */
let rescatado=false;
function ofrecerRescate(motivo){
  if(rescatado) return;
  if($('flow').classList.contains('hidden')) return;      // solo durante el cuestionario
  if(!S.sector) return;                                    // y solo si ya avanzó algo
  rescatado=true;
  TL.track('calc_abandono',{paso:i+1, id:(visible()[i]||{}).id, motivo});
  $('rescate').classList.remove('hidden');
  requestAnimationFrame(()=>$('rescate').classList.add('on'));
}
document.addEventListener('mouseout', e=>{ if(!e.relatedTarget && e.clientY<8) ofrecerRescate('salida'); });
let ocultaDesde=0;
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) ocultaDesde=Date.now();
  else if(ocultaDesde && Date.now()-ocultaDesde>20000) ofrecerRescate('pestana'); });
const cerrarRescate=()=>{ $('rescate').classList.remove('on');
  setTimeout(()=>$('rescate').classList.add('hidden'),200); };
$('resNo').onclick=cerrarRescate;
$('resFondo').onclick=cerrarRescate;
$('resSi').onclick=()=>{
  const v=$('resDato').value.trim();
  if(v.length<6){ $('resDato').focus(); $('resDato').style.borderColor='var(--critical)'; return; }
  TL.track('calc_lead',{canal:'rescate', paso:i+1});
  if(ENVIO.endpoint){ try{ fetch(ENVIO.endpoint,{method:'POST',mode:'no-cors',keepalive:true,
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({herramienta:'Calculadora de multas',version:'V22',parcial:true,
      contacto:v,canal:/@/.test(v)?'correo':'whatsapp',consentimiento:'aviso visible en el diálogo',
      consent_ts:new Date().toISOString(),paso:i+1,sector:S.sector||'',url:location.href})}).catch(()=>{}); }catch(e){} }
  $('resCaja').innerHTML='<div class="rt">Listo. Se lo mandamos apenas termine de calcularse.</div>'+
    '<p class="rd">Si quiere, siga respondiendo: le faltan pocas preguntas y la cifra sale al instante.</p>'+
    '<button class="btn sm" id="resSeguir">Seguir con el cálculo</button>';
  $('resSeguir').onclick=cerrarRescate;
};

paintBrand();
