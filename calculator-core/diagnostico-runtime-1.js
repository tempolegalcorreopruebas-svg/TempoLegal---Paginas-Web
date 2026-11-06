
/* ══════════════════════════════════════════════════════════
   CONFIGURACIÓN · lo único que se edita para publicar
   ══════════════════════════════════════════════════════════ */
const CONFIG = {
  WHATSAPP:"593978887392",
  EMAIL:"info@tempolegal.com",
  PRIVACIDAD:"../../politica-de-privacidad/",
  // JAG: /sanciones no existe. Las cuatro resoluciones están publicadas en /prensa.
  SANCIONES:"https://spdp.gob.ec/prensa/",
  // JAG: URL PROVISIONAL de la calculadora de Delegado. Vacío la oculta.
  CALCULADORA:"../calculadora-delegado-lopdp/",
  API_ENDPOINT:"",
  LEAD_ENDPOINT:"",  // URL /exec del Apps Script de TempoLegal (ver GUIA)
  P:{ auditoria:"desde USD 149,99 + IVA",
      implementacion:"desde USD 390,00 + IVA, pago único",
      delegado:"desde USD 95,00 + IVA/mes" },
  INVERSION_MIN:539.99,          // auditoría + implementación de partida
  RECORRIDO:"más de 130",
  LINKS:[
    {t:"Delegado de Protección de Datos externo",u:"../../proteccion-de-datos-personales-ecuador/delegado-proteccion-datos-externo-ecuador/"},
    {t:"Protección de datos en salud y clínicas",u:"../../proteccion-de-datos-personales-ecuador/proteccion-datos-clinicas-salud-ecuador/"},
    {t:"Protección de datos en colegios e instituciones educativas",u:"../../proteccion-de-datos-personales-ecuador/proteccion-datos-colegios-instituciones-educativas-ecuador/"},
    {t:"Protección de datos en tecnología, software y apps",u:"../../proteccion-de-datos-personales-ecuador/proteccion-datos-empresas-software-apps-ecuador/"},
    {t:"Obligaciones LOPDP para Recursos Humanos",u:"https://tempolegal.com/lopdp-recursos-humanos-ecuador/"},
    {t:"Videovigilancia y cámaras, requisitos LOPDP",u:"https://tempolegal.com/videovigilancia-lopdp-ecuador/"}
  ]
};

const N = {
  sensibles:"LOPDP · Datos personales sensibles",
  granEscala:"Resolución SPDP-SPD-2026-0005-R · Tratamiento a gran escala",
  encargado:"LOPDP · Régimen del encargado del tratamiento",
  acceso:"LOPDP · Art. 13 · Reglamento General Arts. 12 a 16",
  eliminacion:"LOPDP · Art. 15",
  registro:"LOPDP · Registro de actividades de tratamiento",
  ia:"Resolución SPDP-SPD-2026-0009-R",
  dpd:"Resolución SPDP-SPD-2025-0028-R · Reglamento del Delegado",
  ambito:"LOPDP · Ámbito de aplicación",
  sanciones:"LOPDP · Arts. 67 a 72 · Resolución SPDP-SPD-2025-0022-R",
  coip:"Código Orgánico Integral Penal · Arts. 178 y 229",
  correctivas:"LOPDP · Art. 65 — Medidas correctivas",
  brecha:"LOPDP · Art. 43, reformado por la LOFC"
};

/* ══════════════════════════════════════════════════════════
   MEDICIÓN
   ══════════════════════════════════════════════════════════ */
const TL = (window.TL = window.TL || {});
TL.utm = (function(){
  const o={}; try{
    const q=new URLSearchParams(location.search);
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k=>{ if(q.get(k)) o[k]=q.get(k); });
    /* Sin gclid no hay importación de conversiones offline en Google Ads, y el canal
       principal de esta herramienta es WhatsApp, que ocurre fuera del sitio. */
    ["gclid","gbraid","wbraid","fbclid","msclkid"].forEach(k=>{
      const v=q.get(k); if(v){ o[k]=v; try{ sessionStorage.setItem("tl_"+k,v); }catch(e){} }
      else { try{ const g=sessionStorage.getItem("tl_"+k); if(g) o[k]=g; }catch(e){} }
    });
  }catch(e){} return o;
})();
TL.track = function(evento, datos){
  const d = Object.assign({herramienta:"diagnostico_lopdp"}, TL.utm, datos||{});
  if(d.value!=null && !d.currency) d.currency="USD";
  try{ (window.dataLayer=window.dataLayer||[]).push(Object.assign({event:evento}, d)); }catch(e){}
  try{ if(/lead/.test(evento)) (window.dataLayer=window.dataLayer||[]).push({event:'tl_lead',herramienta:'diagnostico-lopdp',origen:evento}); }catch(e){}
  try{ if(typeof fbq==="function"){
    const id=evento+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,8);
    if(evento==="lead"||evento==="lead_whatsapp") fbq("track","Lead",d,{eventID:id});
    else fbq("trackCustom", evento, d);
  }}catch(e){}
  try{ if(typeof gtag==="function") gtag("event", evento, d); }catch(e){}
};

/* ══════════════════════════════════════════════════════════
   PREGUNTAS
   ══════════════════════════════════════════════════════════ */
const QUESTIONS = [
  { id:"tam", text:"¿Qué tamaño tiene su organización?",
    hint:"Cuente a todos los que trabajan con usted, aunque sea a medio tiempo.",
    opts:[
      {t:"Trabajo solo o con un asistente", v:"natural", s:0,
       r:"La ley no hace descuentos por tamaño. Un consultorio con una lista de pacientes tiene las mismas obligaciones que una empresa grande, ajustadas a su riesgo.", ref:N.ambito},
      {t:"Entre 2 y 15 personas", v:"pyme", s:0,
       r:"Es el tramo donde más se subestima el tema. Con solo tener nómina y una lista de clientes, usted ya guarda datos de personas todos los días.", ref:N.ambito},
      {t:"Entre 16 y 80 personas", v:"pyme", s:1,
       r:"A este tamaño ya hay sistemas, procesos y proveedores de por medio. Guardar datos de personas deja de ser algo ocasional y pasa a ser permanente.", ref:N.ambito},
      {t:"Más de 80 personas, o una institución", v:"grande", s:1,
       r:"Solo el archivo de personal y las carpetas de selección suponen un volumen que la Superintendencia mira con otro criterio.", ref:N.granEscala}
    ]},
  { id:"fact", text:"¿Cuánto factura al año su organización?",
    hint:"La multa se calcula sobre su facturación del año anterior. Sin ese dato cualquier cifra sería inventada.",
    opts:[
      {t:"Menos de USD 100.000 al año", s:0, base:60000,
       r:"Con ese volumen la multa es la parte menos costosa de un expediente. Lo que pesa es la orden de dejar de usar su información y el reclamo de cada persona afectada, que no dependen de cuánto factura.", ref:N.sanciones},
      {t:"Entre USD 100.000 y 500.000", s:0, base:300000,
       r:"Es el tramo donde más empresas ecuatorianas caen y donde la multa ya se siente. Se calcula sobre las ventas del año anterior, descontando el IVA.", ref:N.sanciones},
      {t:"Entre USD 500.000 y 2 millones", s:0, base:1250000,
       r:"A este volumen una sola falta grave deja una cifra de cinco dígitos, y las faltas no se juntan en una sola multa.", ref:N.sanciones},
      {t:"Entre USD 2 y 10 millones", s:0, base:6000000,
       r:"En este tramo la Superintendencia suele pedir información e inspeccionar antes de sancionar, lo que da margen para corregir, pero también deja constancia de todo lo que falte.", ref:N.sanciones},
      {t:"Más de USD 10 millones", s:0, base:15000000,
       r:"A este volumen el riesgo deja de ser la multa y pasa a ser la orden de dejar de usar su base de datos y la publicación de la sanción.", ref:N.sanciones},
      {t:"Prefiero no indicarlo", s:0, base:null,
       r:"Sin ese dato no calculamos ninguna cifra, porque sería inventada. El resto del diagnóstico funciona igual: va a ver qué le falta y qué norma lo exige.", ref:N.sanciones}
    ]},

  { id:"sens", multi:true, text:"¿Su organización guarda alguno de estos documentos?",
    hint:"Marque todos los que apliquen. Casi nadie marca cero.",
    opts:[
      {t:"Certificados médicos, exámenes de ingreso o reposos del IESS del personal", s:3, sens:true, tag:"salud",
       r:"Casi nadie cree que maneja datos de salud, y sí los maneja. El certificado médico de ingreso y el reposo del IESS son datos de salud de su trabajador, aunque su negocio no tenga nada que ver con medicina. Eso los vuelve datos sensibles, que es la categoría con reglas más estrictas.", ref:N.sensibles, gap:"sens"},
      {t:"Cédulas o datos de hijos y cargas familiares de los trabajadores", s:3, sens:true, tag:"menores",
       r:"La carga familiar que se declara al IESS o al seguro médico incluye datos de menores de edad. Con menores, la regla por defecto es más exigente y hay menos excepciones disponibles.", ref:N.sensibles, gap:"sens"},
      {t:"Carné o información de discapacidad", s:3, sens:true, tag:"discapacidad",
       r:"El dato de discapacidad es de los más protegidos que existen. Quién puede verlo dentro de la empresa y dónde está archivado deja de ser una decisión interna y pasa a ser una obligación.", ref:N.sensibles, gap:"sens"},
      {t:"Historias clínicas, fichas de pacientes o expedientes de alumnos", s:3, sens:true, tag:"pacientes",
       r:"Si usted atiende pacientes, alumnos o usuarios, la ficha de cada uno es el archivo más protegido que tiene. No es lo mismo que la carpeta de su personal: aquí el dato es el centro de su negocio, y por eso el estándar de seguridad y de acceso interno es más alto.", ref:N.sensibles, gap:"sens"},
      {t:"Información financiera o consultas de crédito de clientes", s:2, tag:"financiero",
       r:"Consultar el buró de crédito de alguien es guardar y usar sus datos, y necesita una razón legal que lo justifique. Es de las prácticas más comunes y menos documentadas del país.", ref:N.sensibles, gap:"sens"},
      {t:"Ninguno de estos", s:0, none:true, ok:"Sin datos sensibles declarados",
       r:"Conviene confirmarlo con quien lleva talento humano antes de darlo por cierto. Los certificados médicos y las cargas familiares suelen estar archivados sin que nadie los identifique como datos sensibles.", ref:N.ambito}
    ]},
  { id:"disp", multi:true, text:"¿Usa alguno de estos sistemas?",
    hint:"Marque todos los que apliquen.",
    opts:[
      {t:"Cámaras de seguridad, solo video", s:1, tag:"camara",
       r:"Grabar sin audio igual exige un letrero visible, decir para qué se graba, por cuánto tiempo se guarda y controlar quién puede ver las grabaciones.", ref:N.registro, gap:"disp"},
      {t:"Cámaras que también graban audio", s:3, bio:true, tag:"audio",
       r:"Este es el que sorprende a todos. El audio permite reconocer a una persona por su voz, así que deja de ser videovigilancia y pasa a ser tratamiento de datos biométricos, con reglas y niveles de seguridad distintos.", ref:N.sensibles, gap:"disp"},
      {t:"Marcación de asistencia con huella o reconocimiento facial", s:3, bio:true, tag:"bio",
       r:"Si el reloj usa huella o rostro, usted guarda datos biométricos de todo su personal, todos los días laborables. Es el supuesto más frecuente por el que una empresa ecuatoriana queda obligada a nombrar un Delegado de Protección de Datos, que es alguien que responde por cómo se cuidan esos datos.", ref:N.dpd, gap:"disp"},
      {t:"GPS o rastreo de vehículos, o localización del personal", s:3, bio:true, tag:"geo",
       r:"Rastrear un vehículo es rastrear a quien lo conduce. Saber dónde está una persona en cada momento es uno de los usos que la normativa considera de mayor riesgo, y es muy común en transporte y logística. Ese solo hecho puede obligarlo a nombrar un Delegado de Protección de Datos.", ref:N.granEscala, gap:"disp"},
      {t:"Ninguno de estos", s:0, none:true, ok:"Sin cámaras, biometría ni rastreo declarados",
       r:"Un frente menos sobre el que preguntar. Conviene dejarlo por escrito antes de instalar cualquier equipo, porque después cuesta más ordenarlo.", ref:N.registro}
    ]},
  { id:"dpd", soloSi:()=>bio, text:"¿Ya tiene un Delegado de Protección de Datos?",
    hint:"Es la persona que responde por cómo se cuidan esos datos. Se lo preguntamos porque usted marcó huella, rostro, voz o rastreo.",
    opts:[
      {t:"Sí, designado y registrado ante la Superintendencia", s:0, dpd:"completo", ok:"Delegado designado y registrado, según su declaración",
       r:"Bien. Conviene revisar que el nombramiento cumpla los requisitos de idoneidad y que no haya conflicto con otras funciones de esa persona dentro de la organización.", ref:N.dpd},
      {t:"Lo nombramos, pero no está registrado", s:2, dpd:"sinregistro",
       r:"El nombramiento sin inscripción deja la obligación a medias. Es de las observaciones más fáciles de levantar y de las que más se repiten.", ref:N.dpd, gap:"dpdreg"},
      {t:"No tenemos", s:3, dpd:"no",
       r:"Con huella, rostro, voz o rastreo de personas, la normativa clasifica el tratamiento como de gran escala sin necesidad de puntaje. En ese escenario la designación deja de ser opcional.", ref:N.granEscala, gap:"dpdreg"},
      {t:"No sé si nos corresponde", s:2, dpd:"nose",
       r:"Es la respuesta más común y la más razonable, porque la obligación no depende del tamaño sino de qué hace con la información. Hay que verlo con un abogado.", ref:N.dpd, gap:"dpdreg"}
    ]},

  { id:"contratos", text:"Sus contratos con trabajadores, contador externo y proveedores, ¿incluyen cláusulas de protección de datos?",
    hint:"Piense en quién ve sus archivos, la nómina, la contabilidad, los sistemas, el marketing.",
    opts:[
      {t:"Sí, los revisamos y todos las tienen", s:0, ok:"Contratos con cláusulas de protección de datos, según su declaración",
       r:"Es lo que corresponde, y no es lo común. Es de lo primero que se pide en una inspección y de lo que más demora conseguir cuando ya ocurrió algo.", ref:N.encargado},
      {t:"Algunos sí, otros no", s:2,
       r:"Basta con que uno solo no la tenga. Si ese proveedor pierde o filtra sus archivos, la responsabilidad vuelve a usted, porque tercerizar el trabajo no terceriza la obligación.", ref:N.encargado, gap:"enc"},
      {t:"No, son los contratos de siempre", s:3,
       r:"Un contrato de servicios normal no sirve para esto. Hace falta un acuerdo aparte que diga qué puede hacer ese tercero con la información, por cuánto tiempo y qué hace con ella al terminar.", ref:N.encargado, gap:"enc"},
      {t:"No lo sé", s:3,
       r:"Es la respuesta más común y también la más costosa. Significa que hoy no sabemos cuántas personas fuera de la empresa tienen acceso a sus archivos ni bajo qué condiciones.", ref:N.encargado, gap:"enc"}
    ]},
  { id:"gestion", multi:true, text:"¿Cuál de estas situaciones ocurre en su organización?",
    hint:"Marque todas las que apliquen. Responda con franqueza, nadie más ve esto.",
    opts:[
      {t:"Si alguien que nos dejó sus datos pide que los borremos, no sabríamos cómo hacerlo", s:3, tag:"arco",
       r:"Tiene quince días para responder y el plazo corre desde que la persona lo pide, no desde que usted se organiza. Responder tarde ya es una infracción, aunque después entregue todo completo.", ref:N.acceso, gap:"arco"},
      {t:"Usamos ChatGPT u otra inteligencia artificial para redactar, resumir o atender clientes", s:3, transfer:true, tag:"ia",
       r:"Pegar una lista de contactos, una hoja de vida o los datos de un cliente en una herramienta de inteligencia artificial es sacar esa información del país. La Superintendencia ya emitió normativa específica sobre el uso de estos sistemas.", ref:N.ia, gap:"ia"},
      {t:"Guardamos contactos y listas de interesados sin un plazo para borrarlos", s:2, tag:"conserv",
       r:"Un dato que ya no tiene para qué servir no se puede seguir guardando. Cualquiera de esas personas puede exigir hoy que lo elimine, y demostrar que lo hizo a tiempo le corresponde a usted.", ref:N.eliminacion, gap:"arco"},
      {t:"Ninguna de estas", s:0, none:true, ok:"Manejo de contactos y herramientas, sin señales en lo consultado",
       r:"Poco frecuente y buena señal. Lo que conviene ahora es dejarlo por escrito, para que siga funcionando cuando cambie la persona que hoy lo sostiene.", ref:N.registro}
    ]}
];

const GAPS = {
  sens:{t:"Datos sensibles sin las protecciones que exige la ley",
    d:"Salud, discapacidad, datos de menores o información financiera necesitan una razón legal reforzada para guardarlos, medidas de seguridad diferenciadas y control escrito de quién accede a ellos dentro de la organización.",ref:N.sensibles,w:4},
  disp:{t:"Cámaras, biometría o rastreo sin marco documentado",
    d:"Estos sistemas necesitan finalidad declarada, letrero visible, plazo de conservación y control de accesos. Cuando hay huella, rostro, voz o localización de personas, además entra en lo que la ley llama tratamiento a gran escala, que es manejar datos de muchas personas de forma constante y organizada.",ref:N.granEscala,w:4},
  enc:{t:"Terceros con acceso a sus archivos sin contrato que lo regule",
    d:"Contador externo, proveedor de nómina, agencia de marketing o soporte informático entran a información de personas sin un documento que fije para qué pueden usarla, con qué confidencialidad y qué hacen con ella al terminar.",ref:N.encargado,w:3},
  arco:{t:"Sin procedimiento para atender pedidos de las personas",
    d:"Sin un procedimiento escrito, un canal designado y un responsable asignado, el plazo de quince días se incumple por desorden, no por decisión. Aplica igual a clientes, trabajadores, postulantes, proveedores y contactos.",ref:N.acceso,w:3},
  dpdreg:{t:"Delegado de Protección de Datos sin designar o sin inscribir",
    d:"Con huella, rostro, voz o rastreo de personas, lo normal es que le corresponda nombrar un Delegado de Protección de Datos e inscribirlo ante la Superintendencia. Mientras falte cualquiera de los dos pasos la obligación sigue abierta, y el plazo para cumplirla venció el 26 de mayo de 2026.",ref:N.dpd,w:4},
  ia:{t:"Uso de inteligencia artificial sin política ni razón declarada",
    d:"Ingresar datos de personas en herramientas de inteligencia artificial es usarlos y, en la práctica totalidad de los casos, sacarlos del país sin declararlo. Requiere política interna, instrucciones al equipo y un análisis previo.",ref:N.ia,w:3}
};

/* ══════════════════════════════════════════════════════════
   ESTADO Y CUESTIONARIO
   ══════════════════════════════════════════════════════════ */
let idx=0, seg="pyme", bio=false, sens=false, transfer=false, dpd="na";
let resp={}, gaps=[], oks=[], tags=[], factura=null, rescateHecho=false, lead=null, cableado=false;
const $=id=>document.getElementById(id);

/* La lista de preguntas es dinámica: la del Delegado solo aparece si hay biometría. */
function orden(){ return QUESTIONS.filter(q=>!q.soloSi||q.soloSi()); }
const puntaje=()=>orden().reduce((a,q)=>a+((resp[q.id]&&resp[q.id].s)||0),0);
const ver=id=>{document.querySelectorAll(".pantalla").forEach(x=>x.classList.remove("on"));$(id).classList.add("on");window.scrollTo({top:0,behavior:"instant"});};

function recompute(){
  seg="pyme";bio=false;sens=false;transfer=false;dpd="na";gaps=[];oks=[];tags=[];factura=null;
  // dos vueltas: la primera fija bio, de la que depende si la pregunta del Delegado existe
  for(const vuelta of [0,1]){
    QUESTIONS.forEach(q=>{
      const a=resp[q.id]; if(!a) return;
      if(q.soloSi&&vuelta===0) return;
      a.picks.forEach(o=>{
        if(q.id==="tam"&&o.v) seg=o.v;
        if(q.id==="fact") factura={t:o.t,base:o.base};
        if(o.bio) bio=true;
        if(o.sens) sens=true;
        if(o.transfer) transfer=true;
        if(o.dpd) dpd=o.dpd;
        if(o.tag&&!tags.includes(o.tag)) tags.push(o.tag);
        if(o.gap&&!gaps.includes(o.gap)) gaps.push(o.gap);
        if(o.ok&&!oks.includes(o.ok)) oks.push(o.ok);
      });
    });
    if(vuelta===0){ seg="pyme";sens=false;transfer=false;dpd="na";gaps=[];oks=[];tags=[];factura=null; }
  }
  // si dejó de haber biometría, la respuesta del Delegado ya no aplica
  if(!bio) delete resp.dpd;
}

$("arrancar").addEventListener("click",()=>{ idx=0;resp={};recompute();TL.track("inicio",{}); pintar();ver("p-preg"); });
$("volver").addEventListener("click",()=>{ if(idx===0)return; idx--; pintar(); window.scrollTo({top:0,behavior:"smooth"}); });

function pintar(){
  const L=orden(), q=L[idx];
  $("barra").classList.add("on");
  $("barra-i").style.width=(idx/L.length*100)+"%";
  $("paso").innerHTML=`Diagnóstico LOPDP`;
  $("preg-kick").innerHTML=`Pregunta ${idx+1} de ${L.length}`+(q.multi?` <span class="chip">Puede marcar varias</span>`:``);
  $("preg-t").textContent=q.text;
  $("preg-ayuda").textContent=q.hint||"";
  $("dato").innerHTML="";$("seguir").innerHTML="";
  $("volver").style.display= idx>0?"block":"none";
  TL.track("paso",{paso:idx+1,pregunta:q.id});

  const caja=$("ops");caja.innerHTML="";
  const previa=resp[q.id];
  const sel=new Set();
  if(previa) previa.picks.forEach(pk=>{const k=q.opts.indexOf(pk); if(k>=0) sel.add(k);});

  q.opts.forEach((o,i)=>{
    const b=document.createElement("button");
    b.className="op"+(sel.has(i)?" sel":"");
    b.type="button";b.textContent=o.t;
    b.setAttribute("aria-pressed", sel.has(i)?"true":"false");
    b.addEventListener("click",()=>{
      if(!q.multi){
        [...caja.children].forEach(c=>{c.classList.remove("sel");c.setAttribute("aria-pressed","false");});
        b.classList.add("sel");b.setAttribute("aria-pressed","true");
        guardar(q,[o]); return;
      }
      $("dato").innerHTML="";
      if(o.none){ sel.clear(); [...caja.children].forEach(c=>{c.classList.remove("sel");c.setAttribute("aria-pressed","false");}); }
      else { const ni=q.opts.findIndex(x=>x.none); if(ni>=0&&sel.has(ni)){sel.delete(ni);caja.children[ni].classList.remove("sel");caja.children[ni].setAttribute("aria-pressed","false");} }
      if(sel.has(i)){sel.delete(i);b.classList.remove("sel");b.setAttribute("aria-pressed","false");}
      else{sel.add(i);b.classList.add("sel");b.setAttribute("aria-pressed","true");}
      if(!sel.size){ delete resp[q.id]; recompute(); }
      pintarSeguir(q,sel);
    });
    caja.appendChild(b);
  });

  if(q.multi){ pintarSeguir(q,sel); if(previa) guardar(q,previa.picks,true); }
  else if(previa) guardar(q,previa.picks,true);
}

function pintarSeguir(q,sel){
  $("seguir").innerHTML=`<button type="button" class="btn" id="go" ${sel.size?"":"disabled"}>Continuar</button>`;
  $("go").addEventListener("click",()=>{
    const l=[...sel].sort((a,b)=>a-b); if(!l.length)return;
    $("seguir").innerHTML="";
    guardar(q,l.map(i=>q.opts[i]));
  });
}

function guardar(q,picks,silencio){
  const sc=q.multi?Math.max(...picks.map(x=>x.s)):picks[0].s;
  resp[q.id]={qid:q.id,picks,s:sc,txt:picks.map(x=>x.t).join(" · "),pregunta:q.text};
  recompute();
  $("seguir").innerHTML="";
  const L=orden(), ultima = idx>=L.length-1;
  $("barra-i").style.width=((idx+1)/L.length*100)+"%";
  $("dato").innerHTML=`<div class="dato">${picks.map(x=>`<p>${x.r}</p>`).join("")}
    <span class="norma">${[...new Set(picks.map(x=>x.ref))].join(" · ")}</span>
    <span class="editable">Puede cambiar su respuesta antes de continuar.</span></div>
    <div class="sig"><button type="button" class="btn" id="next">${ultima?"Ver el resultado":"Siguiente pregunta"}</button></div>`;
  $("next").addEventListener("click",()=>{
    if(idx>=orden().length-1){ $("barra").classList.remove("on"); ver("p-calc");
      const quieto=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(armarResultado, quieto?0:2100);
    } else { idx++; pintar(); window.scrollTo({top:0,behavior:"smooth"}); }
  });
  if(!silencio) $("dato").scrollIntoView({behavior:"smooth",block:"nearest"});
}

/* ══════════════════════════════════════════════════════════
   RESCATE DE ABANDONO
   ══════════════════════════════════════════════════════════ */
function ofrecerRescate(){
  if(rescateHecho) return;
  if(!$("p-preg").classList.contains("on")) return;
  if(!Object.keys(resp).length) return;
  rescateHecho=true;
  focoPrevio=document.activeElement;
  $("rescate").classList.add("on");
  const t=$("r-tel"); if(t) setTimeout(()=>t.focus(),50);
  TL.track("abandono",{paso:idx+1});
}
document.addEventListener("mouseout",e=>{ if(!e.relatedTarget && e.clientY<=0) ofrecerRescate(); });
/* JAG: en móvil, cambiar de app para contestar un WhatsApp no es abandono.
   Solo se ofrece si estuvo fuera más de veinte segundos. */
let oculto=0;
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){ oculto=Date.now(); return; }
  if(oculto && Date.now()-oculto>20000) ofrecerRescate();
  oculto=0;
});
let focoPrevio=null;
$("rescate-si").addEventListener("click",()=>{
  const d=$("r-tel").value.replace(/\D/g,"");
  if(d.length<7||d.length>13||!$("r-ok").checked){
    $("r-error").textContent = (d.length<7||d.length>13) ? "Escriba un número de WhatsApp de al menos siete dígitos." : "Necesitamos su autorización.";
    $("r-error").classList.add("on"); $("r-tel").focus(); return;
  }
  enviarLead({canal:"whatsapp",contacto:normalizarTel(d),nombre:null,organizacion:null,cargo:null,
    parcial:true,paso:idx+1,segmento:seg,
    respuestas:orden().map(q=>resp[q.id]).filter(Boolean).map(a=>({pregunta:a.pregunta,respuesta:a.txt})),
    origen:location.search||"directo"});
  TL.track("lead",{canal:"whatsapp",parcial:true,paso:idx+1});
  cerrarRescate();
  $("rescate").innerHTML=``;
});
$("rescate-no").addEventListener("click",cerrarRescate);
function cerrarRescate(){ $("rescate").classList.remove("on"); if(focoPrevio&&focoPrevio.focus) focoPrevio.focus(); }
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&$("rescate").classList.contains("on")) cerrarRescate(); });
function normalizarTel(d){ if(d.length===10&&d.startsWith("0")) return "593"+d.slice(1); if(d.length===9&&d.startsWith("9")) return "593"+d; return d; }

/* ══════════════════════════════════════════════════════════
   MOTOR DEL RESULTADO
   ══════════════════════════════════════════════════════════ */
function matriz(){
  const A=id=>resp[id];
  const S=id=>(A(id)||{s:0}).s;
  const T=t=>tags.includes(t);
  const nsens=["salud","menores","discapacidad","pacientes","financiero"].filter(T).length;
  const ndisp=["audio","bio","geo"].filter(T).length;
  return [
    {n:"Datos sensibles",                    e: nsens===0?"ok":nsens<=2?"rev":"cri"},
    {n:"Cámaras, biometría y rastreo",       e: S("disp")===0?"ok":ndisp<=1?"rev":"cri"},
    {n:"Contratos con terceros",             e: S("contratos")===0?"ok":S("contratos")<=2?"rev":"cri"},
    {n:"Pedidos de las personas",            e: T("arco")?"cri":T("conserv")?"rev":"ok"},
    {n:"Uso de inteligencia artificial",     e: T("ia")?"cri":"ok"},
    {n:"Salida de información del país",     e: !transfer?"ok":"rev"}
  ];
}
const ESTADO={ok:["Sin señales","e-ok"],rev:["Por revisar","e-rev"],cri:["Crítico","e-cri"]};

function nivel(){
  const p=puntaje(), mx=matriz();
  const cri=mx.filter(a=>a.e==="cri").length, rev=mx.filter(a=>a.e==="rev").length;
  let t = p>=15?5 : p>=12?4 : p>=8?3 : p>=4?2 : 1;
  if(cri>=5) t=Math.max(t,5);
  if(cri>=4) t=Math.max(t,4);
  if(cri>=2) t=Math.max(t,3);
  if(cri>=1) t=Math.max(t,2);
  if(cri<3)  t=Math.min(t,4);
  if(cri===0) t=Math.min(t, rev===0?1:3);
  /* JAG: el nivel 1 dispara la pantalla verde y el texto "sin señales de alto riesgo".
     Solo puede usarse cuando no hay ningún frente abierto ni ninguna multa listada,
     porque antes decía "riesgo controlado" mientras la tabla cobraba tres faltas graves. */
  const nGraves = infracciones().filter(x=>x.g).length;
  if(gaps.length>0) t=Math.max(t,2);
  if(nGraves>=1) t=Math.max(t,2);
  if(nGraves>=4) t=Math.max(t,3);
  const V={
    5:{w:"Crítico",r:"Riesgo muy alto",
       p:"Este diagnóstico encontró varios frentes abiertos al mismo tiempo. No hace falta que ocurra nada malo. Un solo pedido de información de la Superintendencia deja todo a la vista."},
    4:{w:"Expuesto",r:"Riesgo alto",
       p:"Hay varias cosas funcionando sin respaldo por escrito. Algunas de ellas ya son una infracción por sí solas, aunque usted cuide la información con todo el criterio del mundo."},
    3:{w:"Vulnerable",r:"Riesgo medio-alto",
       p:"Se nota criterio, pero no está escrito en ningún lado. Si mañana llega un reclamo o una inspección, le va a costar demostrar lo que en la práctica sí hace bien."},
    2:{w:"Perfectible",r:"Riesgo moderado",
       p:"Lo esencial está cubierto y lo que aparece son observaciones puntuales. Cerrarlas ahora cuesta una fracción de lo que cuesta hacerlo con un reclamo de por medio."},
    1:{w:"Sin hallazgos",r:"Riesgo controlado",
       p:"En los seis frentes que revisamos no aparecieron señales de alto riesgo, y eso lo pone en una minoría muy pequeña. Con un diagnóstico breve no se determina el cumplimiento, así que esto no equivale a estar en regla."}
  };
  return Object.assign({t},V[t]);
}

/* JAG: tramos de facturación para estimar la multa. El estándar prohíbe mostrar
   cifras antes de tener el dato, así que nada se calcula hasta que el usuario elija. */
const money=n=>"USD "+n.toLocaleString("es-EC",{maximumFractionDigits:0});

function tramosRuta(v){
  const P=CONFIG.P;
  const hecho={n:"Tramo 1 · completado",h:"Diagnóstico preliminar",
    p:"Es el que acaba de hacer. No firmó nada, no pagó nada y ya tiene identificados sus frentes abiertos con la norma que aplica a cada uno.",
    pr:"Sin costo",hecho:true};
  if(v.t===1) return [hecho,
    {n:"Tramo 2",h:"Revisión anual de cumplimiento",p:"Verificación una vez al año para confirmar que lo que hoy funciona sigue vigente frente a lo que emita la Superintendencia.",pr:P.auditoria},
    {n:"Tramo 3",h:"Delegado de Protección de Datos externo",p:"Supervisión mensual, revisión de cambios normativos y respuesta ante requerimientos.",pr:P.delegado}];
  if(v.t<=3) return [hecho,
    {n:"Tramo 2",h:"Auditoría de cumplimiento",p:"Revisión documental de lo observado, con informe de hallazgos y plan de trabajo en orden de prioridad. Aquí se define el alcance real de su caso.",pr:P.auditoria},
    {n:"Tramo 3",h:"Levantamiento de lo que falta",p:"Elaboración de los documentos faltantes, el inventario de qué datos guarda y para qué, el procedimiento para atender pedidos, los contratos con proveedores y las políticas internas.",pr:P.implementacion},
    {n:"Tramo 4",h:"Delegado de Protección de Datos externo",p:"Nombramiento formal, registro ante la Superintendencia y supervisión mensual.",pr:P.delegado}];
  return [hecho,
    {n:"Tramo 2",h:"Auditoría de cumplimiento",p:"Revisión que fija el alcance exacto y el orden de prioridad. Consúltenos por el descuento de la auditoría sobre la implementación.",pr:P.auditoria},
    {n:"Tramo 3",h:"Implementación LOPDP",p:"Entre 20 y 35 documentos, incluido el inventario de qué datos guarda y para qué, las políticas, los letreros y avisos, el procedimiento para atender pedidos, los contratos con proveedores y el análisis de riesgos. En 8 a 12 días está todo implementado y auditado.",pr:P.implementacion},
    {n:"Tramo 4",h:"Delegado de Protección de Datos externo",p:"Nombramiento formal, registro ante la Superintendencia y supervisión mensual, sin sumar una persona a la nómina.",pr:P.delegado}];
}

function expediente(){
  const d=new Date(),p=n=>String(n).padStart(2,"0");
  return `DX-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}


/* ══════════════════════════════════════════════════════════
   INFRACCIONES UNA POR UNA
   JAG: los artículos y la gravedad de cada línea están tomados
   de la calculadora de multas de TempoLegal, ya validada por usted.
   No se agregó ninguna cita nueva. Art. 67 = leve, Art. 68 = grave.
   ══════════════════════════════════════════════════════════ */
const CATALOGO = {
  dpd_desig:{t:"Delegado de Protección de Datos designado", a:"Art. 48 LOPDP", g:true},
  dpd_reg:  {t:"Delegado registrado ante la Superintendencia", a:"Resolución SPDP-SPD-2025-0028-R", g:true},
  eipd:     {t:"Evaluación de impacto realizada", a:"Art. 42 LOPDP", g:true},
  seguridad:{t:"Medidas de seguridad técnicas, organizativas y jurídicas", a:"Art. 68 núm. 1 LOPDP", g:true},
  finalidad:{t:"Usar los datos solo para los fines declarados", a:"Art. 68 núm. 2 LOPDP", g:true},
  riesgos:  {t:"Metodología de análisis y gestión de riesgos", a:"Art. 68 núm. 4 LOPDP", g:true},
  contratos:{t:"Contratos con cláusulas LOPDP con sus proveedores", a:"Art. 68 núm. 9 LOPDP", g:true},
  registro: {t:"Registro de actividades de tratamiento", a:"Art. 38 Reglamento General LOPDP", g:true},
  brechas:  {t:"Protocolo de notificación de brechas", a:"Art. 43 LOPDP, reformado por la LOFC (también al CSIRT)", g:true},
  diseno:   {t:"Protección de datos desde el diseño y por defecto", a:"Art. 67 núm. 2 LOPDP", g:false},
  garantias:{t:"Proveedores elegidos con garantías suficientes", a:"Art. 67 núm. 4 LOPDP", g:false}
};

function infracciones(){
  const T=t=>tags.includes(t);
  const set=new Set();
  /* JAG: solo se factura lo que el usuario declaró que le falta. Si declaró tener
     delegado designado o registrado, esas líneas no entran. */
  if(bio){
    set.add("seguridad");
    if(dpd!=="completo") set.add("eipd");
    if(dpd==="no"||dpd==="nose") { set.add("dpd_desig"); set.add("dpd_reg"); }
    else if(dpd==="sinregistro") set.add("dpd_reg");
  }
  if(sens){ ["seguridad","finalidad"].forEach(k=>set.add(k)); if(dpd!=="completo") set.add("eipd"); }
  else if(T("financiero")){ ["seguridad","finalidad"].forEach(k=>set.add(k)); }
  if(T("camara")&&!bio){ ["seguridad","diseno"].forEach(k=>set.add(k)); }
  if(gaps.includes("enc")){ ["contratos","garantias"].forEach(k=>set.add(k)); }
  /* JAG: el registro de actividades (Art. 38 RGLOPDP) se exige al responsable con cien
     o más trabajadores, y al de menos de cien solo si el tratamiento entraña riesgo, no
     es ocasional o incluye categorías especiales (Art. 39). Por eso se condiciona. */
  if(gaps.includes("arco")){
    set.add("riesgos");
    if(seg==="grande"||sens||bio) set.add("registro");
  }
  /* JAG: usar IA no es, por sí solo, no notificar una brecha. Se quitó esa línea. */
  if(gaps.includes("ia")) set.add("riesgos");
  return [...set].map(k=>CATALOGO[k]).filter(Boolean).sort((a,b)=>(b.g-a.g)||a.a.localeCompare(b.a));
}

function montos(){
  const L=infracciones();
  if(!factura||!factura.base) return {lista:L, min:null, max:null, graves:L.filter(x=>x.g).length};
  const b=factura.base;
  const lista=L.map(x=>Object.assign({},x,{
    min: x.g? b*0.007 : b*0.001,
    max: x.g? b*0.01  : b*0.007 }));
  return {lista, min:lista.reduce((a,x)=>a+x.min,0), max:lista.reduce((a,x)=>a+x.max,0), graves:L.filter(x=>x.g).length};
}

/* ══════════════════════════════════════════════════════════
   ARMADO DEL INFORME
   ══════════════════════════════════════════════════════════ */
let V=null, TOP=[], TODAS=[];

function armarResultado(){
  V=nivel();
  TODAS=gaps.map(g=>GAPS[g]).sort((a,b)=>b.w-a.w);
  TOP=TODAS.slice(0,4);
  const fecha=new Date().toLocaleDateString("es-EC",{day:"2-digit",month:"long",year:"numeric"});
  const nb=TODAS.length;
  let d=0; const R=()=>`style="animation-delay:${(d++)*40}ms"`;
  let h="";

  h+=`<div class="exp reveal" ${R()}>Diagnóstico preliminar de cumplimiento · Informe <b class="num">${expediente()}</b><br>${fecha} · Preparado por el equipo de protección de datos de TempoLegal</div>`;
  h+=`<div class="reveal" ${R()}><div class="nivel-k">Nivel de exposición · ${V.r}</div>
    <div class="nivel n${V.t}">${V.w}</div>
    <div class="esc"><div class="esc-b">${[1,2,3,4,5].map(i=>`<i class="${i<=V.t?"f"+V.t:""}"></i>`).join("")}</div>
    <div class="esc-l"><span>Controlado</span><span>Muy alto</span></div></div>
    <p class="nivel-p">${V.p}</p></div>`;

  /* Delegado. Nunca se dice que no le corresponde. */
  h+=`<div class="aviso reveal" ${R()}>
    <h3>${bio?"Todo apunta a que le toca nombrar un Delegado":"El Delegado de Protección de Datos queda por revisar"}</h3>
    <p>${bio
      ? "La huella, el rostro, la voz y saber dónde está una persona entran en lo que la ley llama tratamiento a gran escala, que es manejar datos de muchas personas de forma constante y organizada. Eso se evalúa por vía propia, sin que importe el tamaño de su organización. En estos casos suele corresponder nombrar un Delegado de Protección de Datos, que es alguien que responde por cómo se cuidan esos datos."
      : "Con un diagnóstico breve no se determina si a usted le corresponde nombrar un Delegado de Protección de Datos, que es alguien que responde por cómo se cuidan esos datos. Eso depende de qué hace con la información, si la cruza, si la entrega a terceros, si la saca del país, si arma perfiles y de la actividad exacta de su RUC. Hay que verlo con un abogado."}</p>
    <p>${bio?"":"Si resulta que sí le corresponde y no lo tiene nombrado, son varias infracciones más sobre las que ya aparecen en este informe."}</p>
    <span class="norma">${N.dpd}</span></div>`;

  h+=`<div id="riesgo"></div>`;

  /* Casos reales */
  h+=`<div class="casos reveal" ${R()}>
    <h3>Lo que ya pasó en Ecuador</h3>
    <p>La Superintendencia ha dictado cuatro resoluciones sancionatorias, contra LigaPro y contra la Federación Ecuatoriana de Fútbol.</p>
    <span class="cifra-g num">USD 744.473</span>
    <p>Es el total de esas cuatro multas. Tres fueron por falta grave y una por falta leve, lo que muestra que también se sanciona lo leve. En todos los casos hubo pedidos de información, inspecciones en el propio local y órdenes de corregir antes de que llegara la multa. El proceso no empieza con una auditoría sorpresa, empieza con la denuncia en línea de una persona molesta.</p>
    <p class="capas">Resoluciones publicadas por la Superintendencia, verificadas a octubre de 2026${CONFIG.SANCIONES?`. <a href="${CONFIG.SANCIONES}" target="_blank" rel="noopener">Resoluciones publicadas por la Superintendencia</a>`:``}.</p>
  </div>`;

  /* Qué hacer primero */
  h+=`<div class="bloque reveal" ${R()}><div class="bloque-t">Qué hacer primero</div><ol class="acc">
    <li><b>Hable con un abogado sobre su caso</b><span>Antes de comprar documentos sueltos hay que saber qué le aplica a usted. Es una conversación, no un servicio.</span></li>
    <li><b>Levante el inventario de qué datos guarda y para qué</b><span>Es el documento del que dependen todos los demás. Sin él no se puede responder un pedido en quince días ni sostener una inspección.</span></li>
    <li><b>Revise los contratos de quien entra a sus archivos</b><span>Contador externo, nómina, sistemas, marketing. Es lo primero que se pide y lo que más demora conseguir después.</span></li>
    <li><b>Ponga por escrito quién responde por esto</b><span>Mientras no haya un nombre asignado, la obligación existe pero no la cumple nadie.</span></li>
  </ol></div>`;

  h+=muro(nb);
  h+=`<div id="detalle" style="display:none">`;
  h+=`<div class="bloque"><div class="bloque-t">Los seis frentes que revisamos</div><table class="mtz"><tbody>
    ${matriz().map(a=>{const e=ESTADO[a.e];return `<tr><td>${a.n}</td><td class="${e[1]}"><span>${e[0]}</span></td></tr>`;}).join("")}
    </tbody></table>
    <p class="mtz-n">«Sin señales» significa que este diagnóstico no encontró indicios en ese frente, no que su organización cumpla. Con un diagnóstico breve no se determina el cumplimiento de nadie.</p></div>`;

  if(oks.length){
    h+=`<div class="bloque"><div class="bloque-t">Lo que usted declaró tener cubierto</div>`;
    oks.forEach(o=>h+=`<div class="pieza ok"><h4>${o}</h4></div>`);
    h+=`</div>`;
  }
  if(TOP.length){
    h+=`<div class="bloque"><div class="bloque-t">Lo que le falta · ${TODAS.length>TOP.length?("principales "+TOP.length+" de "+TODAS.length):TODAS.length}</div>`;
    TOP.forEach(g=>h+=`<div class="pieza"><h4>${g.t}</h4><p>${g.d}</p><span class="norma">${g.ref}</span></div>`);
    h+=`</div>`;
  }
  h+=`<div class="bloque"><div class="bloque-t">Lectura de su caso</div><p class="lectura esperando" id="lectura">Redactando la lectura de su caso.</p></div>`;
  h+=`<div class="bloque"><div class="bloque-t">Multa por multa</div><div id="tabla-multas"></div></div>`;
  h+=`<div class="bloque"><div class="bloque-t">Régimen sancionatorio</div><div id="sancion-detalle"></div></div>`;

  const rt=tramosRuta(V);
  const nom=["","un tramo","dos tramos","tres tramos","cuatro tramos"][rt.length]||rt.length+" tramos";
  h+=`<div class="bloque"><div class="bloque-t">Ruta recomendada para su caso</div>
    <p class="tramo-lede">Son ${nom}${CONFIG.RECORRIDO?`, y ya hemos acompañado a ${CONFIG.RECORRIDO} organizaciones ecuatorianas por este mismo camino`:``}. El primero empieza sin que usted firme nada, y ya lo completó.</p>
    ${rt.map(f=>`<div class="tramo${f.hecho?" hecho":""}"><span class="t-n">${f.n}</span><h4>${f.h}</h4><p>${f.p}</p><span class="precio">${f.pr}</span></div>`).join("")}
    <p class="mtz-n">Valores de partida. El alcance definitivo se confirma por escrito tras revisar su operación, y cualquier actividad fuera de ese alcance se cotiza aparte antes de ejecutarla.</p></div>`;

  if(CONFIG.LINKS&&CONFIG.LINKS.length){
    h+=`<div class="bloque enlaces"><div class="bloque-t">Para profundizar</div>
      ${CONFIG.LINKS.map(l=>`<a class="enl" href="${l.u}" target="_blank" rel="noopener">${l.t}</a>`).join("")}</div>`;
  }
  h+=`</div>`;
  /* Las dos cifras y el cierre van FUERA del muro. Antes solo los veía quien ya
     había dejado su contacto, de modo que el precio se le mostraba a quien ya compró. */
  h+=`<div class="bloque" id="duelo-bloque"></div>`;
  h+=cierre();
  h+=`<button class="reiniciar" id="reiniciar">Hacer el diagnóstico de nuevo</button>`;
  h+=pie();

  $("res").innerHTML=h;
  pintarRiesgo();
  cablearDetalle();
  $("paso").innerHTML=`Informe · <b>${V.r}</b>`;
  cablearResultado(nb);
  ver("p-res");
  TL.track("resultado",{nivel:V.r,veredicto:V.w,infracciones:TODAS.length,graves:montos().graves,puntaje:puntaje(),segmento:seg,biometrico:bio,delegado:dpd,facturacion:(factura?factura.t:"no indicada"),value:(montos().min||0)});
}

/* ══════════════════════════════════════════════════════════
   BLOQUES QUE DEPENDEN DE LA FACTURACIÓN
   ══════════════════════════════════════════════════════════ */
function pintarRiesgo(){
  const M=montos();
  const nb=M.lista.length;
  const tri = seg==="natural"
    ? `<div><b>Personal, no de la empresa</b><span>Usted responde con su nombre. No hay una compañía de por medio que absorba la consecuencia.</span></div>
       <div><b>Civil, sin techo</b><span>La indemnización a la persona afectada no tiene un tope fijado en la ley. Depende del daño que se pruebe.</span></div>
       <div><b>Penal</b><span>De uno a tres años. Las figuras penales recaen sobre la persona que ejecuta la conducta.</span></div>`
    : `<div><b>Administrativa</b><span>Multa sobre su facturación, más la orden de dejar de usar la información, de borrarla y de publicar la sanción.</span></div>
       <div><b>Civil</b><span>Indemnización a cada persona afectada, aparte de la multa y sin un tope fijado en la ley.</span></div>
       <div><b>Penal</b><span>De uno a tres años, contra quien ejecuta la conducta. El gerente, el jefe de sistemas o quien tenga acceso.</span></div>`;

  let cifras="";
  if(factura && factura.base){
    cifras=`<span class="legal-mini">Estimación referencial · no es asesoría legal</span>
      <div class="cifras">
        <div class="fila grande"><span>Lo que le pueden multar hoy</span><span class="rojo num">${money(M.min)} a ${money(M.max)}</span></div>
        <p class="cifras-n">Suma de las ${M.lista.length} obligaciones que le faltan, calculada sobre el tramo de facturación que usted indicó, tomando ${money(factura.base)} como referencia. Las faltas graves van del 0,7% al 1% y las leves del 0,1% al 0,7%. La multa suele no ser lo más costoso. La Superintendencia puede además ordenar que deje de usar esa información, que la borre y que se publique la sanción.</p>
      </div>`;
  } else {
    cifras=`<div class="cifras"><p class="cifras-n">Sin el dato de facturación no calculamos ninguna cifra, porque sería inventada. La multa se fija entre el 0,1% y el 0,7% de la facturación del año anterior en las infracciones leves, y entre el 0,7% y el 1% en las graves.</p></div>`;
  }

  if(TODAS.length===0){ pintarLimpio(); pintarMultas(); pintarSancionDetalle(); return; }
  $("riesgo").innerHTML=`<div class="caja grave">
    <h3>Qué está en juego si esto no se corrige</h3>
    <p class="caja-p">Incumplir la LOPDP abre tres frentes distintos, y no se excluyen entre sí.</p>
    <div class="tri">${tri}</div>
    ${cifras}
    <p class="acum"><b>No es una multa, son ${M.lista.length}.</b> Cada obligación que le falta se cuenta por separado y todas pueden salir del mismo expediente${M.graves?`, y ${M.graves} de ellas ${M.graves===1?"es una falta grave":"son faltas graves"}`:``}. El detalle de cada una, con su artículo, está más abajo.</p>
    <span class="norma">${N.sanciones} · ${N.coip}</span>
  </div>`;
  pintarDuelo();
  pintarMultas();
  pintarSancionDetalle();
}

function pintarLimpio(){
  let ahorro="";
  if(factura && factura.base){
    const evitado=factura.base*0.007*3;
    ahorro=`<span class="legal-mini">Estimación referencial · no es asesoría legal</span>
      <div class="cifras">
        <div class="fila"><span>Exposición que hoy no tiene</span><span class="verde">${money(evitado)}</span></div>
        <p class="cifras-n">Es el piso de la multa que enfrentaría una organización de su tamaño con tres frentes abiertos, que es lo que encontramos en la mayoría de los casos. En lo que consultamos, esas señales no aparecieron.</p>
      </div>`;
  }
  $("riesgo").innerHTML=`<div class="caja limpia">
    <h3>Lo que se está ahorrando</h3>
    <p class="caja-p">En los seis frentes que revisamos no aparecieron señales de alto riesgo, y eso lo pone en una minoría muy pequeña. Con un diagnóstico breve no se determina el cumplimiento de nadie, así que esto no es un certificado. Es una buena señal.</p>
    ${ahorro}
    <p class="acum"><b>Lo que sigue no es implementar, es mantener.</b> Esto se cae solo, sin que nadie se dé cuenta, en cuatro momentos:</p>
    <ul class="regalo">
      <li>Cuando cambia la persona que hoy sostiene la práctica y nadie le explica por qué se hacía así</li>
      <li>Cuando entra un proveedor nuevo y firma el contrato de siempre</li>
      <li>Cuando alguien empieza a usar una herramienta de inteligencia artificial por su cuenta</li>
      <li>Cuando la Superintendencia emite una resolución y nadie la revisa</li>
    </ul>
    <p class="acum">Una revisión anual documenta lo que hoy funciona por costumbre y deja constancia de que se revisó. Es el tramo 2 de su ruta.</p>
    <span class="norma">${N.sanciones}</span>
  </div>`;
  const el=$("duelo-bloque"); if(el) el.innerHTML="";
}

function pintarDuelo(){
  if(TODAS.length===0){ const e=$("duelo-bloque"); if(e) e.innerHTML=""; return; }
  const el=$("duelo-bloque"); if(!el) return;
  const M=montos(); const nb=M.lista.length;
  if(!(factura&&factura.base)||!nb){ el.innerHTML=""; return; }
  const arriesga = M.min;
  const inv = CONFIG.INVERSION_MIN;
  const mult = arriesga/inv;
  /* JAG: guarda del múltiplo. Bajo 2x el argumento se dispara en contra,
     así que se cambia por el que sí se sostiene. */
  const cierre = mult>=2
    ? `Con ${nb} ${nb===1?"frente abierto":"frentes abiertos"}, lo que arriesga equivale a ${mult>50?'más de 50':(Math.round(mult*10)/10).toLocaleString('es-EC')} veces lo que cuesta empezar a resolverlo.`
    : `La multa no es lo más caro de esto. La orden de dejar de usar su información, la demanda de cada persona afectada y el hábeas data no dependen del tamaño de su organización.`;
  el.innerHTML=`<div class="bloque-t">Las dos cifras</div>
    <span class="legal-mini">Estimación referencial · no es asesoría legal</span>
    <div class="duelo">
      <div class="mal"><b>Si no hace nada</b><strong class="num">${money(arriesga)}</strong>
        <span>Piso de la suma de las ${nb} ${nb===1?"infracción":"infracciones"} que le faltan, sin contar indemnizaciones, la orden de corregir ni el hábeas data.</span></div>
      <div class="bien"><b>Si lo resuelve</b><strong class="num">desde USD ${CONFIG.INVERSION_MIN.toLocaleString("es-EC",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
        <span>Auditoría más implementación LOPDP, + IVA, en un solo pago y por una sola vez.</span></div>
    </div>
    <p class="acum">${cierre}</p>`;
}

function pintarMultas(){
  const el=$("tabla-multas"); if(!el) return;
  const M=montos();
  if(!M.lista.length){ el.innerHTML=`<p class="pieza">Este diagnóstico no identificó obligaciones incumplidas en los seis frentes consultados. Con un diagnóstico breve no se revisa el catálogo completo de la ley, así que esto no equivale a que no le falte nada.</p>`; return; }
  const conMonto = factura && factura.base;
  el.innerHTML=`
    ${conMonto?`<span class="legal-mini">Estimación referencial · no es asesoría legal</span>`:``}
    <table class="multas"><thead><tr>
      <th>Lo que le falta</th><th>Gravedad</th>${conMonto?`<th>Multa estimada</th>`:``}
    </tr></thead><tbody>
    ${M.lista.map(x=>`<tr>
      <td><b>${x.t}</b><span class="art">${x.a}</span></td>
      <td class="${x.g?"g-grave":"g-leve"}"><span>${x.g?"Grave":"Leve"}</span></td>
      ${conMonto?`<td class="mto num">${money(x.min)}<span class="rango">${money(x.min)} a ${money(x.max)}</span></td>`:``}
    </tr>`).join("")}
    ${conMonto?`<tr class="tot"><td><b>Suma</b></td><td></td><td class="mto num">${money(M.min)}<span class="rango">hasta ${money(M.max)}</span></td></tr>`:``}
    </tbody></table>
    <p class="mtz-n">${conMonto?`Cada línea se calcula sobre el tramo de facturación que usted indicó. `:`Elija su tramo de facturación más arriba para ver el monto de cada línea. `}Las obligaciones y sus artículos salen de lo que usted respondió. La Superintendencia puede calificar los hechos de otra manera y en infracciones graves suele dictar primero medidas correctivas.</p>`;
}

function pintarSancionDetalle(){
  const el=$("sancion-detalle"); if(!el) return;
  el.innerHTML=`
    <div class="pieza"><h4>Cómo se calcula la multa</h4>
      <p>En el sector privado se calcula sobre la facturación del año anterior, entendida como las ventas de productos y servicios descontando el IVA y otros impuestos ligados directamente a ellas. Entre 0,1% y 0,7% en las infracciones leves, y entre 0,7% y 1% en las graves. En el sector público la multa recae sobre el funcionario, de 1 a 10 salarios básicos en las leves y de 10 a 20 en las graves.</p>
      <span class="norma">${N.sanciones}</span></div>
    <div class="pieza"><h4>Qué agrava el monto</h4>
      <p>La Superintendencia pondera la intención, si el hecho se repitió, el perjuicio causado y si ya hubo una sanción anterior. Repetir y reincidir suben el monto dentro del rango, no lo bajan.</p>
      <span class="norma">${N.sanciones}</span></div>
    <div class="pieza"><h4>Lo que puede doler más que la multa</h4>
      <p>La orden de dejar de usar la información con la que trabaja, la orden de borrarla y la publicación de la sanción. Para una operación en marcha, dejar de usar su propia base de datos suele costar más que el dinero.</p>
      <span class="norma">${N.correctivas}</span></div>
    <div class="pieza"><h4>Responsabilidad penal</h4>
      <p>Cuando hay intención de por medio, el asunto sale de lo administrativo. Revelar ilegalmente una base de datos se castiga con uno a tres años de cárcel, que suben de tres a cinco si lo hace un servidor público o un empleado bancario. Violar la intimidad, que incluye acceder, grabar, difundir o publicar datos de alguien sin su permiso ni autorización legal, también contempla de uno a tres años. Estas figuras recaen sobre la persona que ejecuta la conducta, no sobre la empresa.</p>
      <span class="norma">${N.coip}</span></div>`;
}


/* ══════════════════════════════════════════════════════════
   MURO, CIERRE Y PIE
   ══════════════════════════════════════════════════════════ */
function muro(nb){
  return `<div class="muro" id="muro">
    <h3>La lista completa, por escrito y gratis</h3>
    <p class="muro-p">Le abrimos aquí mismo el informe detallado y se lo enviamos al canal que prefiera.</p>
    <ul class="regalo">
      <li>Los seis frentes revisados, con el estado de cada uno</li>
      <li>Lo que le falta y la norma que lo exige</li>
      <li>La lectura de su caso y el régimen sancionatorio</li>
      <li>La ruta de trabajo con los valores de partida</li>
    </ul>
    <div class="canal-tabs" role="group" aria-label="Canal de contacto">
      <button type="button" class="canal-tab sel" id="tab-wa" aria-pressed="true" data-canal="whatsapp">WhatsApp</button>
      <button type="button" class="canal-tab" id="tab-mail" aria-pressed="false" data-canal="correo">Correo</button>
    </div>
    <input type="text" class="campo" id="c-contacto" aria-label="Número de WhatsApp" aria-describedby="c-error" placeholder="Número de WhatsApp" inputmode="tel" autocomplete="tel">
    <input type="text" class="campo" id="c-nombre" aria-label="Nombre y apellido" placeholder="Nombre y apellido" autocomplete="name">
    <div class="dos">
      <input type="text" class="campo" id="c-org" aria-label="Organización" placeholder="Organización" autocomplete="organization">
      <input type="text" class="campo" id="c-cargo" aria-label="Cargo" placeholder="Cargo" autocomplete="organization-title">
    </div>
    <p class="error" id="c-error" role="alert" aria-live="assertive"></p>
    <label class="check"><input type="checkbox" id="c-ok"><span>Autorizo a TempoLegal a usar estos datos para enviarme el informe y para comunicarse conmigo sobre mi caso. Puedo retirar esta autorización cuando quiera.</span></label>
    <button class="btn" id="abrir">Abrir el informe detallado</button>
    <p class="capas">Responsable: TempoLegal, Quito. Finalidad: enviarle el informe y atender su consulta. Base: su consentimiento. Conservación: el tiempo necesario para esas finalidades y los plazos que exija la normativa aplicable. Canal para ejercer sus derechos: ${CONFIG.EMAIL}. El detalle está en el <a href="${CONFIG.PRIVACIDAD}" target="_blank" rel="noopener">aviso de privacidad</a>.</p>
  </div>`;
}

function cierre(){
  const natural=seg==="natural", grande=seg==="grande";
  let t,c,e;
  if(V.t>=4){
    t="Lo que le recomendamos hacer";
    c=`Con este nivel de exposición lo primero no es comprar documentos sueltos, es ordenar la operación. Una <b>implementación LOPDP</b> deja entre 20 y 35 documentos, y sobre todo deja a ${natural?"su consultorio":"su empresa"} en capacidad de demostrar qué hace con la información de las personas, que es justamente lo que se pide cuando llega un requerimiento.`;
    e=bio
      ? `Y como usted usa huella, rostro, voz o localización, el paso que sigue es <b>nombrar y registrar un Delegado de Protección de Datos</b>. TempoLegal ejerce esa función desde afuera para sus clientes, así usted cubre esa obligación ${natural?"sin contratar a nadie":"sin sumar a nadie a la nómina"}.`
      : `Si quiere resolver la parte permanente, TempoLegal ejerce como <b>Delegado de Protección de Datos externo</b>, con supervisión mensual y respuesta ante la Superintendencia.`;
    if(grande) e+=` Si necesita llevar esto a gerencia antes de decidir, guarde el informe en PDF. Trae los frentes revisados, la norma de cada hallazgo y la ruta por tramos, que suele ser el sustento que piden para aprobar presupuesto.`;
  } else if(V.t===3){
    t="Su caso no empieza de cero";
    c=`Hay criterio y hay práctica, lo que falta es dejarlo por escrito. Lo eficiente aquí es una <b>auditoría de cumplimiento</b>, que revisa lo que ya tiene e identifica qué falta y en qué orden, sin pagar por rehacer lo que está bien.`;
    e=`Desde ahí se completa lo que corresponda y, si el caso lo exige, se nombra al <b>Delegado de Protección de Datos</b>.`;
  } else if(V.t===2){
    t="Le faltan detalles, no una reforma";
    c=`Lo esencial está cubierto. Cerrar las observaciones que aparecen arriba es un trabajo acotado, y hacerlo ahora cuesta una fracción de lo que cuesta cuando ya hay un reclamo de por medio.`;
    e=`También puede dejar la supervisión en manos de un <b>Delegado de Protección de Datos externo</b>, que es la forma más económica de sostener esto en el tiempo.`;
  } else {
    t="Lo que sigue es sostenerlo";
    c=`En lo que revisamos no aparecieron señales de alto riesgo. Su exposición aparece cuando cambia la persona que hoy sostiene todo esto, cuando entra un proveedor nuevo o cuando la Superintendencia emite una resolución y nadie la revisa.`;
    e=`Para eso existe el <b>Delegado de Protección de Datos externo</b>, con supervisión mensual, revisión de los cambios normativos y respuesta ante requerimientos.`;
  }
  const calc=CONFIG.CALCULADORA?`<p class="calc-l">¿No sabe si le corresponde tener Delegado? <a href="${CONFIG.CALCULADORA}" target="_blank" rel="noopener" data-cta="calculadora-cierre">Revíselo aquí en un minuto</a>.</p>`:``;
  return `<div class="cierre" id="cierre">
    <h3>${t}</h3><p>${c}</p><p>${e}</p>
    <p>La implementación parte de <b>USD 390,00 + IVA</b>, pago único, y el Delegado externo de <b>USD 95,00 + IVA al mes</b>. El valor final se fija por escrito antes de empezar.</p>
    <p>La LOPDP está vigente y la Superintendencia ya ejerce su facultad de sancionar. Nada de esto exige detener su operación. Todo exige poder demostrarla.</p>
    ${calc}
    <div class="botones">
      <button class="btn wa" id="wa-cierre">${grande?"Agendar una reunión por WhatsApp":"Conversar con un abogado por WhatsApp"}</button>
      <button class="btn sec" id="pdf">Guardar este informe en PDF</button>
    </div>
    <p class="capas">Se abre el diálogo de impresión de su navegador, elija «Guardar como PDF». <a href="#" id="bajar">Si no se abre, descárguelo aquí</a>.</p>
  </div>`;
}

function pie(){
  return `<footer class="tl-pie">
    <img src="${(document.querySelector('.logo img')||{}).src||''}" alt="TempoLegal">
    <p><b>Estimación referencial</b>, calculada solo con las respuestas que usted marcó y sin revisar documentos. Es un orden de magnitud, no una predicción de lo que resolvería la autoridad. <b>No es asesoría legal ni opinión profesional, y su uso no crea relación abogado-cliente con TempoLegal.</b> Lo que le corresponde de verdad se confirma revisando su caso.</p>
    <p>TempoLegal · Av. de los Shyris y Eloy Alfaro, Edificio Parque Central, norte de Quito · <a href="https://wa.me/593978887392" target="_blank" rel="noopener">WhatsApp +593 97 888 7392</a> · <a href="mailto:info@tempolegal.com">info@tempolegal.com</a> · <a href="../../politica-de-privacidad/index.html" target="_blank" rel="noopener">Política de privacidad</a></p>
    <p class="tl-tools"><b>Otras herramientas gratuitas de TempoLegal:</b> <a href="../calculadora-multas-lopdp/index.html">Calculadora de multas LOPDP</a> <a href="../calculadora-delegado-lopdp/index.html">Calculadora de Delegado de Protección de Datos</a></p>
  </footer>`;
}

/* ══════════════════════════════════════════════════════════
   CABLEADO
   ══════════════════════════════════════════════════════════ */
let canal="whatsapp", canalPrevio="whatsapp", guardadoCanal={};

function cablearResultado(nb){
  /* canal */
  const setCanal=c=>{
    canal=c;
    $("tab-wa").classList.toggle("sel",c==="whatsapp");
    $("tab-mail").classList.toggle("sel",c==="correo");
    $("tab-wa").setAttribute("aria-pressed", c==="whatsapp"?"true":"false");
    $("tab-mail").setAttribute("aria-pressed", c==="correo"?"true":"false");
    const i=$("c-contacto");
    const et = c==="whatsapp" ? "Número de WhatsApp" : "Correo electrónico";
    guardadoCanal[canalPrevio]=i.value; canalPrevio=c;
    i.placeholder=et; i.setAttribute("aria-label",et);
    i.setAttribute("inputmode", c==="whatsapp"?"tel":"email");
    i.value=guardadoCanal[c]||"";
  };
  $("tab-wa").addEventListener("click",()=>setCanal("whatsapp"));
  $("tab-mail").addEventListener("click",()=>setCanal("correo"));

  $("abrir").addEventListener("click",abrirDetalle);
  $("c-contacto").addEventListener("keydown",e=>{ if(e.key==="Enter") abrirDetalle(); });
  $("reiniciar").addEventListener("click",()=>{
    /* JAG: el reinicio debe limpiar TODO. Antes dejaba V y TODAS del diagnóstico
       anterior, y la barra fija mandaba por WhatsApp un resultado que ya no era suyo. */
    idx=0;resp={};factura=null;lead=null;rescateHecho=false;canal="whatsapp";
    V=null;TOP=[];TODAS=[];recompute();
    $("paso").textContent="Diagnóstico LOPDP";
    $("fija").classList.remove("on");
    ver("p-inicio");
  });

  /* barra fija: aparece al pasar el resultado y se esconde en el cierre */
  if(cableado) return; cableado=true;
  const obs=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.target.id==="muro"||e.target.id==="cierre"){
        if(e.isIntersecting) $("fija").classList.remove("on");
      }
    });
  },{threshold:.15});
  ["muro","cierre"].forEach(id=>{const el=$(id); if(el) obs.observe(el);});
  window.addEventListener("scroll",()=>{
    if(!$("p-res").classList.contains("on")) return;
    const y=window.scrollY;
    const muroEl=$("muro"), cierreEl=$("cierre");
    const enMuro = muroEl && muroEl.getBoundingClientRect().top < window.innerHeight*.85 && muroEl.getBoundingClientRect().bottom > 0;
    const enCierre = cierreEl && cierreEl.getBoundingClientRect().top < window.innerHeight*.85 && cierreEl.getBoundingClientRect().bottom > 0;
    $("fija").classList.toggle("on", y>200 && !enMuro && !enCierre);
  },{passive:true});
}

function abrirDetalle(){
  const v=$("c-contacto").value.trim();
  const ok=$("c-ok").checked;
  const err=$("c-error");
  let contacto=null;
  if(canal==="correo"){ if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) contacto=v; }
  else { const d=v.replace(/\D/g,""); if(d.length>=7&&d.length<=13) contacto=d; }
  if(!contacto||!$("c-nombre").value.trim()||!ok){
    err.textContent = !contacto
      ? (canal==="correo"?"Escriba un correo válido.":"Escriba un número de WhatsApp de al menos siete dígitos.")
      : (!$("c-nombre").value.trim() ? "Escriba su nombre." : "Necesitamos su autorización para enviarle el informe.");
    err.classList.add("on"); $("c-contacto").focus(); return;
  }
  err.classList.remove("on");
  $("abrir").disabled=true; $("abrir").textContent="Abriendo su informe";

  lead={canal,contacto,nombre:$("c-nombre").value.trim(),
    organizacion:$("c-org").value.trim()||null, cargo:$("c-cargo").value.trim()||null,
    segmento:seg, nivel:V.r, veredicto:V.w, puntaje:puntaje(),
    facturacion: factura?factura.t:"no indicada", biometrico:bio,
    infracciones:TODAS.length, brechas:TODAS.map(g=>g.t),
    respuestas:orden().map(q=>resp[q.id]).filter(Boolean).map(a=>({pregunta:a.pregunta,respuesta:a.txt})),
    origen: location.search||"directo"};
  enviarLead(lead);
  TL.track("lead",{canal,nivel:V.r,infracciones:TODAS.length,segmento:seg,value:(montos().min||0)});

  $("muro").innerHTML=`<div class="gracias">
    <h4>Listo, ya tiene el informe abajo</h4>
    ${CONFIG.LEAD_ENDPOINT?``:`<a class="btn wa" style="display:block;text-align:center;margin:10px 0" target="_blank" rel="noopener"
      href="https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hola, soy '+(lead&&lead.nombre||'')+'. Hice el diagnóstico LOPDP y quiero conversar mi caso.')}">Asegurar la respuesta por WhatsApp</a>`}
    <p>Un abogado de TempoLegal le va a escribir, normalmente el mismo día hábil. Le hará unas preguntas cortas sobre su operación para armarle una propuesta con precio cerrado, así usted sabe de antemano cuánto cuesta y qué incluye.</p>
  </div>`;
  $("detalle").style.display="block";
  cablearDetalle();
  $("detalle").scrollIntoView({behavior:"smooth",block:"start"});
  lectura();
}

function enviarLead(p){
  if(CONFIG.LEAD_ENDPOINT){
    try{ fetch(CONFIG.LEAD_ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({herramienta:"Diagnóstico LOPDP",version:"V3"},p)),keepalive:true}).catch(()=>{}); }catch(e){}
  } else {
    console.warn("[TempoLegal] CONFIG.LEAD_ENDPOINT está vacío. Este lead NO se guardó en ningún lado.");
  }
}

function mensajeWA(lugar){
  if(!V){ TL.track("cta",{lugar:lugar+"_sin_resultado"});
    window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent("Buenas, quisiera conversar con un abogado sobre protección de datos personales.")}`,"_blank","noopener");
    return; }
  const g=TODAS[0];
  const t=`Buenas, completé el diagnóstico de datos personales en su sitio web. Resultado: ${V.w}, ${V.r}.`
    +(g?` Lo principal que me falta: ${g.t}.`:``)
    +(bio?` Uso huella, rostro, voz o rastreo.`:``)
    +` Quisiera conversarlo con un abogado.`;
  TL.track("cta",{lugar});
  TL.track("lead_whatsapp",{canal:"whatsapp",lugar,nivel:V.r,veredicto:V.w,
    infracciones:TODAS.length,segmento:seg,value:(montos().min||0)});
  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(t)}`,"_blank","noopener");
}
$("fija-wa").addEventListener("click",()=>mensajeWA("barra_fija"));

function cablearDetalle(){
  const wa=$("wa-cierre"); if(wa) wa.addEventListener("click",()=>mensajeWA("cierre"));
  const pdf=$("pdf"); if(pdf) pdf.addEventListener("click",()=>{
    TL.track("cta",{lugar:"pdf"});
    let impreso=false; const marcar=()=>{impreso=true;};
    window.addEventListener("beforeprint",marcar,{once:true});
    try{ window.print(); }catch(e){}
    setTimeout(()=>{ window.removeEventListener("beforeprint",marcar); if(!impreso) bajar(); },700);
  });
  const b=$("bajar"); if(b) b.addEventListener("click",e=>{e.preventDefault();bajar();});
  document.querySelectorAll("[data-cta]").forEach(a=>a.addEventListener("click",()=>TL.track("cta",{lugar:a.dataset.cta})));
}

function bajar(){
  const css=document.querySelector("style").innerHTML;
  const c=$("res").cloneNode(true);
  ["muro","cierre","reiniciar","fact"].forEach(id=>{const e=c.querySelector("#"+id); if(e) e.remove();});
  const doc=`<!DOCTYPE html><html lang="es-EC"><head><meta charset="utf-8"><title>Diagnóstico LOPDP · TempoLegal</title><style>${css}</style></head><body><div class="wrap res">${c.innerHTML}</div><\/body><\/html>`;
  const url=URL.createObjectURL(new Blob([doc],{type:"text/html"}));
  const a=document.createElement("a"); a.href=url; a.download=`Diagnostico-LOPDP-${expediente()}.html`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
}

/* ══════════════════════════════════════════════════════════
   LECTURA DEL CASO
   ══════════════════════════════════════════════════════════ */
function respaldo(){
  if(V.t===1) return "Sus respuestas describen una operación con criterios ya definidos en los frentes que suelen fallar primero. Lo razonable no es rehacer nada, es dejar por escrito lo que hoy funciona por costumbre, para que siga funcionando cuando cambie la persona que lo sostiene.";
  const p=TOP[0]?TOP[0].t.toLowerCase():"la documentación de qué datos guarda y para qué";
  return `El patrón de sus respuestas no es de descuido, es de crecimiento sin papeles. La operación avanzó más rápido que el registro de lo que hace con la información de las personas. El punto por donde empezaría cualquier revisión seria en su caso es ${p}, porque de ahí dependen los demás controles.`;
}
async function lectura(){
  const el=$("lectura"); if(!el) return;
  if(!CONFIG.API_ENDPOINT){ el.className="lectura"; el.textContent=respaldo(); return; }
  const caso={segmento:seg,nivel:V.r,veredicto:V.w,puntaje:puntaje(),biometrico:bio,sensibles:sens,
    categorias:tags,transferencias:transfer,facturacion:factura?factura.t:null,
    brechas:TOP.map(g=>g.t),respuestas:orden().map(q=>resp[q.id]).filter(Boolean).map(a=>({pregunta:a.pregunta,respuesta:a.txt}))};
  try{
    const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort(),12000);
    const r=await fetch(CONFIG.API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},signal:ctl.signal,body:JSON.stringify({caso})});
    clearTimeout(to);
    const d=await r.json();
    const t=(typeof d.lectura==="string")?d.lectura.trim():"";
    el.className="lectura"; el.textContent=(t&&t.length>40)?t:respaldo();
  }catch(e){ el.className="lectura"; el.textContent=respaldo(); }
}
