/** Diagnostico V3: ported unchanged assessment functions, wrapped in isolated call scope.
 * Input: {tam:[option objects],fact:[option objects],...} or response records {picks:[...],s:N}.
 * This is not a legal determination. Scores are heuristic and original assumptions.
 */
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
export const parametrosDiagnostico=Object.freeze({CONFIG,N,QUESTIONS:QUESTIONS.map(q=>({id:q.id,text:q.text,multi:!!q.multi,options:q.opts?.map(o=>({text:o.t,score:o.s,tag:o.tag,gap:o.gap}))||[]})),GAPS,CATALOGO});
export function calcularDiagnostico(entradas){
 if(!entradas || typeof entradas!=="object") throw new TypeError("Se requieren respuestas");
 let seg="pyme",bio=false,sens=false,transfer=false,dpd="na",gaps=[],oks=[],tags=[],factura=null;
 const resp=Object.fromEntries(Object.entries(entradas).map(([key,value])=>[key,{
   picks: Array.isArray(value) ? value.slice() : (value?.picks||[]).slice(),
   s: value?.s??(Array.isArray(value)?Math.max(0,...value.map(o=>o.s||0)):0)
 }]));
 const orden=()=>QUESTIONS.filter(q=>q.id!=="dpd"||bio);
 const puntaje=()=>orden().reduce((a,q)=>a+((resp[q.id]&&resp[q.id].s)||0),0);
 const money=n=>"USD "+n.toLocaleString("es-EC",{maximumFractionDigits:0});
function recompute(){
  seg="pyme";bio=false;sens=false;transfer=false;dpd="na";gaps=[];oks=[];tags=[];factura=null;
  // dos vueltas: la primera fija bio, de la que depende si la pregunta del Delegado existe
  for(const vuelta of [0,1]){
    QUESTIONS.forEach(q=>{
      const a=resp[q.id]; if(!a) return;
      if(q.id==="dpd"&&vuelta===0) return;
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
 recompute();
 const faltantes=orden().filter(q=>!resp[q.id]?.picks?.length).map(q=>q.id);
 if(faltantes.length)return {completo:false,faltantes,resultado:null};
 return {completo:true,faltantes:[],puntaje:puntaje(),nivel:nivel(),matriz:matriz(),infracciones:infracciones(),montos:montos(),gaps:[...gaps],tags:[...tags],perfil:{seg,bio,sens,transfer,dpd,factura}};
}

/** Build stable answer objects from selected option indices in the original questionnaire. */
export function respuestasDiagnosticoDesdeIndices(seleccion){
 const result={};
 for(const [id,indices] of Object.entries(seleccion||{})){
   const q=QUESTIONS.find(x=>x.id===id);
   if(!q)throw new RangeError("Pregunta desconocida: "+id);
   const list=Array.isArray(indices)?indices:[indices];
   const picks=list.map(index=>{
     if(!Number.isInteger(index)|| index<0 || index>=q.opts.length)throw new RangeError("Opción inválida para "+id);
     return q.opts[index];
   });
   result[id]={picks,s:q.multi?Math.max(...picks.map(o=>o.s)):picks[0]?.s||0};
 }
 return result;
}
