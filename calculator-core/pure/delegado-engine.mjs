
/* =========================================================================
   ¿NECESITA UN DELEGADO DE PROTECCIÓN DE DATOS? · TempoLegal · Ecuador
   Archivo único autocontenido. Sin dependencias externas.
   ========================================================================= */

const CONFIG = {
  WHATSAPP:"593978887392",
  EMAIL:"info@tempolegal.com",
  RESPONSABLE:"TempoLegal",
  PRIVACIDAD:"../../politica-de-privacidad/",
  LEAD_ENDPOINT:"",  // URL /exec del Apps Script de TempoLegal (ver GUIA). Vacío = el lead NO se guarda.
  PIXEL_ID:"",               // Vacío = no carga y no rompe.
  GTAG_ID:"",
  // Honorarios públicos. Siempre "desde". Vaciar un valor lo oculta de la página.
  P:{ implementacion:390.0, delegadoMes:95.0, auditoria:149.99 },
  // Sanciones verificadas en la web de la SPDP a octubre de 2026. Para mostrar el detalle
  // resolución por resolución hay que llenar numero y url de cada una.
  // Si quiere enlazar las resoluciones, llene detalle con {numero, url}. Vacío no muestra nada y no rompe.
  SANCION:{ total:744472.65, casos:4, entidades:"LigaPro y la Federación Ecuatoriana de Fútbol", verificado:"octubre de 2026",
            fuente:"https://www.spdp.gob.ec/", detalle:[] }
};

/* --------------------------- Referencias normativas --------------------------- */
const N = {
  a10:"Resolución SPDP-SPD-2026-0005-R · Art. 10",
  a14:"Resolución SPDP-SPD-2026-0005-R · Art. 14",
  dpd48:"LOPDP · Art. 48",
  der:"LOPDP · derechos del titular",
  d10:"Resolución SPDP-SPD-2025-0028-R · Art. 10",
  d28:"Resolución SPDP-SPD-2025-0028-R · Reglamento del Delegado de Protección de Datos",
  a49:"LOPDP · Art. 49",
  g12:"LOPDP · Art. 68 núm. 12",
  s_grave:"LOPDP · Art. 72",
  eipd:"LOPDP · Art. 42 · Reglamento General Arts. 29 a 32",
  rat:"Reglamento General LOPDP · Arts. 38 y 39",
  rnpd:"Reglamento General LOPDP · Art. 86",
  nna:"LOPDP · Art. 21",
  salud:"LOPDP · Arts. 30 a 32",
  cred:"LOPDP · Arts. 28 y 29",
  video:"LOPDP · Art. 42 lit. c · Oficio SPDP-IRD-2026-0001-O",
  transf:"LOPDP · Régimen del encargado del tratamiento",
  r90:"Reglamento General LOPDP · Art. 90",
  a64:"LOPDP · Art. 64",
  civ:"Código Civil · Arts. 2214, 2229 y 2232",
  hd:"Constitución Art. 92 · LOGJCC Arts. 49 a 51",
  coip:"COIP · Art. 229, y Arts. 49 y 50"
};

/* --------------------------------- Catálogos --------------------------------- */
const TIPOS = [
  {v:"priv", t:"Empresa privada",
   r:"La multa se calcula sobre lo que usted facturó el año pasado, así que crece con el tamaño de la empresa.", ref:N.s_grave},
  {v:"nat",  t:"Persona natural con RUC",
   r:"La ley no perdona por ser chico. Un consultorio o un estudio de una sola persona tiene obligaciones de fondo parecidas a las de una empresa grande.", ref:N.dpd48},
  {v:"ong",  t:"Fundación, ONG o gremio",
   r:"No cobrar no lo libra de nada. El padrón de socios, de beneficiarios y de donantes es manejo permanente de datos de personas.", ref:N.dpd48}
];

const SEC = [
  {id:"edu", t:"Colegio, escuela, jardín o guardería", d:"Desde inicial hasta bachillerato, de cualquier sostenimiento.", a:"Art. 10.1"},
  {id:"sup", t:"Universidad, politécnica o instituto", d:"Educación superior, pública o privada.", a:"Art. 10.2"},
  {id:"men", t:"Trabajamos con niños o adolescentes", d:"Academia, club, campamento, catequesis, cualquier actividad con menores.", a:"Art. 10.3"},
  {id:"fin", t:"Banco, cooperativa, fintech o casa de empeño", d:"Cualquiera que preste plata o maneje dinero de terceros.", a:"Art. 10.4"},
  {id:"seg", t:"Seguros o medicina prepagada", d:"Aseguradora, bróker, empresa de asistencia.", a:"Art. 10.5"},
  {id:"mkt", t:"Publicidad, marketing, encuestas o call center", d:"Agencia, central de medios, manejo de bases de contactos, estudios de mercado.", a:"Art. 10.6"},
  {id:"sal", t:"Clínica, consultorio, laboratorio o farmacia", d:"Incluye el consultorio de un solo profesional.", a:"Art. 10.7 y 10.8"},
  {id:"sph", t:"Guardianía o administración de edificios y conjuntos", d:"Seguridad privada, monitoreo, administración de propiedad horizontal.", a:"Art. 10.9"},
  {id:"dep", t:"Club o federación deportiva profesional", d:"Con socios, abonados o hinchas registrados.", a:"Art. 10.10"},
  {id:"gre", t:"Cámara, gremio o colegio de profesionales", d:"Con padrón de afiliados.", a:"Art. 10.11"},
  {id:"tel", t:"Telefonía o internet", d:"Operadora, proveedor de internet, servicios de valor agregado.", a:"Art. 10.12"},
  {id:"tec", t:"Vendemos cámaras, GPS o inteligencia artificial", d:"Como servicio, o como el corazón de lo que hacemos.", a:"Art. 10.13"},
  {id:"con", t:"Damos un servicio público por concesión", d:"Agua, luz, basura, transporte, peajes, terminales.", a:"Art. 10.14"}
];

/* Buscador. Términos como los dice la gente en Ecuador. */
const SIN = {
  edu:["colegio","escuela","colegio particular","colegio fiscal","escuela particular","jardin","jardin de infantes","guarderia","unidad educativa","kinder","inicial","bachillerato","fiscomisional","plantel","preescolar","centro infantil"],
  sup:["universidad","politecnica","instituto","tecnologico","educacion superior","facultad","posgrado"],
  men:["academia","club de niños","campamento","catequesis","escuela de futbol","ludoteca","academia de baile","escuela de musica"],
  fin:["banco","cooperativa","cooperativa de ahorro","cooperativa de ahorro y credito","coac","fintech","casa de empeño","prestamista","mutualista","casa de valores","cambista","financiera","tarjeta de credito","credito"],
  seg:["seguros","aseguradora","broker","bróker","medicina prepagada","asistencia medica","agencia asesora productora de seguros","reaseguros"],
  mkt:["publicidad","marketing","agencia de publicidad","call center","contact center","encuestas","investigacion de mercados","telemarketing","base de datos","agencia digital","community manager"],
  sal:["clinica","hospital","consultorio","laboratorio","farmacia","botica","dentista","odontologo","odontologia","psicologa","psicologo","fisioterapia","medico","doctor","centro medico","optica","imagenologia"],
  sph:["guardiania","seguridad privada","monitoreo","administracion de edificios","propiedad horizontal","administrador de conjunto","condominio","conjunto residencial","alarmas"],
  dep:["club deportivo","federacion deportiva","equipo de futbol","liga deportiva","club profesional"],
  gre:["camara","gremio","colegio de profesionales","asociacion","colegio de abogados","colegio de medicos","camara de comercio","sindicato","federacion de gremios"],
  tel:["telefonia","internet","operadora","isp","proveedor de internet","telecomunicaciones","fibra optica","cable"],
  tec:["camaras","gps","inteligencia artificial","videovigilancia","rastreo satelital","reconocimiento facial","software de camaras","cctv"],
  con:["agua potable","energia electrica","recoleccion de basura","transporte publico","peaje","terminal terrestre","concesion","alcantarillado","aeropuerto"]
};

const DIR = [
  {id:"salud", t:"Tenemos papeles de salud de alguien",
   d:"Certificados médicos, reposos del IESS, exámenes preocupacionales, carné de discapacidad, seguro médico, historias clínicas.",
   w:"<b>Art. 14.1.</b> No hace falta ser clínica. Con que tenga un trabajador y un certificado médico en la carpeta, ya cuenta.", ref:N.salud},
  {id:"perfil", t:"Un programa califica o decide sobre personas por nosotros",
   d:"Le pone puntaje a un cliente, aprueba o niega un crédito, filtra hojas de vida, detecta fraude, arma perfiles para vender.",
   w:"<b>Art. 14.2.</b> Si la decisión la toma el sistema y no una persona, ya cuenta.", ref:N.eipd},
  {id:"video", t:"Tenemos cámaras que graban por donde pasa gente",
   d:"A la calle, la vereda, el parqueadero, el local, la recepción, las áreas comunes del edificio o del conjunto.",
   w:"<b>Art. 14.3.</b> Y toca poner el letrero de aviso y definir por cuánto tiempo se guarda la grabación.", ref:N.video},
  {id:"bio", t:"Marcamos con huella o cara, o vemos por dónde anda la gente",
   d:"Reloj de huella para la asistencia, puerta que abre con el rostro, GPS en los carros, app que rastrea al vendedor o al repartidor.",
   w:"<b>Art. 14.4.</b> La norma no pone un mínimo. Un solo reloj de huella en la puerta ya cuenta.", ref:N.a14},
  {id:"credit", t:"Fiamos, damos crédito o cobramos",
   d:"Vendemos a plazo, damos crédito directo, revisamos el buró, calificamos si alguien puede pagar, cobramos cartera vencida.",
   w:"<b>Art. 14.</b> Incluye el crédito del propio negocio, no solamente el de los bancos.", ref:N.cred},
  {id:"nna", t:"Tenemos datos de menores de 18 años",
   d:"Los hijos de sus trabajadores, que declara para utilidades o como cargas familiares. También alumnos, pacientes o socios menores.",
   w:"<b>Art. 14.</b> Casi toda empresa con trabajadores tiene datos de los hijos de su gente. Casi nadie lo tiene presente.", ref:N.nna},
  {id:"transf", t:"Mandamos datos a otra empresa o fuera del país",
   d:"Guardar en la nube (Gmail, Drive, Microsoft 365, AWS), contador o nómina tercerizada, casa matriz, CRM, botón de pago.",
   w:"<b>Art. 14.6.</b> Tener la información en Drive o en un correo de Gmail ya es sacarla del Ecuador.", ref:N.transf},
  {id:"courier", t:"Llevamos paquetes o hacemos entregas a domicilio",
   d:"Courier, mensajería, delivery, última milla.",
   w:"<b>Art. 14.7.</b> La norma los nombra con todas sus letras.", ref:N.a14}
];

const CAM = [
  {id:"ident",t:"Nombre, cédula, correo, teléfono, dirección",n:11},
  {id:"lab",  t:"Sueldo, contrato, asistencia, vacaciones",n:8},
  {id:"acad", t:"Títulos, notas, hoja de vida",n:5},
  {id:"fin",  t:"Cuenta bancaria, tarjeta, facturas, pagos",n:5},
  {id:"cred", t:"Deudas, buró, garantías",n:4},
  {id:"web",  t:"Lo que registra su página web o su app, como ubicación, compras o visitas",n:9},
  {id:"img",  t:"Fotos, video de cámaras, grabación de llamadas",n:3},
  {id:"salud",t:"Certificados médicos, IESS, discapacidad, diagnósticos",n:6,esp:1},
  {id:"bio",  t:"Huella, rostro o voz",n:4,esp:1},
  {id:"sens", t:"Religión, política, etnia, orientación sexual, situación migratoria",n:5,esp:1},
  {id:"jud",  t:"Antecedentes penales o juicios",n:3,pen:1},
  {id:"nna",  t:"Datos de menores, como hijos de trabajadores, alumnos o pacientes",n:4,vuln:1},
  {id:"muchos",t:"Mi sistema guarda más de 100 datos de cada persona",n:0,many:1}
];

const DIM = [
  {id:"tit", q:"¿De cuánta gente tiene datos?",
   h:"Sume clientes, trabajadores, proveedores, pacientes, alumnos, socios y todos los que alguna vez le dejaron su correo.",
   o:[{t:"Hasta 1.000",s:1},{t:"1.001 a 10.000",s:2},{t:"10.001 a 100.000",s:3},{t:"Más de 100.000",s:4}],
   fb:v=>`<b>${v.s} de 4 puntos.</b> La lista de correos y las carpetas de gente que nunca se contrató suelen duplicar la cifra que uno tenía en mente.`},
  {id:"cam", q:"¿Qué datos tiene de esa gente?", multi:true,
   h:"Marque todo lo que tenga guardado en el sistema, en Excel, en carpetas de papel, en el correo o en WhatsApp."},
  {id:"fre", q:"¿Cada cuánto le entran datos nuevos?",
   h:"Piense en lo que pasa de verdad, no en lo que debería pasar.",
   o:[{t:"De vez en cuando",s:.5},{t:"Cada semana o cada mes",s:1},{t:"Todos los días o todo el tiempo",s:2}],
   fb:v=>v.s===2?`<b>2 de 2 puntos.</b> Si en este momento hay un sistema, una web o una cámara recibiendo datos, usted está aquí.`
                :`<b>${p1(v.s)} de 2 puntos.</b> Casi todos creen estar aquí y en realidad están un escalón más arriba.`},
  {id:"per", q:"¿Cuánto tiempo los guarda?",
   h:"Si nunca ha borrado nada a propósito, marque la tercera.",
   o:[{t:"Poco tiempo y los boto",s:.5},{t:"Menos de 3 años",s:1},{t:"3 años o más, o nunca borro",s:2}],
   fb:v=>v.s===2?`<b>2 de 2 puntos.</b> Es la respuesta honesta para casi todos. La información se acumula porque nadie tiene el encargo de borrarla.`
                :`<b>${p1(v.s)} de 2 puntos.</b> Esto solo se sostiene si existe una regla de borrado escrita y alguien la cumple.`},
  {id:"alc", q:"¿A dónde llegan esos datos?",
   h:"Si usa Gmail, Drive, Microsoft 365, WhatsApp, Facebook o un sistema de ventas en la nube, ya salen del país.",
   o:[{t:"Se quedan en mi ciudad",s:1},{t:"Van por todo el Ecuador",s:2},{t:"Salen del país",s:3}],
   fb:v=>v.s===3?`<b>3 de 3 puntos.</b> Y le activa además las reglas para sacar datos del Ecuador.`
                :`<b>${v.s} de 3 puntos.</b> Basta un correo o un respaldo en la nube para subir al máximo.`}
];

const FAC = [
  {v:"a",t:"Hasta USD 100 mil",lo:0,hi:1e5},
  {v:"b",t:"USD 100 mil a 500 mil",lo:1e5,hi:5e5},
  {v:"c",t:"USD 500 mil a 2 millones",lo:5e5,hi:2e6},
  {v:"d",t:"USD 2 a 10 millones",lo:2e6,hi:1e7},
  {v:"e",t:"Más de USD 10 millones",lo:1e7,hi:null},
  {v:"x",t:"Prefiero no decir",lo:null,hi:null}
];

const YA = [
  {v:"si", t:"Sí, nombrado e inscrito en la Superintendencia",
   r:"Es la pieza que casi nadie completa. Al final le mostramos qué le toca para sostenerlo y qué falta confirmar."},
  {v:"med",t:"Nombrado, pero no sé si está inscrito",
   r:"Es el hallazgo que más se repite. El nombramiento interno solo no cierra la obligación. Falta la inscripción, y mientras no esté hecha la autoridad puede considerar que no está cumplida."},
  {v:"no", t:"No tenemos",
   r:"Entonces lo que salga abajo es lo que tiene pendiente."}
];

/* Reglas de cálculo que son lectura comercial y no norma literal (umbral de 6 puntos, valores por opción,
   Gmail como salida del país, certificado médico como dato de salud, hijos de trabajadores como menores).
   Están en DIR, CAM, DIM, puntaje() y evaluar(). Revisables en cualquier momento sin tocar el resto. */

const p1 = n => (Math.round(n*10)/10).toString().replace(".",",");
const usd = n => "USD "+Math.round(n).toLocaleString("es-EC");
const usd2 = n => "USD "+n.toLocaleString("es-EC",{minimumFractionDigits:2,maximumFractionDigits:2});
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();

function puntaje(S){
  const has = (k,id) => S[k] && (S[k].has ? S[k].has(id) : S[k].indexOf(id)>=0);
  const list = k => S[k] ? (S[k].has ? [...S[k]] : S[k]) : [];
  const pT = S.tit ? S.tit.s : 0;
  const cam = list("cam");
  const many = has("cam","muchos");
  const tipos = cam.reduce((a,id)=>a+((CAM.find(c=>c.id===id)||{n:0}).n),0);
  const pV = !cam.length ? 0 : many ? 3 : tipos<=10 ? .5 : tipos<=30 ? 1 : tipos<=100 ? 2 : 3;
  const vL = many ? "Más de 100" : tipos<=10 ? "Hasta 10" : tipos<=30 ? "Entre 11 y 30" : tipos<=100 ? "Entre 31 y 100" : "Más de 100";
  const esp = CAM.filter(c=>c.esp && has("cam",c.id)).length;
  const nna = has("cam","nna"), pen = has("cam","jud");
  let pC=0, cL="Sin marcar";
  if(cam.length){
    if(nna||pen||esp>=2){ pC=3; cL = nna?"Datos de menores":pen?"Datos judiciales":"Más de un dato delicado"; }
    else if(esp===1){ pC=2; cL="Hay un dato delicado, como salud o huella"; }
    else { pC=.5; cL="Solo datos básicos"; }
  }
  const pF = S.fre?S.fre.s:0, pP = S.per?S.per.s:0, pA = S.alc?S.alc.s:0;
  const total = pT+pV+pC+pF+pP+pA;
  const listo = !!(S.tit && cam.length && S.fre && S.per && S.alc);
  return {pT,pV,pC,pF,pP,pA,total,tipos,many,vL,cL,esp,nna,pen,listo};
}

function evaluar(S){
  const P = puntaje(S);
  const hits = DIR.filter(d => S.dir && (S.dir.has?S.dir.has(d.id):S.dir.indexOf(d.id)>=0));
  const secs = SEC.filter(s => S.sec && (S.sec.has?S.sec.has(s.id):S.sec.indexOf(s.id)>=0));
  const publico = false;

  const corresponde = publico || secs.length>0 || hits.length>0 || P.total>=6;

  const cerca = !corresponde && P.total>=4;

  let tier, w, sub, cls;
  if(S.ya==="si"){ tier="ok"; w="Tiene Delegado inscrito. Falta revisar lo demás"; sub=corresponde?"Todo apunta a que le corresponde, y ya tiene la pieza que casi nadie completa. Lo que sigue es sostenerlo y confirmar el resto.":"Tiene la pieza que casi nadie completa. Lo que sigue es sostenerlo y confirmar el resto."; cls="t-ok"; }
  else if(corresponde){ tier="si"; w="Todo apunta a que le corresponde nombrar Delegado"; sub=publico?"Por ser parte del sector público, donde no hay excepción.":hits.length?"Usted hace algo que la norma nombra directamente, así que le toca sin sumar puntos.":secs.length?"Su giro está en la lista de la norma.":"Su manejo de datos pasa el punto desde el que la norma exige Delegado."; cls="t-si"; }
  else { tier="rev"; w="Hay que revisarlo con un abogado"; sub="Con lo que marcó no aparecen las señales típicas, y eso no alcanza para descartarlo."; cls="t-rev"; }

  const vias=[];
  if(publico) vias.push("es parte del sector público, donde no hay excepción");
  if(secs.length) vias.push("su giro está en la lista de la norma ("+secs.map(s=>s.t.toLowerCase()+", "+s.a).join("; ")+")");
  if(hits.length) vias.push("hace algo que la norma nombra directamente, así que le toca sin sumar puntos");
  if(!hits.length && !secs.length && !publico && P.total>=6) vias.push("su manejo de datos suma "+p1(P.total)+" puntos y desde 6 la norma exige Delegado");

  return Object.assign({}, P, {hits,secs,publico,corresponde,cerca,tier,w,sub,cls,vias,
    ya:S.ya||null, listo:P.listo});
}

function multa(S){
  const f = S.fac;
  if(!f || f.lo===null) return {ok:false, v:null, hi:null,
    f:"La multa es entre el 0,7 % y el 1 % de lo que usted facturó el año pasado, sin IVA. Si quiere ver la cifra en dólares, vuelva a esa pregunta.", ref:N.s_grave};
  if(f.hi===null) return {ok:true, v:"desde "+usd(1e7*.007), hi:1e7*.01,
    f:"Con más de diez millones de facturación, el piso de una sola falta grave pasa los setenta mil dólares.", ref:N.s_grave};
  const lo=f.lo*.007, hi=f.hi*.01;
  const v = lo<500 ? "hasta "+usd(hi) : usd(lo)+" a "+usd(hi);
  return {ok:true, v, hi,
    f:"Entre el 0,7 % y el 1 % de lo que facturó el año pasado. El monto exacto depende de si fue a propósito, de si ya había pasado antes y de cuánto daño hubo.", ref:N.s_grave};
}

function inversion(R){
  const P = CONFIG.P;
  if(R.tier==="ok"){
    return {total:P.auditoria, meses:0, txt:"desde "+usd2(P.auditoria), que:"una auditoría de mantenimiento"};
  }
  if(R.tier==="rev"){
    // No se cobran doce meses de un servicio que todavía no sabemos si le aplica.
    return {total:P.auditoria, meses:0, txt:"desde "+usd2(P.auditoria), que:"la auditoría"};
  }
  if(R.ya==="med") return {total:P.implementacion, meses:0, txt:"desde "+usd2(P.implementacion), que:"ordenarlo e inscribir a su Delegado"};
  const total = P.implementacion + P.delegadoMes*12;
  return {total, meses:12, txt:"desde "+usd2(total), que:"ordenarlo y tener Delegado un año"};
}

function comparacion(S,R){
  const M = multa(S), I = inversion(R);
  if(!M.ok || R.tier==="ok") return {ok:false, M, I, mult:null, txt:null};
  const mult = M.hi / I.total;
  // ERROR CONOCIDO N.º 5: si el múltiplo baja de 2, el argumento se dispara en contra. Se cambia el texto.
  const cond = R.tier==="rev" ? "Si al revisarlo resulta que sí le corresponde, una" : "Una";
  const mtxt = mult>50 ? "más de 50" : p1(mult);
  const txt = mult>=2
    ? (R.tier==="rev" ? "Saber si le toca le cuesta una conversación. Si resulta que sí, cada falta grave podría costarle hasta "+mtxt+" veces lo que cuesta la auditoría."
                      : "Una sola falta grave podría costarle hasta "+mtxt+" veces lo que cuesta ordenarlo.")
    : "En su caso lo más caro viene después de la multa. La orden de corregir, la demanda de la persona afectada y el hábeas data no dependen de cuánto factura.";
  return {ok:true, M, I, mult, txt};
}

function obligaciones(S,R){
  const has = (k,id) => S[k] && (S[k].has?S[k].has(id):S[k].indexOf(id)>=0);
  const it=[];
  if(R.tier==="ok"){
    it.push({h:"Mantener el registro de actividades vivo",p:"El inventario de qué datos tiene y dónde están se desactualiza solo. Cada sistema nuevo, cada proveedor nuevo y cada cámara nueva entran ahí.",r:N.rat,c:"done"});
    it.push({h:"Auditar cada cierto tiempo y guardar los informes",p:"La norma pide revisiones periódicas y conservar los informes de cumplimiento al menos cinco años.",r:N.a10,c:"done"});
    it.push({h:"Atender los pedidos de la gente dentro del plazo",p:"Si alguien le pide ver, corregir o borrar sus datos, tiene que contestarle dentro del plazo que fija la ley. Ese es el reclamo que más rápido se convierte en denuncia.",r:N.der,c:"done"});
    it.push({h:"Revisar los contratos con sus proveedores",p:"El contador externo, el sistema de nómina, la nube y el call center manejan datos suyos. Con cada uno necesita un contrato que diga cómo cuida los datos que usted le pasa.",r:N.transf,c:"done"});
    const eipdOk = R.esp>=1||R.nna||R.pen||has("dir","perfil")||has("dir","video");
    if(eipdOk) it.push({h:"Por confirmar: la evaluación de impacto",p:"Con lo que marcó, todo indica que le corresponde tenerla hecha. Si ya la tiene, esta línea no le quita nada. Si no, es la siguiente prioridad.",r:N.eipd,c:"warn"});
    if(has("cam","nna")||has("dir","nna")) it.push({h:"Por confirmar: autorización del representante del menor",p:"Los datos de niños y adolescentes necesitan autorización expresa de quien lo represente.",r:N.nna,c:"warn"});
    if(has("dir","video")) it.push({h:"Por confirmar: el letrero de las cámaras y el plazo de conservación",p:"Aviso visible con quién graba, para qué y a dónde reclamar, y un plazo de conservación escrito.",r:N.video,c:"warn"});
    if(has("dir","transf") || (S.alc && S.alc.s===3)) it.push({h:"Por confirmar: la salida de datos del país",p:"Mandar datos afuera necesita permiso legal propio y garantías escritas con quien los recibe.",r:N.transf,c:"warn"});
    return it;
  }
  if(R.corresponde){
    it.push({h:"Nombrar Delegado e inscribirlo en la Superintendencia",p:"Nombrarlo adentro no cierra nada. La obligación se completa con la inscripción, y no tenerlo es falta grave por sí sola, aunque todo lo demás lo haga bien.",r:N.g12+" · "+N.d28,c:"crit"});
    it.push({h:"Cuidar a quién nombra",p:"El Delegado tiene funciones y responsabilidades propias ante la ley. No es un cargo para poner de relleno ni para sumárselo a alguien que ya tiene otro cargo.",r:N.a49,c:"crit"});
  }
  const eipd = R.corresponde && (R.esp>=1||R.nna||R.pen||has("dir","perfil")||has("dir","video"));
  if(eipd) it.push({h:"Hacer el estudio de riesgos (la evaluación de impacto)",p:"Es un documento que dice qué puede salir mal con esos datos y cómo lo evita. Con lo que marcó, todo indica que en su caso es obligatorio, y no hacerlo es falta grave.",r:N.eipd,c:"crit"});
  else if(R.corresponde) it.push({h:"Revisar si le toca la evaluación de impacto",p:"La ley la exige en tres casos puntuales. Con lo que marcó todavía no se ve claro cuál le toca, y aun así la Superintendencia puede pedírsela si ve riesgo alto.",r:N.eipd,c:"warn"});
  if(!R.corresponde) it.push({h:"Por confirmar con un abogado: si le toca Delegado y evaluación de impacto",p:"Con lo que marcó no aparecen las señales típicas, y eso no alcanza para descartarlas. Es lo primero que se revisa en la conversación.",r:N.dpd48+" · "+N.eipd,c:"warn"});
  it.push({h:"Armar el registro de actividades",p:"Un inventario interno de qué datos tiene, dónde están, quién los toca y por cuánto tiempo. De ese inventario dependen todas las demás tareas, y ahí también queda por escrito cuántos datos maneja.",r:N.rat,c:"warn"});
  it.push({h:"Inscribir sus bases de datos en el registro público",p:"Es el Registro Nacional de la autoridad de datos, y hay que inscribirse dentro del plazo que fija el Reglamento desde que empieza a manejar los datos.",r:N.rnpd,c:"warn"});
  if(R.corresponde) it.push({h:"Decirlo en su política de privacidad",p:"La política tiene que decir expresamente que usted maneja muchos datos, lo que la norma llama gran escala.",r:N.a10,c:"warn"});
  if(has("cam","nna")||has("dir","nna")) it.push({h:"Pedir autorización al representante del menor",p:"Los datos de niños y adolescentes necesitan autorización expresa de quien los represente. Desde los quince años el adolescente puede autorizar por sí mismo, si se le explica con claridad para qué.",r:N.nna,c:"warn"});
  if(has("dir","video")) it.push({h:"Poner el letrero de las cámaras y definir cuántos días guarda las grabaciones",p:"Un letrero visible que diga quién graba, para qué y dónde reclamar. Y por escrito, cuántos días guarda las grabaciones y por qué cada cámara apunta a donde apunta.",r:N.video,c:"warn"});
  if(has("dir","transf") || (S.alc && S.alc.s===3)) it.push({h:"Ordenar la salida de datos del país",p:"Para mandar datos afuera necesita una razón que la ley acepte y un contrato con quien los recibe. Usar la nube o la casa matriz es sacar datos, aunque nunca se lo haya llamado así.",r:N.transf,c:"warn"});
  return it;
}

export const parametrosDelegado=Object.freeze({CONFIG,N,SEC,DIR,CAM,DIM,FAC,YA});
export function calcularDelegado(entradas){
 if(!entradas || typeof entradas!=="object") throw new TypeError("Se requieren respuestas");
 const S={...entradas};
 const R=evaluar(S);
 return {evaluacion:R,multa:multa(S),inversion:inversion(R),comparacion:comparacion(S,R),obligaciones:obligaciones(S,R)};
}
