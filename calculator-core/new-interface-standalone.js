/* TempoLegal calculator standalone bundle. Supports file:// and local HTTP. Engines unchanged. */
"use strict";
const __multas = (()=>{
/** Multas V22 · deterministic engine extracted from the legacy implementation.
 * No DOM, window, requests, storage or visual rendering.
 * Financial estimates and normative classifications are MODEL ASSUMPTIONS pending legal review.
 */
const RATES={leve:[0.001,0.007], grave:[0.007,0.010]};

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

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

const C=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c8)'];

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

const MTGE_MAX=Object.values(MTGE).reduce((t,k)=>t+Math.max(...k.o.map(o=>o.p)),0);

function titularesBucket(S){
  const t=totalPersonas(S); if(!t) return null;
  return t<=1000?'a':t<=10000?'b':t<=100000?'c':'d';
}

function mtgeScore(s, modo){
  const d=SEC(s.sector).mt, full={...d, titulares:s.titulares, categorias:s.categorias};
  let total=0; const rows=[];
  Object.entries(MTGE).forEach(([k,def],idx)=>{
    const sel=def.o.find(o=>o.v===full[k])||def.o[0]; total+=sel.p;
    rows.push({k,v:sel.v,n:def.n,l:sel.l,p:sel.p,max:Math.max(...def.o.map(o=>o.p)),c:C[idx],inferido: modo==='rapido' ? true : !(k==='titulares'||k==='categorias')});
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

function compute(s, modo){
  const mt=mtgeScore(s, modo), duties=applicable(s,mt), done=new Set(s.cumple||[]);
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

const parametrosMultas = Object.freeze({RATES,SECTORES:PERFIL_SECTOR,TRAB,CLI,DUTIES,MTGE,SERVICIOS});
function calcularMultas(entradas,{modo="rapido"}={}) {
 if(!entradas || typeof entradas!=="object") throw new TypeError("Se requieren entradas estructuradas");
 if(!Number.isFinite(entradas.vdn) || entradas.vdn<0) throw new RangeError("vdn debe ser una cifra anual no negativa");
 return compute({...entradas, cumple:[...(entradas.cumple||[])]}, modo === "detalle" ? "detalle" : "rapido");
}

return {calcularMultas,parametrosMultas};
})();
const __delegado = (()=>{

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

const parametrosDelegado=Object.freeze({CONFIG,N,SEC,DIR,CAM,DIM,FAC,YA});
function calcularDelegado(entradas){
 if(!entradas || typeof entradas!=="object") throw new TypeError("Se requieren respuestas");
 const S={...entradas};
 const R=evaluar(S);
 return {evaluacion:R,multa:multa(S),inversion:inversion(R),comparacion:comparacion(S,R),obligaciones:obligaciones(S,R)};
}

return {calcularDelegado,parametrosDelegado};
})();
const __diagnostico = (()=>{
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
const parametrosDiagnostico=Object.freeze({CONFIG,N,QUESTIONS:QUESTIONS.map(q=>({id:q.id,text:q.text,multi:!!q.multi,options:q.opts?.map(o=>({text:o.t,score:o.s,tag:o.tag,gap:o.gap}))||[]})),GAPS,CATALOGO});
function calcularDiagnostico(entradas){
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
function respuestasDiagnosticoDesdeIndices(seleccion){
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

return {calcularDiagnostico,parametrosDiagnostico,respuestasDiagnosticoDesdeIndices};
})();
const {calcularMultas,parametrosMultas}=__multas;
const {calcularDelegado,parametrosDelegado}=__delegado;
const {calcularDiagnostico,parametrosDiagnostico,respuestasDiagnosticoDesdeIndices}=__diagnostico;
try {



const mount=document.getElementById('tl-calculator-app');
if(!mount)throw new Error('Missing calculator mount');
const tool=document.querySelector('main[data-calculator]')?.dataset.calculator || 'multas';
const lang=document.documentElement.lang?.slice(0,2)||'es';
const locale=({es:'es-EC',en:'en-US',pt:'pt-BR',fr:'fr-FR'})[lang]||'es-EC';
const trans={
 es:{badge:'HERRAMIENTAS LOPDP',titles:{multas:'Conozca su exposición a multas.',delegado:'¿Necesita designar un Delegado?',diagnostico:'Diagnostique sus principales riesgos.'},sub:{multas:'Una estimación referencial basada en las respuestas de su organización.',delegado:'Identifique criterios de designación y obligaciones relacionadas.',diagnostico:'Explore su situación con preguntas claras y un informe al finalizar.'},progress:'Progreso de la evaluación',next:'Continuar',previous:'Anterior',calculate:'Ver resultado',restart:'Iniciar nuevamente',select:'Seleccione una opción',selected:'Seleccionado',selectMany:'Puede elegir varias opciones',required:'Complete esta etapa para continuar.',result:'Resultado de la evaluación',notice:'Orientación referencial: no constituye una resolución de la autoridad ni asesoría legal.',done:'Completado',steps:{multas:['Su organización','Tratamiento de datos','Cumplimiento'],delegado:['Sectores y actividades','Tratamiento de datos','Situación actual'],diagnostico:['Diagnóstico guiado']},fields:{sector:'Actividad principal',persona:'Tipo de organización',trab:'Cantidad de trabajadores',cli:'Clientes o personas atendidas',vdn:'Facturación anual sin IVA (USD)',titulares:'Número aproximado de titulares',categorias:'Categorías de datos',incidente:'¿Ha tenido algún incidente?',spdp:'¿Ha tenido contacto con la autoridad?',cumple:'¿Cuáles de estas obligaciones ya cumple?',sec:'Sectores de actividad',dir:'Tratamientos realizados',cam:'Tipos de datos que utiliza',fac:'Facturación aproximada',ya:'¿Tiene Delegado registrado?'},stat:['Cumplimiento','Pendientes','Estimación central'],currency:'USD',pending:'Obligaciones pendientes',recommend:'Acciones recomendadas',risk:'Nivel de riesgo',score:'Puntaje',range:'Rango estimado',incomplete:'Responda las preguntas para obtener un resultado.',none:'Ninguno de los anteriores',back:'Volver al inicio'},
 en:{badge:'LOPDP TOOLS',titles:{multas:'Understand your potential fine exposure.',delegado:'Do you need a Data Protection Officer?',diagnostico:'Assess your key privacy risks.'},sub:{multas:'An indicative estimate based on your organization’s answers.',delegado:'Explore appointment criteria and related duties.',diagnostico:'Answer clear questions and receive a structured assessment.'},progress:'Assessment progress',next:'Continue',previous:'Back',calculate:'View results',restart:'Start again',select:'Choose an option',selected:'Selected',selectMany:'You may choose multiple options',required:'Complete this step to continue.',result:'Assessment results',notice:'Indicative guidance only, not a regulatory decision or legal advice.',done:'Completed',steps:{multas:['Your organization','Data processing','Compliance'],delegado:['Sectors and activities','Data processing','Current situation'],diagnostico:['Guided assessment']},fields:{sector:'Main business activity',persona:'Organization type',trab:'Number of workers',cli:'Clients or people served',vdn:'Annual turnover excluding VAT (USD)',titulares:'Approximate number of people',categorias:'Categories of data',incidente:'Have you experienced an incident?',spdp:'Have you been contacted by the authority?',cumple:'Which obligations do you already meet?',sec:'Activity sectors',dir:'Processing activities',cam:'Types of personal data',fac:'Approximate revenue',ya:'Do you have a registered DPO?'},stat:['Compliance','Outstanding','Central estimate'],currency:'USD',pending:'Outstanding obligations',recommend:'Recommended actions',risk:'Risk level',score:'Score',range:'Estimated range',incomplete:'Complete the questions to receive a result.',none:'None of the above',back:'Back to start'},
 pt:{badge:'FERRAMENTAS LOPDP',titles:{multas:'Conheça sua exposição a multas.',delegado:'Precisa nomear um Encarregado?',diagnostico:'Avalie os principais riscos de privacidade.'},sub:{multas:'Estimativa indicativa baseada nas respostas da organização.',delegado:'Identifique critérios de nomeação e obrigações.',diagnostico:'Responda às perguntas e receba uma avaliação estruturada.'},progress:'Progresso da avaliação',next:'Continuar',previous:'Voltar',calculate:'Ver resultados',restart:'Recomeçar',select:'Selecione uma opção',selected:'Selecionado',selectMany:'Pode selecionar várias opções',required:'Complete esta etapa para continuar.',result:'Resultado da avaliação',notice:'Orientação indicativa, não é decisão oficial nem consultoria jurídica.',done:'Concluído',steps:{multas:['Sua organização','Tratamento de dados','Conformidade'],delegado:['Setores e atividades','Tratamento de dados','Situação atual'],diagnostico:['Avaliação guiada']},fields:{sector:'Atividade principal',persona:'Tipo de organização',trab:'Número de trabalhadores',cli:'Clientes ou pessoas atendidas',vdn:'Faturamento anual sem IVA (USD)',titulares:'Número aproximado de titulares',categorias:'Categorias de dados',incidente:'Houve algum incidente?',spdp:'Já teve contato com a autoridade?',cumple:'Quais obrigações já cumpre?',sec:'Setores de atividade',dir:'Tratamentos realizados',cam:'Tipos de dados',fac:'Faturamento aproximado',ya:'Possui Encarregado registrado?'},stat:['Conformidade','Pendências','Estimativa central'],currency:'USD',pending:'Obrigações pendentes',recommend:'Ações recomendadas',risk:'Nível de risco',score:'Pontuação',range:'Intervalo estimado',incomplete:'Responda às perguntas para obter um resultado.',none:'Nenhum dos anteriores',back:'Voltar ao início'},
 fr:{badge:'OUTILS LOPDP',titles:{multas:'Évaluez votre exposition aux amendes.',delegado:'Devez-vous désigner un Délégué ?',diagnostico:'Évaluez vos principaux risques.'},sub:{multas:'Une estimation indicative fondée sur les réponses de votre organisation.',delegado:'Examinez les critères de désignation et les obligations associées.',diagnostico:'Répondez aux questions et obtenez un bilan structuré.'},progress:'Progression de l’évaluation',next:'Continuer',previous:'Précédent',calculate:'Voir les résultats',restart:'Recommencer',select:'Choisissez une option',selected:'Sélectionné',selectMany:'Plusieurs choix sont possibles',required:'Terminez cette étape pour continuer.',result:'Résultat de l’évaluation',notice:'Informations indicatives uniquement, ni décision officielle ni conseil juridique.',done:'Terminé',steps:{multas:['Votre organisation','Traitement des données','Conformité'],delegado:['Secteurs et activités','Traitement des données','Situation actuelle'],diagnostico:['Évaluation guidée']},fields:{sector:'Activité principale',persona:'Type d’organisation',trab:'Nombre d’employés',cli:'Clients ou personnes concernées',vdn:'Chiffre d’affaires annuel hors TVA (USD)',titulares:'Nombre approximatif de personnes',categorias:'Catégories de données',incidente:'Avez-vous subi un incident ?',spdp:'Avez-vous été contacté par l’autorité ?',cumple:'Quelles obligations respectez-vous déjà ?',sec:'Secteurs d’activité',dir:'Traitements réalisés',cam:'Types de données',fac:'Chiffre d’affaires approximatif',ya:'Avez-vous un DPO enregistré ?'},stat:['Conformité','En attente','Estimation centrale'],currency:'USD',pending:'Obligations en attente',recommend:'Actions recommandées',risk:'Niveau de risque',score:'Score',range:'Fourchette estimée',incomplete:'Complétez les questions pour obtenir un résultat.',none:'Aucun des précédents',back:'Retour au début'}
};
const t=trans[lang]||trans.es;
const fmt=n=>new Intl.NumberFormat(locale,{maximumFractionDigits:0}).format(Number(n)||0);
const money=n=>'USD '+fmt(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={stage:0,answers:{},finished:false,feedback:''};
const tlLocaleCatalog = {"en":{"Salud":"Healthcare","Educación":"Education","Financiero y seguros":"Finance and insurance","Comercio o venta en línea":"Retail and e-commerce","Tecnología y telecom":"Technology and telecommunications","Servicios profesionales":"Professional services","Seguridad y videovigilancia":"Security and video surveillance","Hotelería, turismo y comida":"Hospitality, tourism and food","Transporte y logística":"Transport and logistics","Inmobiliario y construcción":"Real estate and construction","Recursos humanos y selección":"Human resources and recruitment","Club, federación o gremio":"Club, federation or professional association","Publicidad y perfilamiento":"Advertising and profiling","Otro tipo de negocio":"Other business activity","Solo yo":"Just me","De 2 a 5":"2 to 5","De 6 a 20":"6 to 20","De 21 a 100":"21 to 100","Más de 100":"More than 100","Menos de 50":"Fewer than 50","Entre 50 y 300":"50 to 300","Entre 300 y 1.000":"300 to 1,000","Entre 1.000 y 10.000":"1,000 to 10,000","Entre 10.000 y 100.000":"10,000 to 100,000","Más de 100.000":"More than 100,000","Nombró por escrito a un Delegado de Protección de Datos":"Appointed a Data Protection Officer (DPO) in writing","Inscribió a ese delegado ante la Superintendencia":"Registered the DPO with the supervisory authority","Ese delegado tiene el título y los años que pide la ley":"The DPO meets the legal qualifications and experience","Ese delegado no es el dueño, ni el de sistemas, ni un familiar":"The DPO is independent, not the owner, IT manager or a relative","Los datos están con clave, bajo llave y con reglas por escrito":"Data is protected by passwords, physical controls and written rules","Tiene por escrito qué datos guarda, de quién y para qué":"Keeps a written record of which data is held, whose it is and why","Sus clientes aceptaron por escrito, sabiendo para qué":"Clients have given informed, documented consent","Tiene escrito qué hacer, y a quién avisar, si se le filtran datos":"Has a documented plan for data breaches and notifications","Midió por escrito el riesgo antes de usar datos delicados":"Completed a documented impact assessment for sensitive processing","Tiene escrito qué puede salir mal y cómo lo evita":"Has a documented risk assessment and mitigation measures","Firmó un anexo de datos con su contador, su sistema y sus proveedores":"Signed data processing agreements with accountants, IT and suppliers","Sabe quién responde, y en cuántos días, si un cliente pide ver o borrar sus datos":"Has a procedure and deadlines for access or deletion requests","Pide solo los datos que de verdad necesita":"Collects only the data that is genuinely necessary","Tiene publicado un aviso de privacidad al día":"Maintains an up-to-date published privacy notice","Revisó que quien maneja sus datos por fuera sepa protegerlos":"Checks that external processors adequately protect data","Hasta 1.000":"Up to 1,000","1.001 a 10.000":"1,001 to 10,000","10.001 a 100.000":"10,001 to 100,000","Solo datos básicos":"Basic data only","Una categoría especial":"One special category","Varias especiales o grupos vulnerables":"Several special categories or vulnerable groups","Colegio, escuela, jardín o guardería":"School, preschool or childcare centre","Universidad, politécnica o instituto":"University, polytechnic or institute","Trabajamos con niños o adolescentes":"We work with children or teenagers","Banco, cooperativa, fintech o casa de empeño":"Bank, credit union, fintech or pawnshop","Seguros o medicina prepagada":"Insurance or prepaid medical services","Publicidad, marketing, encuestas o call center":"Advertising, marketing, surveys or call centre","Clínica, consultorio, laboratorio o farmacia":"Clinic, medical practice, laboratory or pharmacy","Guardianía o administración de edificios y conjuntos":"Security or building and condominium management","Club o federación deportiva profesional":"Professional sports club or federation","Cámara, gremio o colegio de profesionales":"Chamber, trade association or professional body","Telefonía o internet":"Telephony or internet services","Vendemos cámaras, GPS o inteligencia artificial":"We sell cameras, GPS or artificial intelligence","Damos un servicio público por concesión":"We operate a public service under a concession","Tenemos papeles de salud de alguien":"We hold someone’s health records","Un programa califica o decide sobre personas por nosotros":"Software profiles, scores or makes decisions about people","Tenemos cámaras que graban por donde pasa gente":"We use cameras in areas where people pass","Marcamos con huella o cara, o vemos por dónde anda la gente":"We use fingerprints, facial recognition or location tracking","Fiamos, damos crédito o cobramos":"We grant credit, lend or collect debts","Tenemos datos de menores de 18 años":"We process data about children under 18","Mandamos datos a otra empresa o fuera del país":"We send personal data to another company or abroad","Llevamos paquetes o hacemos entregas a domicilio":"We deliver parcels or provide home delivery","Nombre, cédula, correo, teléfono, dirección":"Name, national ID, email, phone and address","Sueldo, contrato, asistencia, vacaciones":"Salary, contract, attendance and leave","Títulos, notas, hoja de vida":"Degrees, grades and résumés","Cuenta bancaria, tarjeta, facturas, pagos":"Bank accounts, cards, invoices and payments","Deudas, buró, garantías":"Debts, credit bureau and collateral","Lo que registra su página web o su app, como ubicación, compras o visitas":"Website or app activity, such as location, purchases or visits","Fotos, video de cámaras, grabación de llamadas":"Photos, CCTV footage or call recordings","Certificados médicos, IESS, discapacidad, diagnósticos":"Medical certificates, social security, disability or diagnoses","Huella, rostro o voz":"Fingerprints, face or voice","Religión, política, etnia, orientación sexual, situación migratoria":"Religion, politics, ethnicity, sexuality or immigration status","Antecedentes penales o juicios":"Criminal records or court proceedings","Datos de menores, como hijos de trabajadores, alumnos o pacientes":"Information about minors, including employees’ children or students","Mi sistema guarda más de 100 datos de cada persona":"Our system holds more than 100 data fields per person","Hasta USD 100 mil":"Up to USD 100,000","USD 100 mil a 500 mil":"USD 100,000 to 500,000","USD 500 mil a 2 millones":"USD 500,000 to 2 million","USD 2 a 10 millones":"USD 2 to 10 million","Más de USD 10 millones":"More than USD 10 million","Prefiero no decir":"Prefer not to say","Sí, nombrado e inscrito en la Superintendencia":"Yes, appointed and registered with the authority","Nombrado, pero no sé si está inscrito":"Appointed, but I am unsure about registration","No tenemos":"We do not have one","¿De cuánta gente tiene datos?":"How many people’s data do you hold?","¿Qué datos tiene de esa gente?":"What types of personal data do you hold?","¿Cada cuánto le entran datos nuevos?":"How often do you receive new personal data?","De vez en cuando":"Occasionally","Cada semana o cada mes":"Every week or month","Todos los días o todo el tiempo":"Daily or continuously","¿Cuánto tiempo los guarda?":"How long do you retain it?","Poco tiempo y los boto":"Briefly, then deleted","Menos de 3 años":"Less than 3 years","3 años o más, o nunca borro":"3 years or more, or never deleted","¿A dónde llegan esos datos?":"Where does the data go?","Se quedan en mi ciudad":"Within my city","Van por todo el Ecuador":"Throughout Ecuador","Salen del país":"Outside Ecuador","¿Qué tamaño tiene su organización?":"How large is your organization?","Trabajo solo o con un asistente":"I work alone or with one assistant","Entre 2 y 15 personas":"2 to 15 people","Entre 16 y 80 personas":"16 to 80 people","Más de 80 personas, o una institución":"Over 80 people or an institution","¿Cuánto factura al año su organización?":"What is your organization’s annual turnover?","Menos de USD 100.000 al año":"Under USD 100,000 a year","Entre USD 100.000 y 500.000":"USD 100,000 to 500,000","Entre USD 500.000 y 2 millones":"USD 500,000 to 2 million","Entre USD 2 y 10 millones":"USD 2 to 10 million","Prefiero no indicarlo":"Prefer not to disclose","¿Su organización guarda alguno de estos documentos?":"Does your organization retain any of these records?","Certificados médicos, exámenes de ingreso o reposos del IESS del personal":"Employees’ medical certificates, entry examinations or medical leave","Cédulas o datos de hijos y cargas familiares de los trabajadores":"National IDs or details of employees’ children and dependants","Carné o información de discapacidad":"Disability identification or information","Historias clínicas, fichas de pacientes o expedientes de alumnos":"Patient medical records or student files","Información financiera o consultas de crédito de clientes":"Clients’ financial information or credit checks","Ninguno de estos":"None of these","¿Usa alguno de estos sistemas?":"Do you use any of these systems?","Cámaras de seguridad, solo video":"Security cameras recording video only","Cámaras que también graban audio":"Cameras that also record audio","Marcación de asistencia con huella o reconocimiento facial":"Fingerprint or facial recognition attendance systems","GPS o rastreo de vehículos, o localización del personal":"Vehicle GPS tracking or employee location tracking","¿Ya tiene un Delegado de Protección de Datos?":"Do you already have a Data Protection Officer?","Sí, designado y registrado ante la Superintendencia":"Yes, appointed and registered with the authority","Lo nombramos, pero no está registrado":"Appointed but not registered","No sé si nos corresponde":"I am not sure whether one is required","Sus contratos con trabajadores, contador externo y proveedores, ¿incluyen cláusulas de protección de datos?":"Do your employee, external accountant and supplier contracts include data protection clauses?","Sí, los revisamos y todos las tienen":"Yes, we reviewed them and all include clauses","Algunos sí, otros no":"Some do, others do not","No, son los contratos de siempre":"No, they are standard contracts","No lo sé":"I do not know","¿Cuál de estas situaciones ocurre en su organización?":"Which of these situations applies to your organization?","Si alguien que nos dejó sus datos pide que los borremos, no sabríamos cómo hacerlo":"If someone asks us to erase their data, we would not know how","Usamos ChatGPT u otra inteligencia artificial para redactar, resumir o atender clientes":"We use ChatGPT or other AI to draft, summarize or assist clients","Guardamos contactos y listas de interesados sin un plazo para borrarlos":"We keep contact lists without a defined deletion deadline","Ninguna de estas":"None of these","Empresa / organización":"Company / organization","Persona natural":"Individual","Sí":"Yes","No":"No","No estoy seguro":"I am not sure","Ninguno":"None","Requerimiento de información":"Information request from the authority","Medidas correctivas":"Corrective measures","Sanción previa":"Previous sanction","Todo apunta a que le corresponde nombrar Delegado":"A Data Protection Officer appears to be required","No aparecen señales de obligatoriedad directa":"No direct mandatory appointment criteria identified","Crítico":"Critical","Expuesto":"Exposed","Vulnerable":"Vulnerable","Perfectible":"Needs improvement","Sin hallazgos":"No findings","Riesgo muy alto":"Very high risk","Riesgo alto":"High risk","Riesgo medio-alto":"Medium-high risk","Riesgo moderado":"Moderate risk","Riesgo controlado":"Controlled risk","grave":"Serious","leve":"Minor","Mantener el registro de actividades vivo":"Keep the processing activities register current","Auditar cada cierto tiempo y guardar los informes":"Conduct periodic audits and retain evidence","Atender los pedidos de la gente dentro del plazo":"Respond to data subject requests on time","Revisar los contratos con sus proveedores":"Review contracts with service providers","Por confirmar: la evaluación de impacto":"Confirm whether a data protection impact assessment is needed","Por confirmar: autorización del representante del menor":"Confirm consent for processing minors’ information","Por confirmar: el letrero de las cámaras y el plazo de conservación":"Confirm CCTV notices and retention periods","Por confirmar: la salida de datos del país":"Confirm safeguards for international data transfers","Nombrar Delegado e inscribirlo en la Superintendencia":"Appoint and register a Data Protection Officer","Cuidar a quién nombra":"Choose an independent, qualified DPO","Hacer el estudio de riesgos (la evaluación de impacto)":"Conduct a data protection impact assessment","Revisar si le toca la evaluación de impacto":"Check whether an impact assessment is mandatory","Por confirmar con un abogado: si le toca Delegado y evaluación de impacto":"Confirm DPO and impact assessment obligations","Armar el registro de actividades":"Prepare a record of processing activities","Inscribir sus bases de datos en el registro público":"Register the relevant databases","Decirlo en su política de privacidad":"Describe large-scale processing in the privacy notice","Pedir autorización al representante del menor":"Obtain authorization for minors’ data","Poner el letrero de las cámaras y definir cuántos días guarda las grabaciones":"Install CCTV notices and define retention periods","Ordenar la salida de datos del país":"Document international data transfers","Designe por escrito a un Delegado de Protección de Datos e inscríbalo ante la Superintendencia.":"Appoint a Data Protection Officer in writing and register the appointment with the authority.","Inscriba a su Delegado de Protección de Datos en el sistema de la Superintendencia. Designarlo por dentro no basta.":"Register your DPO with the Ecuadorian data authority; appointment alone is insufficient.","Verifique que tenga título universitario en Derecho, Sistemas, Comunicación o Tecnología y cinco años de experiencia.":"Verify the DPO’s required university degree and professional experience.","Esa persona no puede ser el representante legal, el jefe de sistemas, un socio ni un familiar de los dueños.":"Ensure the DPO is independent of management, IT, ownership and close family relationships.","Ponga clave a las computadoras y a los archivos con datos, guarde los papeles bajo llave y deje por escrito quién puede ver qué.":"Protect electronic records with passwords, secure physical files and document access rights.","Haga una lista escrita de qué datos guarda, de quién, para qué y por cuánto tiempo.":"Document what data you keep, from whom, why and for how long.","Cambie el papel o la casilla con que sus clientes aceptan: debe decir para qué usa sus datos y quedar guardado.":"Update consent forms to explain processing purposes and retain consent evidence.","Escriba un procedimiento de una página: si se filtran datos, quién avisa, a quién y en cinco días.":"Document a breach response procedure, notification responsibilities and legal deadlines.","Haga una evaluación de impacto antes de seguir tratando datos sensibles.":"Carry out a data protection impact assessment before sensitive processing.","Escriba qué puede salir mal con los datos que guarda y qué hace usted para evitarlo.":"Record potential data risks and preventive measures.","Firme un anexo de protección de datos con su contador, su sistema y quien más maneje sus datos.":"Sign data processing agreements with every supplier that handles personal data.","Defina quién responde cuando un cliente pida ver, corregir o borrar sus datos, y en cuántos días.":"Assign responsibility and deadlines for access, correction and deletion requests.","Antes de pedir un dato nuevo, pregúntese si de verdad lo necesita. Pida lo mínimo.":"Collect only information needed for the stated purpose.","Publique un aviso de privacidad donde sus clientes puedan verlo.":"Publish a clear, up-to-date privacy notice.","Revise que las empresas a las que les pasa datos tengan con qué protegerlos.":"Review external processors’ safeguards and contractual commitments.","El inventario de qué datos tiene y dónde están se desactualiza solo. Cada sistema nuevo, cada proveedor nuevo y cada cámara nueva entran ahí.":"Update your inventory whenever systems, providers or cameras change.","La norma pide revisiones periódicas y conservar los informes de cumplimiento al menos cinco años.":"Review compliance regularly and retain audit reports for the legally required period.","Si alguien le pide ver, corregir o borrar sus datos, tiene que contestarle dentro del plazo que fija la ley. Ese es el reclamo que más rápido se convierte en denuncia.":"Designate a channel and meet the applicable legal deadlines for access, correction and deletion.","El contador externo, el sistema de nómina, la nube y el call center manejan datos suyos. Con cada uno necesita un contrato que diga cómo cuida los datos que usted le pasa.":"Ensure external accountants, cloud providers and service providers have written processing terms.","Con lo que marcó, todo indica que le corresponde tenerla hecha. Si ya la tiene, esta línea no le quita nada. Si no, es la siguiente prioridad.":"Check the specific processing activities that require a documented assessment.","Los datos de niños y adolescentes necesitan autorización expresa de quien lo represente.":"Check the legal representative’s authorization requirements.","Aviso visible con quién graba, para qué y a dónde reclamar, y un plazo de conservación escrito.":"Display the required notices and document how long recordings are kept.","Mandar datos afuera necesita permiso legal propio y garantías escritas con quien los recibe.":"Review the legal basis and written safeguards for data sent abroad.","Nombrarlo adentro no cierra nada. La obligación se completa con la inscripción, y no tenerlo es falta grave por sí sola, aunque todo lo demás lo haga bien.":"Complete the formal appointment and registration with the competent authority.","El Delegado tiene funciones y responsabilidades propias ante la ley. No es un cargo para poner de relleno ni para sumárselo a alguien que ya tiene otro cargo.":"Verify qualifications, independence and potential conflicts of interest.","Es un documento que dice qué puede salir mal con esos datos y cómo lo evita. Con lo que marcó, todo indica que en su caso es obligatorio, y no hacerlo es falta grave.":"Document risks, impacts and mitigations for processing that requires an assessment.","La ley la exige en tres casos puntuales. Con lo que marcó todavía no se ve claro cuál le toca, y aun así la Superintendencia puede pedírsela si ve riesgo alto.":"Review the specific circumstances with qualified legal counsel.","Con lo que marcó no aparecen las señales típicas, y eso no alcanza para descartarlas. Es lo primero que se revisa en la conversación.":"The answers are not conclusive; obtain a targeted legal assessment.","Un inventario interno de qué datos tiene, dónde están, quién los toca y por cuánto tiempo. De ese inventario dependen todas las demás tareas, y ahí también queda por escrito cuántos datos maneja.":"Inventory data, locations, access permissions and retention periods.","Es el Registro Nacional de la autoridad de datos, y hay que inscribirse dentro del plazo que fija el Reglamento desde que empieza a manejar los datos.":"Check the national registration requirements and applicable deadlines.","La política tiene que decir expresamente que usted maneja muchos datos, lo que la norma llama gran escala.":"Explain the scope and purposes of the processing clearly.","Los datos de niños y adolescentes necesitan autorización expresa de quien los represente. Desde los quince años el adolescente puede autorizar por sí mismo, si se le explica con claridad para qué.":"Verify parental or legal representative consent where required.","Un letrero visible que diga quién graba, para qué y dónde reclamar. Y por escrito, cuántos días guarda las grabaciones y por qué cada cámara apunta a donde apunta.":"Explain who records, why, contact details and retention periods.","Para mandar datos afuera necesita una razón que la ley acepte y un contrato con quien los recibe. Usar la nube o la casa matriz es sacar datos, aunque nunca se lo haya llamado así.":"Confirm the legal basis and agreements for overseas recipients.","Delegado de Protección de Datos designado":"Data Protection Officer appointed","Delegado registrado ante la Superintendencia":"DPO registered with the supervisory authority","Evaluación de impacto realizada":"Impact assessment carried out","Medidas de seguridad técnicas, organizativas y jurídicas":"Technical, organizational and legal safeguards","Usar los datos solo para los fines declarados":"Use data only for stated purposes","Metodología de análisis y gestión de riesgos":"Risk assessment and management procedure","Contratos con cláusulas LOPDP con sus proveedores":"Supplier contracts with data protection clauses","Registro de actividades de tratamiento":"Record of processing activities","Protocolo de notificación de brechas":"Breach notification procedure","Protección de datos desde el diseño y por defecto":"Privacy by design and by default","Proveedores elegidos con garantías suficientes":"Suppliers with adequate safeguards","Datos sensibles sin las protecciones que exige la ley":"Sensitive data require enhanced protection","Cámaras, biometría o rastreo sin marco documentado":"Cameras, biometrics and tracking need documented controls","Terceros con acceso a sus archivos sin contrato que lo regule":"Third-party data processing needs written agreements","Sin procedimiento para atender pedidos de las personas":"Procedures for data subject requests are missing","Delegado de Protección de Datos sin designar o sin inscribir":"Data Protection Officer appointment or registration is missing","Uso de inteligencia artificial sin política ni razón declarada":"Artificial intelligence requires a data protection policy","Sume clientes, trabajadores, proveedores, pacientes, alumnos, socios y todos los que alguna vez le dejaron su correo.":"Include clients, staff, suppliers, patients, students, members and everyone who has ever left their email address.","Marque todo lo que tenga guardado en el sistema, en Excel, en carpetas de papel, en el correo o en WhatsApp.":"Select everything stored in your systems, spreadsheets, paper files, email or WhatsApp.","Piense en lo que pasa de verdad, no en lo que debería pasar.":"Consider what actually happens, rather than what ought to happen.","Si nunca ha borrado nada a propósito, marque la tercera.":"If you have never deliberately deleted data, choose the third option.","Si usa Gmail, Drive, Microsoft 365, WhatsApp, Facebook o un sistema de ventas en la nube, ya salen del país.":"If you use Gmail, Drive, Microsoft 365, WhatsApp, Facebook or a cloud sales system, data may already leave the country."},"pt":{"Salud":"Saúde","Educación":"Educação","Financiero y seguros":"Finanças e seguros","Comercio o venta en línea":"Comércio e vendas on-line","Tecnología y telecom":"Tecnologia e telecomunicações","Servicios profesionales":"Serviços profissionais","Seguridad y videovigilancia":"Segurança e videovigilância","Hotelería, turismo y comida":"Hotelaria, turismo e alimentação","Transporte y logística":"Transportes e logística","Inmobiliario y construcción":"Imobiliário e construção","Recursos humanos y selección":"Recursos humanos e recrutamento","Club, federación o gremio":"Clube, federação ou associação profissional","Publicidad y perfilamiento":"Publicidade e criação de perfis","Otro tipo de negocio":"Outra atividade empresarial","Solo yo":"Somente eu","De 2 a 5":"De 2 a 5","De 6 a 20":"De 6 a 20","De 21 a 100":"De 21 a 100","Más de 100":"Mais de 100","Menos de 50":"Menos de 50","Entre 50 y 300":"De 50 a 300","Entre 300 y 1.000":"De 300 a 1.000","Entre 1.000 y 10.000":"De 1.000 a 10.000","Entre 10.000 y 100.000":"De 10.000 a 100.000","Más de 100.000":"Mais de 100.000","Nombró por escrito a un Delegado de Protección de Datos":"Nomeou formalmente um Encarregado de Proteção de Dados","Inscribió a ese delegado ante la Superintendencia":"Registrou o Encarregado na autoridade supervisora","Ese delegado tiene el título y los años que pide la ley":"O Encarregado possui a formação e experiência exigidas","Ese delegado no es el dueño, ni el de sistemas, ni un familiar":"O Encarregado é independente, não é o proprietário, gestor de TI ou familiar","Los datos están con clave, bajo llave y con reglas por escrito":"Protege os dados com senhas, controles físicos e regras documentadas","Tiene por escrito qué datos guarda, de quién y para qué":"Mantém registro escrito dos dados, titulares e finalidades","Sus clientes aceptaron por escrito, sabiendo para qué":"Clientes deram consentimento informado e documentado","Tiene escrito qué hacer, y a quién avisar, si se le filtran datos":"Possui plano documentado de incidentes e notificações","Midió por escrito el riesgo antes de usar datos delicados":"Realizou avaliação de impacto para tratamentos sensíveis","Tiene escrito qué puede salir mal y cómo lo evita":"Mantém avaliação documentada de riscos e medidas preventivas","Firmó un anexo de datos con su contador, su sistema y sus proveedores":"Firmou acordos de tratamento com contadores, TI e fornecedores","Sabe quién responde, y en cuántos días, si un cliente pide ver o borrar sus datos":"Possui procedimento e prazos para pedidos de acesso ou exclusão","Pide solo los datos que de verdad necesita":"Coleta somente os dados realmente necessários","Tiene publicado un aviso de privacidad al día":"Mantém aviso de privacidade publicado e atualizado","Revisó que quien maneja sus datos por fuera sepa protegerlos":"Verifica se operadores externos protegem os dados","Hasta 1.000":"Até 1.000","1.001 a 10.000":"De 1.001 a 10.000","10.001 a 100.000":"De 10.001 a 100.000","Solo datos básicos":"Somente dados básicos","Una categoría especial":"Uma categoria especial","Varias especiales o grupos vulnerables":"Várias categorias especiais ou grupos vulneráveis","Colegio, escuela, jardín o guardería":"Escola, pré-escola ou creche","Universidad, politécnica o instituto":"Universidade, politécnica ou instituto","Trabajamos con niños o adolescentes":"Trabalhamos com crianças ou adolescentes","Banco, cooperativa, fintech o casa de empeño":"Banco, cooperativa, fintech ou casa de penhores","Seguros o medicina prepagada":"Seguros ou assistência médica pré-paga","Publicidad, marketing, encuestas o call center":"Publicidade, marketing, pesquisas ou call center","Clínica, consultorio, laboratorio o farmacia":"Clínica, consultório, laboratório ou farmácia","Guardianía o administración de edificios y conjuntos":"Segurança ou administração de edifícios e condomínios","Club o federación deportiva profesional":"Clube ou federação esportiva profissional","Cámara, gremio o colegio de profesionales":"Câmara, associação comercial ou conselho profissional","Telefonía o internet":"Telefonia ou serviços de internet","Vendemos cámaras, GPS o inteligencia artificial":"Vendemos câmeras, GPS ou inteligência artificial","Damos un servicio público por concesión":"Prestamos serviço público por concessão","Tenemos papeles de salud de alguien":"Mantemos dados médicos de alguém","Un programa califica o decide sobre personas por nosotros":"Programa classifica ou decide sobre pessoas automaticamente","Tenemos cámaras que graban por donde pasa gente":"Utilizamos câmeras em áreas de circulação de pessoas","Marcamos con huella o cara, o vemos por dónde anda la gente":"Usamos biometria facial, digital ou rastreamento de localização","Fiamos, damos crédito o cobramos":"Concedemos crédito, empréstimos ou cobramos dívidas","Tenemos datos de menores de 18 años":"Tratamos dados de menores de 18 anos","Mandamos datos a otra empresa o fuera del país":"Enviamos dados a outra empresa ou ao exterior","Llevamos paquetes o hacemos entregas a domicilio":"Transportamos encomendas ou fazemos entregas","Nombre, cédula, correo, teléfono, dirección":"Nome, documento, e-mail, telefone e endereço","Sueldo, contrato, asistencia, vacaciones":"Salário, contrato, presença e férias","Títulos, notas, hoja de vida":"Diplomas, notas e currículos","Cuenta bancaria, tarjeta, facturas, pagos":"Contas bancárias, cartões, faturas e pagamentos","Deudas, buró, garantías":"Dívidas, cadastros de crédito e garantias","Lo que registra su página web o su app, como ubicación, compras o visitas":"Atividade no site ou aplicativo, localização, compras e visitas","Fotos, video de cámaras, grabación de llamadas":"Fotos, câmeras e gravações de chamadas","Certificados médicos, IESS, discapacidad, diagnósticos":"Atestados médicos, previdência, deficiência e diagnósticos","Huella, rostro o voz":"Impressões digitais, rosto ou voz","Religión, política, etnia, orientación sexual, situación migratoria":"Religião, política, etnia, sexualidade ou situação migratória","Antecedentes penales o juicios":"Antecedentes criminais ou processos judiciais","Datos de menores, como hijos de trabajadores, alumnos o pacientes":"Dados de menores, filhos de empregados ou alunos","Mi sistema guarda más de 100 datos de cada persona":"Nosso sistema guarda mais de 100 campos por pessoa","Hasta USD 100 mil":"Até USD 100 mil","USD 100 mil a 500 mil":"USD 100 mil a 500 mil","USD 500 mil a 2 millones":"USD 500 mil a 2 milhões","USD 2 a 10 millones":"USD 2 a 10 milhões","Más de USD 10 millones":"Mais de USD 10 milhões","Prefiero no decir":"Prefiro não informar","Sí, nombrado e inscrito en la Superintendencia":"Sim, nomeado e registrado na autoridade","Nombrado, pero no sé si está inscrito":"Nomeado, mas não sei se foi registrado","No tenemos":"Não temos","¿De cuánta gente tiene datos?":"De quantas pessoas você mantém dados?","¿Qué datos tiene de esa gente?":"Que tipos de dados pessoais você possui?","¿Cada cuánto le entran datos nuevos?":"Com que frequência recebe novos dados pessoais?","De vez en cuando":"Ocasionalmente","Cada semana o cada mes":"Toda semana ou mês","Todos los días o todo el tiempo":"Diariamente ou continuamente","¿Cuánto tiempo los guarda?":"Por quanto tempo os conserva?","Poco tiempo y los boto":"Pouco tempo, depois apagamos","Menos de 3 años":"Menos de 3 anos","3 años o más, o nunca borro":"3 anos ou mais, ou nunca apagamos","¿A dónde llegan esos datos?":"Para onde os dados são enviados?","Se quedan en mi ciudad":"Permanecem na minha cidade","Van por todo el Ecuador":"Circulam por todo o Equador","Salen del país":"São enviados ao exterior","¿Qué tamaño tiene su organización?":"Qual é o tamanho da sua organização?","Trabajo solo o con un asistente":"Trabalho sozinho ou com um assistente","Entre 2 y 15 personas":"De 2 a 15 pessoas","Entre 16 y 80 personas":"De 16 a 80 pessoas","Más de 80 personas, o una institución":"Mais de 80 pessoas ou uma instituição","¿Cuánto factura al año su organización?":"Qual é o faturamento anual da organização?","Menos de USD 100.000 al año":"Menos de USD 100 mil por ano","Entre USD 100.000 y 500.000":"De USD 100 mil a 500 mil","Entre USD 500.000 y 2 millones":"De USD 500 mil a 2 milhões","Entre USD 2 y 10 millones":"De USD 2 a 10 milhões","Prefiero no indicarlo":"Prefiro não informar","¿Su organización guarda alguno de estos documentos?":"Sua organização guarda algum destes documentos?","Certificados médicos, exámenes de ingreso o reposos del IESS del personal":"Atestados e exames médicos ou afastamentos de funcionários","Cédulas o datos de hijos y cargas familiares de los trabajadores":"Documentos dos filhos e dependentes dos empregados","Carné o información de discapacidad":"Carteira ou informações de deficiência","Historias clínicas, fichas de pacientes o expedientes de alumnos":"Prontuários médicos de pacientes ou registros escolares","Información financiera o consultas de crédito de clientes":"Informações financeiras ou consultas de crédito de clientes","Ninguno de estos":"Nenhum destes","¿Usa alguno de estos sistemas?":"Você usa algum destes sistemas?","Cámaras de seguridad, solo video":"Câmeras de segurança, somente vídeo","Cámaras que también graban audio":"Câmeras que também gravam áudio","Marcación de asistencia con huella o reconocimiento facial":"Registro de ponto com digital ou reconhecimento facial","GPS o rastreo de vehículos, o localización del personal":"GPS de veículos ou rastreamento de funcionários","¿Ya tiene un Delegado de Protección de Datos?":"Você já possui um Encarregado de Proteção de Dados?","Sí, designado y registrado ante la Superintendencia":"Sim, nomeado e registrado perante a autoridade","Lo nombramos, pero no está registrado":"Nomeado, mas sem registro","No sé si nos corresponde":"Não sei se é obrigatório","Sus contratos con trabajadores, contador externo y proveedores, ¿incluyen cláusulas de protección de datos?":"Contratos com empregados, contador externo e fornecedores incluem cláusulas de proteção de dados?","Sí, los revisamos y todos las tienen":"Sim, todos foram revisados e possuem cláusulas","Algunos sí, otros no":"Alguns sim, outros não","No, son los contratos de siempre":"Não, são contratos comuns","No lo sé":"Não sei","¿Cuál de estas situaciones ocurre en su organización?":"Qual destas situações ocorre na sua organização?","Si alguien que nos dejó sus datos pide que los borremos, no sabríamos cómo hacerlo":"Não saberíamos atender um pedido de exclusão de dados","Usamos ChatGPT u otra inteligencia artificial para redactar, resumir o atender clientes":"Usamos ChatGPT ou outra IA para redigir, resumir ou atender clientes","Guardamos contactos y listas de interesados sin un plazo para borrarlos":"Guardamos contatos sem prazo de exclusão","Ninguna de estas":"Nenhuma destas","Empresa / organización":"Empresa / organização","Persona natural":"Pessoa física","Sí":"Sim","No":"Não","No estoy seguro":"Não tenho certeza","Ninguno":"Nenhum","Requerimiento de información":"Solicitação de informações da autoridade","Medidas correctivas":"Medidas corretivas","Sanción previa":"Sanção anterior","Todo apunta a que le corresponde nombrar Delegado":"Tudo indica que deve nomear um Encarregado","No aparecen señales de obligatoriedad directa":"Não foram identificados critérios diretos de obrigatoriedade","Crítico":"Crítico","Expuesto":"Exposto","Vulnerable":"Vulnerável","Perfectible":"Pode melhorar","Sin hallazgos":"Sem achados","Riesgo muy alto":"Risco muito alto","Riesgo alto":"Risco alto","Riesgo medio-alto":"Risco médio-alto","Riesgo moderado":"Risco moderado","Riesgo controlado":"Risco controlado","grave":"Grave","leve":"Leve","Mantener el registro de actividades vivo":"Manter atualizado o registro de atividades","Auditar cada cierto tiempo y guardar los informes":"Fazer auditorias periódicas e guardar evidências","Atender los pedidos de la gente dentro del plazo":"Responder aos pedidos dos titulares no prazo","Revisar los contratos con sus proveedores":"Revisar contratos com fornecedores","Por confirmar: la evaluación de impacto":"Confirmar a necessidade de avaliação de impacto","Por confirmar: autorización del representante del menor":"Confirmar autorização para dados de menores","Por confirmar: el letrero de las cámaras y el plazo de conservación":"Confirmar avisos de câmeras e prazo de conservação","Por confirmar: la salida de datos del país":"Confirmar garantias para transferências internacionais","Nombrar Delegado e inscribirlo en la Superintendencia":"Nomear e registrar um Encarregado","Cuidar a quién nombra":"Escolher um Encarregado independente e qualificado","Hacer el estudio de riesgos (la evaluación de impacto)":"Fazer avaliação de impacto","Revisar si le toca la evaluación de impacto":"Verificar se a avaliação de impacto é obrigatória","Por confirmar con un abogado: si le toca Delegado y evaluación de impacto":"Confirmar obrigações de Encarregado e avaliação de impacto","Armar el registro de actividades":"Preparar registro das atividades de tratamento","Inscribir sus bases de datos en el registro público":"Registrar os bancos de dados pertinentes","Decirlo en su política de privacidad":"Descrever o tratamento em grande escala no aviso de privacidade","Pedir autorización al representante del menor":"Obter autorização para dados de menores","Poner el letrero de las cámaras y definir cuántos días guarda las grabaciones":"Instalar avisos de câmeras e definir prazos","Ordenar la salida de datos del país":"Documentar transferências internacionais","Designe por escrito a un Delegado de Protección de Datos e inscríbalo ante la Superintendencia.":"Nomeie formalmente um Encarregado de Proteção de Dados e registre-o na autoridade.","Inscriba a su Delegado de Protección de Datos en el sistema de la Superintendencia. Designarlo por dentro no basta.":"Registre o Encarregado na autoridade equatoriana; a nomeação isolada não basta.","Verifique que tenga título universitario en Derecho, Sistemas, Comunicación o Tecnología y cinco años de experiencia.":"Verifique a formação universitária e a experiência profissional exigidas.","Esa persona no puede ser el representante legal, el jefe de sistemas, un socio ni un familiar de los dueños.":"Garanta a independência do Encarregado em relação à direção, TI, sócios e familiares.","Ponga clave a las computadoras y a los archivos con datos, guarde los papeles bajo llave y deje por escrito quién puede ver qué.":"Proteja arquivos digitais com senhas, documentos físicos e permissões de acesso.","Haga una lista escrita de qué datos guarda, de quién, para qué y por cuánto tiempo.":"Registre quais dados conserva, de quem são, para quê e por quanto tempo.","Cambie el papel o la casilla con que sus clientes aceptan: debe decir para qué usa sus datos y quedar guardado.":"Atualize os termos de consentimento com finalidades claras e guarde provas.","Escriba un procedimiento de una página: si se filtran datos, quién avisa, a quién y en cinco días.":"Documente a resposta a incidentes, os responsáveis e os prazos de notificação.","Haga una evaluación de impacto antes de seguir tratando datos sensibles.":"Realize avaliação de impacto antes de tratar dados sensíveis.","Escriba qué puede salir mal con los datos que guarda y qué hace usted para evitarlo.":"Registre riscos e medidas preventivas para os dados mantidos.","Firme un anexo de protección de datos con su contador, su sistema y quien más maneje sus datos.":"Assine acordos de tratamento com todos os fornecedores que tenham acesso a dados.","Defina quién responde cuando un cliente pida ver, corregir o borrar sus datos, y en cuántos días.":"Defina responsáveis e prazos para pedidos de acesso, correção e eliminação.","Antes de pedir un dato nuevo, pregúntese si de verdad lo necesita. Pida lo mínimo.":"Colete somente os dados necessários para cada finalidade.","Publique un aviso de privacidad donde sus clientes puedan verlo.":"Publique aviso de privacidade claro e atualizado.","Revise que las empresas a las que les pasa datos tengan con qué protegerlos.":"Avalie as salvaguardas e contratos dos operadores externos.","El inventario de qué datos tiene y dónde están se desactualiza solo. Cada sistema nuevo, cada proveedor nuevo y cada cámara nueva entran ahí.":"Atualize o inventário quando houver novos sistemas, fornecedores ou câmeras.","La norma pide revisiones periódicas y conservar los informes de cumplimiento al menos cinco años.":"Revise a conformidade regularmente e conserve os relatórios exigidos.","Si alguien le pide ver, corregir o borrar sus datos, tiene que contestarle dentro del plazo que fija la ley. Ese es el reclamo que más rápido se convierte en denuncia.":"Defina um canal e cumpra os prazos legais de acesso, retificação e exclusão.","El contador externo, el sistema de nómina, la nube y el call center manejan datos suyos. Con cada uno necesita un contrato que diga cómo cuida los datos que usted le pasa.":"Garanta acordos escritos com contadores, nuvem e prestadores de serviço.","Con lo que marcó, todo indica que le corresponde tenerla hecha. Si ya la tiene, esta línea no le quita nada. Si no, es la siguiente prioridad.":"Verifique os tratamentos que exigem análise documentada.","Los datos de niños y adolescentes necesitan autorización expresa de quien lo represente.":"Verifique os requisitos de consentimento do representante legal.","Aviso visible con quién graba, para qué y a dónde reclamar, y un plazo de conservación escrito.":"Exiba os avisos exigidos e documente a retenção das gravações.","Mandar datos afuera necesita permiso legal propio y garantías escritas con quien los recibe.":"Revise a base jurídica e as garantias escritas dos dados enviados ao exterior.","Nombrarlo adentro no cierra nada. La obligación se completa con la inscripción, y no tenerlo es falta grave por sí sola, aunque todo lo demás lo haga bien.":"Formalize a nomeação e o registro perante a autoridade competente.","El Delegado tiene funciones y responsabilidades propias ante la ley. No es un cargo para poner de relleno ni para sumárselo a alguien que ya tiene otro cargo.":"Verifique formação, independência e conflitos de interesse.","Es un documento que dice qué puede salir mal con esos datos y cómo lo evita. Con lo que marcó, todo indica que en su caso es obligatorio, y no hacerlo es falta grave.":"Documente riscos e medidas preventivas quando a avaliação for obrigatória.","La ley la exige en tres casos puntuales. Con lo que marcó todavía no se ve claro cuál le toca, y aun así la Superintendencia puede pedírsela si ve riesgo alto.":"Revise o caso específico com assessoria jurídica qualificada.","Con lo que marcó no aparecen las señales típicas, y eso no alcanza para descartarlas. Es lo primero que se revisa en la conversación.":"As respostas não são conclusivas; procure uma análise jurídica.","Un inventario interno de qué datos tiene, dónde están, quién los toca y por cuánto tiempo. De ese inventario dependen todas las demás tareas, y ahí también queda por escrito cuántos datos maneja.":"Inventarie os dados, local, acesso e prazos de conservação.","Es el Registro Nacional de la autoridad de datos, y hay que inscribirse dentro del plazo que fija el Reglamento desde que empieza a manejar los datos.":"Verifique as obrigações nacionais de registro e os prazos.","La política tiene que decir expresamente que usted maneja muchos datos, lo que la norma llama gran escala.":"Explique claramente o alcance e as finalidades.","Los datos de niños y adolescentes necesitan autorización expresa de quien los represente. Desde los quince años el adolescente puede autorizar por sí mismo, si se le explica con claridad para qué.":"Verifique a autorização dos responsáveis quando exigida.","Un letrero visible que diga quién graba, para qué y dónde reclamar. Y por escrito, cuántos días guarda las grabaciones y por qué cada cámara apunta a donde apunta.":"Informe responsável, finalidade, contato e tempo de retenção.","Para mandar datos afuera necesita una razón que la ley acepte y un contrato con quien los recibe. Usar la nube o la casa matriz es sacar datos, aunque nunca se lo haya llamado así.":"Confirme a base jurídica e os acordos com destinatários externos.","Delegado de Protección de Datos designado":"Encarregado de Proteção de Dados nomeado","Delegado registrado ante la Superintendencia":"Encarregado registrado perante a autoridade","Evaluación de impacto realizada":"Avaliação de impacto realizada","Medidas de seguridad técnicas, organizativas y jurídicas":"Medidas técnicas, organizacionais e jurídicas","Usar los datos solo para los fines declarados":"Utilização de dados somente para finalidades declaradas","Metodología de análisis y gestión de riesgos":"Procedimento de análise e gestão de riscos","Contratos con cláusulas LOPDP con sus proveedores":"Contratos com cláusulas de proteção de dados","Registro de actividades de tratamiento":"Registro das atividades de tratamento","Protocolo de notificación de brechas":"Protocolo de notificação de incidentes","Protección de datos desde el diseño y por defecto":"Privacidade desde a concepção e por padrão","Proveedores elegidos con garantías suficientes":"Fornecedores com garantias adequadas","Datos sensibles sin las protecciones que exige la ley":"Dados sensíveis exigem proteção reforçada","Cámaras, biometría o rastreo sin marco documentado":"Câmeras, biometria e rastreamento exigem controles","Terceros con acceso a sus archivos sin contrato que lo regule":"Tratamento por terceiros exige acordos escritos","Sin procedimiento para atender pedidos de las personas":"Faltam procedimentos para pedidos dos titulares","Delegado de Protección de Datos sin designar o sin inscribir":"Falta nomeação ou registro do Encarregado","Uso de inteligencia artificial sin política ni razón declarada":"Inteligência artificial exige política de proteção de dados","Sume clientes, trabajadores, proveedores, pacientes, alumnos, socios y todos los que alguna vez le dejaron su correo.":"Inclua clientes, empregados, fornecedores, pacientes, alunos, associados e todos que já forneceram seu e-mail.","Marque todo lo que tenga guardado en el sistema, en Excel, en carpetas de papel, en el correo o en WhatsApp.":"Selecione tudo o que guarda em sistemas, planilhas, documentos impressos, e-mail ou WhatsApp.","Piense en lo que pasa de verdad, no en lo que debería pasar.":"Considere o que realmente acontece, não o que deveria acontecer.","Si nunca ha borrado nada a propósito, marque la tercera.":"Se nunca apagou dados deliberadamente, escolha a terceira opção.","Si usa Gmail, Drive, Microsoft 365, WhatsApp, Facebook o un sistema de ventas en la nube, ya salen del país.":"Se usa Gmail, Drive, Microsoft 365, WhatsApp, Facebook ou sistemas na nuvem, os dados já podem sair do país."},"fr":{"Salud":"Santé","Educación":"Éducation","Financiero y seguros":"Finance et assurances","Comercio o venta en línea":"Commerce et vente en ligne","Tecnología y telecom":"Technologie et télécommunications","Servicios profesionales":"Services professionnels","Seguridad y videovigilancia":"Sécurité et vidéosurveillance","Hotelería, turismo y comida":"Hôtellerie, tourisme et restauration","Transporte y logística":"Transport et logistique","Inmobiliario y construcción":"Immobilier et construction","Recursos humanos y selección":"Ressources humaines et recrutement","Club, federación o gremio":"Club, fédération ou organisme professionnel","Publicidad y perfilamiento":"Publicité et profilage","Otro tipo de negocio":"Autre activité professionnelle","Solo yo":"Moi uniquement","De 2 a 5":"De 2 à 5","De 6 a 20":"De 6 à 20","De 21 a 100":"De 21 à 100","Más de 100":"Plus de 100","Menos de 50":"Moins de 50","Entre 50 y 300":"De 50 à 300","Entre 300 y 1.000":"De 300 à 1 000","Entre 1.000 y 10.000":"De 1 000 à 10 000","Entre 10.000 y 100.000":"De 10 000 à 100 000","Más de 100.000":"Plus de 100 000","Nombró por escrito a un Delegado de Protección de Datos":"A nommé par écrit un Délégué à la protection des données","Inscribió a ese delegado ante la Superintendencia":"A enregistré ce Délégué auprès de l’autorité","Ese delegado tiene el título y los años que pide la ley":"Le Délégué possède les qualifications et l’expérience requises","Ese delegado no es el dueño, ni el de sistemas, ni un familiar":"Le Délégué est indépendant : ni propriétaire, ni responsable informatique, ni proche","Los datos están con clave, bajo llave y con reglas por escrito":"Les données sont protégées par des mots de passe, un contrôle physique et des règles écrites","Tiene por escrito qué datos guarda, de quién y para qué":"Tient un registre écrit des données, des personnes et des finalités","Sus clientes aceptaron por escrito, sabiendo para qué":"Les clients ont donné un consentement éclairé et documenté","Tiene escrito qué hacer, y a quién avisar, si se le filtran datos":"Dispose d’une procédure écrite pour les incidents et notifications","Midió por escrito el riesgo antes de usar datos delicados":"A réalisé une analyse d’impact pour les traitements sensibles","Tiene escrito qué puede salir mal y cómo lo evita":"Dispose d’une analyse des risques et de mesures de prévention","Firmó un anexo de datos con su contador, su sistema y sus proveedores":"A signé des accords de traitement avec les prestataires et fournisseurs","Sabe quién responde, y en cuántos días, si un cliente pide ver o borrar sus datos":"Dispose de procédures et délais pour l’accès et la suppression des données","Pide solo los datos que de verdad necesita":"Ne collecte que les données strictement nécessaires","Tiene publicado un aviso de privacidad al día":"Dispose d’une politique de confidentialité publiée et à jour","Revisó que quien maneja sus datos por fuera sepa protegerlos":"Vérifie que les sous-traitants protègent convenablement les données","Hasta 1.000":"Jusqu’à 1 000","1.001 a 10.000":"De 1 001 à 10 000","10.001 a 100.000":"De 10 001 à 100 000","Solo datos básicos":"Données de base uniquement","Una categoría especial":"Une catégorie particulière","Varias especiales o grupos vulnerables":"Plusieurs catégories particulières ou groupes vulnérables","Colegio, escuela, jardín o guardería":"École, maternelle ou crèche","Universidad, politécnica o instituto":"Université, école polytechnique ou institut","Trabajamos con niños o adolescentes":"Nous travaillons avec des enfants ou adolescents","Banco, cooperativa, fintech o casa de empeño":"Banque, coopérative, fintech ou prêteur sur gages","Seguros o medicina prepagada":"Assurances ou soins médicaux prépayés","Publicidad, marketing, encuestas o call center":"Publicité, marketing, enquêtes ou centre d’appels","Clínica, consultorio, laboratorio o farmacia":"Clinique, cabinet médical, laboratoire ou pharmacie","Guardianía o administración de edificios y conjuntos":"Sécurité ou gestion d’immeubles et copropriétés","Club o federación deportiva profesional":"Club ou fédération sportive professionnelle","Cámara, gremio o colegio de profesionales":"Chambre, syndicat professionnel ou association","Telefonía o internet":"Téléphonie ou accès à internet","Vendemos cámaras, GPS o inteligencia artificial":"Nous vendons des caméras, GPS ou systèmes d’IA","Damos un servicio público por concesión":"Nous assurons un service public par concession","Tenemos papeles de salud de alguien":"Nous détenons des dossiers médicaux","Un programa califica o decide sobre personas por nosotros":"Un logiciel évalue ou décide automatiquement pour des personnes","Tenemos cámaras que graban por donde pasa gente":"Nous filmons les zones où circulent des personnes","Marcamos con huella o cara, o vemos por dónde anda la gente":"Nous utilisons empreintes, reconnaissance faciale ou géolocalisation","Fiamos, damos crédito o cobramos":"Nous accordons des crédits, prêtons ou recouvrons des dettes","Tenemos datos de menores de 18 años":"Nous traitons des données de mineurs de moins de 18 ans","Mandamos datos a otra empresa o fuera del país":"Nous transférons des données à une entreprise ou à l’étranger","Llevamos paquetes o hacemos entregas a domicilio":"Nous livrons des colis ou à domicile","Nombre, cédula, correo, teléfono, dirección":"Nom, pièce d’identité, courriel, téléphone et adresse","Sueldo, contrato, asistencia, vacaciones":"Salaire, contrat, présence et congés","Títulos, notas, hoja de vida":"Diplômes, notes et CV","Cuenta bancaria, tarjeta, facturas, pagos":"Comptes bancaires, cartes, factures et paiements","Deudas, buró, garantías":"Dettes, renseignements de crédit et garanties","Lo que registra su página web o su app, como ubicación, compras o visitas":"Activités sur le site ou l’application : position, achats et visites","Fotos, video de cámaras, grabación de llamadas":"Photos, vidéosurveillance et appels enregistrés","Certificados médicos, IESS, discapacidad, diagnósticos":"Certificats médicaux, sécurité sociale, handicap ou diagnostics","Huella, rostro o voz":"Empreintes digitales, visage ou voix","Religión, política, etnia, orientación sexual, situación migratoria":"Religion, politique, origine ethnique, sexualité ou statut migratoire","Antecedentes penales o juicios":"Antécédents judiciaires ou procédures en justice","Datos de menores, como hijos de trabajadores, alumnos o pacientes":"Données sur les mineurs, enfants du personnel ou élèves","Mi sistema guarda más de 100 datos de cada persona":"Notre système enregistre plus de 100 champs par personne","Hasta USD 100 mil":"Jusqu’à 100 000 USD","USD 100 mil a 500 mil":"100 000 à 500 000 USD","USD 500 mil a 2 millones":"500 000 à 2 millions USD","USD 2 a 10 millones":"2 à 10 millions USD","Más de USD 10 millones":"Plus de 10 millions USD","Prefiero no decir":"Je préfère ne pas répondre","Sí, nombrado e inscrito en la Superintendencia":"Oui, désigné et enregistré auprès de l’autorité","Nombrado, pero no sé si está inscrito":"Désigné, mais je ne sais pas s’il est enregistré","No tenemos":"Nous n’en avons pas","¿De cuánta gente tiene datos?":"De combien de personnes détenez-vous les données ?","¿Qué datos tiene de esa gente?":"Quels types de données personnelles possédez-vous ?","¿Cada cuánto le entran datos nuevos?":"À quelle fréquence recueillez-vous de nouvelles données ?","De vez en cuando":"De temps en temps","Cada semana o cada mes":"Chaque semaine ou chaque mois","Todos los días o todo el tiempo":"Tous les jours ou en permanence","¿Cuánto tiempo los guarda?":"Combien de temps les conservez-vous ?","Poco tiempo y los boto":"Peu de temps puis suppression","Menos de 3 años":"Moins de 3 ans","3 años o más, o nunca borro":"3 ans ou plus, voire jamais supprimées","¿A dónde llegan esos datos?":"Où circulent ces données ?","Se quedan en mi ciudad":"Dans ma ville","Van por todo el Ecuador":"Dans tout l’Équateur","Salen del país":"À l’étranger","¿Qué tamaño tiene su organización?":"Quelle est la taille de votre organisation ?","Trabajo solo o con un asistente":"Je travaille seul ou avec un assistant","Entre 2 y 15 personas":"De 2 à 15 personnes","Entre 16 y 80 personas":"De 16 à 80 personnes","Más de 80 personas, o una institución":"Plus de 80 personnes ou une institution","¿Cuánto factura al año su organización?":"Quel est le chiffre d’affaires annuel de votre organisation ?","Menos de USD 100.000 al año":"Moins de 100 000 USD par an","Entre USD 100.000 y 500.000":"De 100 000 à 500 000 USD","Entre USD 500.000 y 2 millones":"De 500 000 à 2 millions USD","Entre USD 2 y 10 millones":"De 2 à 10 millions USD","Prefiero no indicarlo":"Je préfère ne pas le préciser","¿Su organización guarda alguno de estos documentos?":"Votre organisation conserve-t-elle l’un de ces documents ?","Certificados médicos, exámenes de ingreso o reposos del IESS del personal":"Certificats et examens médicaux ou arrêts maladie des employés","Cédulas o datos de hijos y cargas familiares de los trabajadores":"Pièces d’identité et renseignements sur les enfants du personnel","Carné o información de discapacidad":"Carte ou information relative à un handicap","Historias clínicas, fichas de pacientes o expedientes de alumnos":"Dossiers médicaux des patients ou dossiers des élèves","Información financiera o consultas de crédito de clientes":"Données financières ou vérifications de solvabilité des clients","Ninguno de estos":"Aucun de ces éléments","¿Usa alguno de estos sistemas?":"Utilisez-vous l’un de ces systèmes ?","Cámaras de seguridad, solo video":"Caméras de sécurité enregistrant uniquement la vidéo","Cámaras que también graban audio":"Caméras enregistrant aussi le son","Marcación de asistencia con huella o reconocimiento facial":"Pointage par empreinte ou reconnaissance faciale","GPS o rastreo de vehículos, o localización del personal":"Géolocalisation GPS des véhicules ou du personnel","¿Ya tiene un Delegado de Protección de Datos?":"Avez-vous déjà un Délégué à la protection des données ?","Sí, designado y registrado ante la Superintendencia":"Oui, désigné et enregistré auprès de l’autorité","Lo nombramos, pero no está registrado":"Désigné, mais non enregistré","No sé si nos corresponde":"Je ne sais pas si c’est obligatoire","Sus contratos con trabajadores, contador externo y proveedores, ¿incluyen cláusulas de protección de datos?":"Vos contrats avec le personnel, le comptable et les prestataires comportent-ils des clauses de protection des données ?","Sí, los revisamos y todos las tienen":"Oui, tous ont été vérifiés et comportent ces clauses","Algunos sí, otros no":"Certains oui, d’autres non","No, son los contratos de siempre":"Non, ce sont des contrats ordinaires","No lo sé":"Je ne sais pas","¿Cuál de estas situaciones ocurre en su organización?":"Laquelle de ces situations s’applique à votre organisation ?","Si alguien que nos dejó sus datos pide que los borremos, no sabríamos cómo hacerlo":"Nous ne saurions pas traiter une demande d’effacement de données","Usamos ChatGPT u otra inteligencia artificial para redactar, resumir o atender clientes":"Nous utilisons ChatGPT ou une autre IA pour rédiger, résumer ou aider les clients","Guardamos contactos y listas de interesados sin un plazo para borrarlos":"Nous gardons des listes de contacts sans délai de suppression","Ninguna de estas":"Aucune de ces situations","Empresa / organización":"Entreprise / organisation","Persona natural":"Personne physique","Sí":"Oui","No":"Non","No estoy seguro":"Je ne suis pas sûr","Ninguno":"Aucun","Requerimiento de información":"Demande de renseignements de l’autorité","Medidas correctivas":"Mesures correctives","Sanción previa":"Sanction antérieure","Todo apunta a que le corresponde nombrar Delegado":"La désignation d’un Délégué semble obligatoire","No aparecen señales de obligatoriedad directa":"Aucun critère direct d’obligation identifié","Crítico":"Critique","Expuesto":"Exposé","Vulnerable":"Vulnérable","Perfectible":"À améliorer","Sin hallazgos":"Aucune anomalie","Riesgo muy alto":"Risque très élevé","Riesgo alto":"Risque élevé","Riesgo medio-alto":"Risque moyen à élevé","Riesgo moderado":"Risque modéré","Riesgo controlado":"Risque maîtrisé","grave":"Grave","leve":"Mineure","Mantener el registro de actividades vivo":"Maintenir le registre des traitements à jour","Auditar cada cierto tiempo y guardar los informes":"Effectuer des audits périodiques et conserver les preuves","Atender los pedidos de la gente dentro del plazo":"Répondre aux demandes des personnes dans les délais","Revisar los contratos con sus proveedores":"Réviser les contrats avec les prestataires","Por confirmar: la evaluación de impacto":"Vérifier l’obligation de réaliser une analyse d’impact","Por confirmar: autorización del representante del menor":"Vérifier le consentement pour les données de mineurs","Por confirmar: el letrero de las cámaras y el plazo de conservación":"Vérifier l’affichage des caméras et les durées de conservation","Por confirmar: la salida de datos del país":"Vérifier les garanties des transferts internationaux","Nombrar Delegado e inscribirlo en la Superintendencia":"Désigner et enregistrer un Délégué","Cuidar a quién nombra":"Choisir un Délégué indépendant et qualifié","Hacer el estudio de riesgos (la evaluación de impacto)":"Réaliser une analyse d’impact","Revisar si le toca la evaluación de impacto":"Vérifier si l’analyse d’impact est obligatoire","Por confirmar con un abogado: si le toca Delegado y evaluación de impacto":"Vérifier les obligations de Délégué et d’analyse d’impact","Armar el registro de actividades":"Préparer le registre des activités de traitement","Inscribir sus bases de datos en el registro público":"Enregistrer les bases de données concernées","Decirlo en su política de privacidad":"Décrire les traitements à grande échelle dans la notice","Pedir autorización al representante del menor":"Obtenir l’autorisation pour les données de mineurs","Poner el letrero de las cámaras y definir cuántos días guarda las grabaciones":"Afficher les avis de vidéosurveillance et fixer les délais","Ordenar la salida de datos del país":"Documenter les transferts internationaux","Designe por escrito a un Delegado de Protección de Datos e inscríbalo ante la Superintendencia.":"Désignez par écrit un Délégué à la protection des données et enregistrez-le auprès de l’autorité.","Inscriba a su Delegado de Protección de Datos en el sistema de la Superintendencia. Designarlo por dentro no basta.":"Enregistrez le Délégué auprès de l’autorité équatorienne ; sa seule désignation ne suffit pas.","Verifique que tenga título universitario en Derecho, Sistemas, Comunicación o Tecnología y cinco años de experiencia.":"Vérifiez les diplômes et l’expérience professionnelle requis.","Esa persona no puede ser el representante legal, el jefe de sistemas, un socio ni un familiar de los dueños.":"Assurez l’indépendance du Délégué vis-à-vis de la direction, de l’informatique et de la famille.","Ponga clave a las computadoras y a los archivos con datos, guarde los papeles bajo llave y deje por escrito quién puede ver qué.":"Sécurisez les fichiers numériques, les documents physiques et les droits d’accès.","Haga una lista escrita de qué datos guarda, de quién, para qué y por cuánto tiempo.":"Documentez les données conservées, les personnes concernées, les finalités et la durée.","Cambie el papel o la casilla con que sus clientes aceptan: debe decir para qué usa sus datos y quedar guardado.":"Mettez à jour le consentement en précisant les finalités et conservez les preuves.","Escriba un procedimiento de una página: si se filtran datos, quién avisa, a quién y en cinco días.":"Documentez la réponse aux incidents, les responsables et les délais de notification.","Haga una evaluación de impacto antes de seguir tratando datos sensibles.":"Réalisez une analyse d’impact avant tout traitement sensible qui l’exige.","Escriba qué puede salir mal con los datos que guarda y qué hace usted para evitarlo.":"Documentez les risques et les mesures préventives.","Firme un anexo de protección de datos con su contador, su sistema y quien más maneje sus datos.":"Signez des accords de traitement avec les fournisseurs ayant accès aux données.","Defina quién responde cuando un cliente pida ver, corregir o borrar sus datos, y en cuántos días.":"Désignez un responsable et des délais pour les demandes d’accès, rectification et suppression.","Antes de pedir un dato nuevo, pregúntese si de verdad lo necesita. Pida lo mínimo.":"Ne collectez que les données nécessaires à la finalité déclarée.","Publique un aviso de privacidad donde sus clientes puedan verlo.":"Publiez une notice de confidentialité claire et à jour.","Revise que las empresas a las que les pasa datos tengan con qué protegerlos.":"Vérifiez les garanties et les engagements contractuels des sous-traitants.","El inventario de qué datos tiene y dónde están se desactualiza solo. Cada sistema nuevo, cada proveedor nuevo y cada cámara nueva entran ahí.":"Actualisez l’inventaire lors de l’ajout de systèmes, prestataires ou caméras.","La norma pide revisiones periódicas y conservar los informes de cumplimiento al menos cinco años.":"Contrôlez régulièrement la conformité et conservez les rapports exigés.","Si alguien le pide ver, corregir o borrar sus datos, tiene que contestarle dentro del plazo que fija la ley. Ese es el reclamo que más rápido se convierte en denuncia.":"Prévoyez un canal et respectez les délais légaux d’accès, rectification et suppression.","El contador externo, el sistema de nómina, la nube y el call center manejan datos suyos. Con cada uno necesita un contrato que diga cómo cuida los datos que usted le pasa.":"Veillez à disposer d’accords écrits avec les comptables, le cloud et les fournisseurs.","Con lo que marcó, todo indica que le corresponde tenerla hecha. Si ya la tiene, esta línea no le quita nada. Si no, es la siguiente prioridad.":"Examinez les traitements nécessitant une évaluation documentée.","Los datos de niños y adolescentes necesitan autorización expresa de quien lo represente.":"Contrôlez les conditions d’autorisation des représentants légaux.","Aviso visible con quién graba, para qué y a dónde reclamar, y un plazo de conservación escrito.":"Affichez les avis requis et documentez la durée de conservation des images.","Mandar datos afuera necesita permiso legal propio y garantías escritas con quien los recibe.":"Examinez la base légale et les garanties écrites pour les données envoyées à l’étranger.","Nombrarlo adentro no cierra nada. La obligación se completa con la inscripción, y no tenerlo es falta grave por sí sola, aunque todo lo demás lo haga bien.":"Finalisez la désignation et l’enregistrement auprès de l’autorité compétente.","El Delegado tiene funciones y responsabilidades propias ante la ley. No es un cargo para poner de relleno ni para sumárselo a alguien que ya tiene otro cargo.":"Vérifiez diplômes, indépendance et conflits d’intérêts.","Es un documento que dice qué puede salir mal con esos datos y cómo lo evita. Con lo que marcó, todo indica que en su caso es obligatorio, y no hacerlo es falta grave.":"Documentez les risques et les mesures de réduction pour les traitements concernés.","La ley la exige en tres casos puntuales. Con lo que marcó todavía no se ve claro cuál le toca, y aun así la Superintendencia puede pedírsela si ve riesgo alto.":"Examinez les circonstances avec un conseil juridique qualifié.","Con lo que marcó no aparecen las señales típicas, y eso no alcanza para descartarlas. Es lo primero que se revisa en la conversación.":"Les réponses ne permettent pas de conclure : demandez une analyse juridique ciblée.","Un inventario interno de qué datos tiene, dónde están, quién los toca y por cuánto tiempo. De ese inventario dependen todas las demás tareas, y ahí también queda por escrito cuántos datos maneja.":"Inventoriez les données, leurs lieux, les accès et les durées de conservation.","Es el Registro Nacional de la autoridad de datos, y hay que inscribirse dentro del plazo que fija el Reglamento desde que empieza a manejar los datos.":"Vérifiez les obligations nationales d’enregistrement et les délais.","La política tiene que decir expresamente que usted maneja muchos datos, lo que la norma llama gran escala.":"Expliquez clairement le périmètre et les finalités des traitements.","Los datos de niños y adolescentes necesitan autorización expresa de quien los represente. Desde los quince años el adolescente puede autorizar por sí mismo, si se le explica con claridad para qué.":"Vérifiez le consentement du représentant légal si nécessaire.","Un letrero visible que diga quién graba, para qué y dónde reclamar. Y por escrito, cuántos días guarda las grabaciones y por qué cada cámara apunta a donde apunta.":"Indiquez le responsable, la finalité, les contacts et la conservation.","Para mandar datos afuera necesita una razón que la ley acepte y un contrato con quien los recibe. Usar la nube o la casa matriz es sacar datos, aunque nunca se lo haya llamado así.":"Vérifiez la base légale et les accords avec les destinataires à l’étranger.","Delegado de Protección de Datos designado":"Délégué à la protection des données désigné","Delegado registrado ante la Superintendencia":"Délégué enregistré auprès de l’autorité","Evaluación de impacto realizada":"Analyse d’impact effectuée","Medidas de seguridad técnicas, organizativas y jurídicas":"Mesures techniques, organisationnelles et juridiques","Usar los datos solo para los fines declarados":"Données utilisées uniquement aux fins déclarées","Metodología de análisis y gestión de riesgos":"Procédure d’analyse et gestion des risques","Contratos con cláusulas LOPDP con sus proveedores":"Contrats fournisseurs avec clauses de protection des données","Registro de actividades de tratamiento":"Registre des activités de traitement","Protocolo de notificación de brechas":"Procédure de notification des violations","Protección de datos desde el diseño y por defecto":"Protection des données dès la conception et par défaut","Proveedores elegidos con garantías suficientes":"Prestataires offrant des garanties suffisantes","Datos sensibles sin las protecciones que exige la ley":"Les données sensibles nécessitent une protection renforcée","Cámaras, biometría o rastreo sin marco documentado":"La vidéosurveillance et la biométrie exigent des contrôles","Terceros con acceso a sus archivos sin contrato que lo regule":"Le traitement par des tiers exige des accords écrits","Sin procedimiento para atender pedidos de las personas":"Les procédures pour les demandes des personnes manquent","Delegado de Protección de Datos sin designar o sin inscribir":"La désignation ou l’enregistrement du Délégué manque","Uso de inteligencia artificial sin política ni razón declarada":"L’intelligence artificielle exige une politique de protection des données","Sume clientes, trabajadores, proveedores, pacientes, alumnos, socios y todos los que alguna vez le dejaron su correo.":"Incluez clients, employés, fournisseurs, patients, élèves, membres et toute personne ayant fourni son adresse courriel.","Marque todo lo que tenga guardado en el sistema, en Excel, en carpetas de papel, en el correo o en WhatsApp.":"Cochez tout ce qui est conservé dans les systèmes, feuilles de calcul, dossiers papier, courriels ou WhatsApp.","Piense en lo que pasa de verdad, no en lo que debería pasar.":"Considérez ce qui se passe réellement et non ce qui devrait se passer.","Si nunca ha borrado nada a propósito, marque la tercera.":"Si vous n’avez jamais volontairement supprimé de données, choisissez la troisième option.","Si usa Gmail, Drive, Microsoft 365, WhatsApp, Facebook o un sistema de ventas en la nube, ya salen del país.":"Si vous utilisez Gmail, Drive, Microsoft 365, WhatsApp, Facebook ou un système de vente en ligne, les données peuvent déjà quitter le pays."}};
const tlLocaleOutcomes = {"en":{"multa_actions":["Appoint a Data Protection Officer in writing and register the appointment with the authority.","Register your DPO with the Ecuadorian data authority; appointment alone is insufficient.","Verify the DPO’s required university degree and professional experience.","Ensure the DPO is independent of management, IT, ownership and close family relationships.","Protect electronic records with passwords, secure physical files and document access rights.","Document what data you keep, from whom, why and for how long.","Update consent forms to explain processing purposes and retain consent evidence.","Document a breach response procedure, notification responsibilities and legal deadlines.","Carry out a data protection impact assessment before sensitive processing.","Record potential data risks and preventive measures.","Sign data processing agreements with every supplier that handles personal data.","Assign responsibility and deadlines for access, correction and deletion requests.","Collect only information needed for the stated purpose.","Publish a clear, up-to-date privacy notice.","Review external processors’ safeguards and contractual commitments."],"dpo_actions":[["Keep the processing activities register current","Update your inventory whenever systems, providers or cameras change."],["Conduct periodic audits and retain evidence","Review compliance regularly and retain audit reports for the legally required period."],["Respond to data subject requests on time","Designate a channel and meet the applicable legal deadlines for access, correction and deletion."],["Review contracts with service providers","Ensure external accountants, cloud providers and service providers have written processing terms."],["Confirm whether a data protection impact assessment is needed","Check the specific processing activities that require a documented assessment."],["Confirm consent for processing minors’ information","Check the legal representative’s authorization requirements."],["Confirm CCTV notices and retention periods","Display the required notices and document how long recordings are kept."],["Confirm safeguards for international data transfers","Review the legal basis and written safeguards for data sent abroad."],["Appoint and register a Data Protection Officer","Complete the formal appointment and registration with the competent authority."],["Choose an independent, qualified DPO","Verify qualifications, independence and potential conflicts of interest."],["Conduct a data protection impact assessment","Document risks, impacts and mitigations for processing that requires an assessment."],["Check whether an impact assessment is mandatory","Review the specific circumstances with qualified legal counsel."],["Confirm DPO and impact assessment obligations","The answers are not conclusive; obtain a targeted legal assessment."],["Prepare a record of processing activities","Inventory data, locations, access permissions and retention periods."],["Register the relevant databases","Check the national registration requirements and applicable deadlines."],["Describe large-scale processing in the privacy notice","Explain the scope and purposes of the processing clearly."],["Obtain authorization for minors’ data","Verify parental or legal representative consent where required."],["Install CCTV notices and define retention periods","Explain who records, why, contact details and retention periods."],["Document international data transfers","Confirm the legal basis and agreements for overseas recipients."]],"dia_risk":["Very high risk: several critical issues require prompt review.","High risk: several practices lack documented safeguards.","Medium-high risk: strengthen evidence, controls and procedures.","Moderate risk: address the specific findings to improve compliance.","Controlled risk in the areas reviewed; this is not proof of legal compliance."],"dpo_summary":"The screening indicates whether a DPO may be required under the criteria selected. Review the specific legal requirements before appointing or ruling out a DPO.","dia_gaps":["Sensitive data need stronger safeguards and access restrictions.","Cameras, biometrics and tracking require documented purposes, retention rules and safeguards.","External processors should be governed by data processing agreements.","Establish a procedure for data subject requests and applicable deadlines.","Check whether a DPO must be appointed and registered.","Establish an internal policy and safeguards for the use of artificial intelligence."]},"pt":{"multa_actions":["Nomeie formalmente um Encarregado de Proteção de Dados e registre-o na autoridade.","Registre o Encarregado na autoridade equatoriana; a nomeação isolada não basta.","Verifique a formação universitária e a experiência profissional exigidas.","Garanta a independência do Encarregado em relação à direção, TI, sócios e familiares.","Proteja arquivos digitais com senhas, documentos físicos e permissões de acesso.","Registre quais dados conserva, de quem são, para quê e por quanto tempo.","Atualize os termos de consentimento com finalidades claras e guarde provas.","Documente a resposta a incidentes, os responsáveis e os prazos de notificação.","Realize avaliação de impacto antes de tratar dados sensíveis.","Registre riscos e medidas preventivas para os dados mantidos.","Assine acordos de tratamento com todos os fornecedores que tenham acesso a dados.","Defina responsáveis e prazos para pedidos de acesso, correção e eliminação.","Colete somente os dados necessários para cada finalidade.","Publique aviso de privacidade claro e atualizado.","Avalie as salvaguardas e contratos dos operadores externos."],"dpo_actions":[["Manter atualizado o registro de atividades","Atualize o inventário quando houver novos sistemas, fornecedores ou câmeras."],["Fazer auditorias periódicas e guardar evidências","Revise a conformidade regularmente e conserve os relatórios exigidos."],["Responder aos pedidos dos titulares no prazo","Defina um canal e cumpra os prazos legais de acesso, retificação e exclusão."],["Revisar contratos com fornecedores","Garanta acordos escritos com contadores, nuvem e prestadores de serviço."],["Confirmar a necessidade de avaliação de impacto","Verifique os tratamentos que exigem análise documentada."],["Confirmar autorização para dados de menores","Verifique os requisitos de consentimento do representante legal."],["Confirmar avisos de câmeras e prazo de conservação","Exiba os avisos exigidos e documente a retenção das gravações."],["Confirmar garantias para transferências internacionais","Revise a base jurídica e as garantias escritas dos dados enviados ao exterior."],["Nomear e registrar um Encarregado","Formalize a nomeação e o registro perante a autoridade competente."],["Escolher um Encarregado independente e qualificado","Verifique formação, independência e conflitos de interesse."],["Fazer avaliação de impacto","Documente riscos e medidas preventivas quando a avaliação for obrigatória."],["Verificar se a avaliação de impacto é obrigatória","Revise o caso específico com assessoria jurídica qualificada."],["Confirmar obrigações de Encarregado e avaliação de impacto","As respostas não são conclusivas; procure uma análise jurídica."],["Preparar registro das atividades de tratamento","Inventarie os dados, local, acesso e prazos de conservação."],["Registrar os bancos de dados pertinentes","Verifique as obrigações nacionais de registro e os prazos."],["Descrever o tratamento em grande escala no aviso de privacidade","Explique claramente o alcance e as finalidades."],["Obter autorização para dados de menores","Verifique a autorização dos responsáveis quando exigida."],["Instalar avisos de câmeras e definir prazos","Informe responsável, finalidade, contato e tempo de retenção."],["Documentar transferências internacionais","Confirme a base jurídica e os acordos com destinatários externos."]],"dia_risk":["Risco muito alto: diversas questões críticas exigem revisão urgente.","Risco alto: várias práticas carecem de controles documentados.","Risco médio-alto: fortaleça registros, controles e procedimentos.","Risco moderado: corrija os achados para melhorar a conformidade.","Risco controlado nas áreas examinadas; não comprova conformidade legal."],"dpo_summary":"A avaliação indica se a nomeação de um Encarregado pode ser obrigatória conforme os critérios escolhidos. Revise os requisitos legais específicos antes de decidir.","dia_gaps":["Dados sensíveis exigem proteções reforçadas e controles de acesso.","Câmeras, biometria e rastreamento exigem finalidade, retenção e medidas documentadas.","Operadores externos devem ter acordos de tratamento de dados.","Defina procedimento para pedidos dos titulares e prazos aplicáveis.","Verifique a necessidade de nomear e registrar um Encarregado.","Estabeleça política interna e garantias para o uso de inteligência artificial."]},"fr":{"multa_actions":["Désignez par écrit un Délégué à la protection des données et enregistrez-le auprès de l’autorité.","Enregistrez le Délégué auprès de l’autorité équatorienne ; sa seule désignation ne suffit pas.","Vérifiez les diplômes et l’expérience professionnelle requis.","Assurez l’indépendance du Délégué vis-à-vis de la direction, de l’informatique et de la famille.","Sécurisez les fichiers numériques, les documents physiques et les droits d’accès.","Documentez les données conservées, les personnes concernées, les finalités et la durée.","Mettez à jour le consentement en précisant les finalités et conservez les preuves.","Documentez la réponse aux incidents, les responsables et les délais de notification.","Réalisez une analyse d’impact avant tout traitement sensible qui l’exige.","Documentez les risques et les mesures préventives.","Signez des accords de traitement avec les fournisseurs ayant accès aux données.","Désignez un responsable et des délais pour les demandes d’accès, rectification et suppression.","Ne collectez que les données nécessaires à la finalité déclarée.","Publiez une notice de confidentialité claire et à jour.","Vérifiez les garanties et les engagements contractuels des sous-traitants."],"dpo_actions":[["Maintenir le registre des traitements à jour","Actualisez l’inventaire lors de l’ajout de systèmes, prestataires ou caméras."],["Effectuer des audits périodiques et conserver les preuves","Contrôlez régulièrement la conformité et conservez les rapports exigés."],["Répondre aux demandes des personnes dans les délais","Prévoyez un canal et respectez les délais légaux d’accès, rectification et suppression."],["Réviser les contrats avec les prestataires","Veillez à disposer d’accords écrits avec les comptables, le cloud et les fournisseurs."],["Vérifier l’obligation de réaliser une analyse d’impact","Examinez les traitements nécessitant une évaluation documentée."],["Vérifier le consentement pour les données de mineurs","Contrôlez les conditions d’autorisation des représentants légaux."],["Vérifier l’affichage des caméras et les durées de conservation","Affichez les avis requis et documentez la durée de conservation des images."],["Vérifier les garanties des transferts internationaux","Examinez la base légale et les garanties écrites pour les données envoyées à l’étranger."],["Désigner et enregistrer un Délégué","Finalisez la désignation et l’enregistrement auprès de l’autorité compétente."],["Choisir un Délégué indépendant et qualifié","Vérifiez diplômes, indépendance et conflits d’intérêts."],["Réaliser une analyse d’impact","Documentez les risques et les mesures de réduction pour les traitements concernés."],["Vérifier si l’analyse d’impact est obligatoire","Examinez les circonstances avec un conseil juridique qualifié."],["Vérifier les obligations de Délégué et d’analyse d’impact","Les réponses ne permettent pas de conclure : demandez une analyse juridique ciblée."],["Préparer le registre des activités de traitement","Inventoriez les données, leurs lieux, les accès et les durées de conservation."],["Enregistrer les bases de données concernées","Vérifiez les obligations nationales d’enregistrement et les délais."],["Décrire les traitements à grande échelle dans la notice","Expliquez clairement le périmètre et les finalités des traitements."],["Obtenir l’autorisation pour les données de mineurs","Vérifiez le consentement du représentant légal si nécessaire."],["Afficher les avis de vidéosurveillance et fixer les délais","Indiquez le responsable, la finalité, les contacts et la conservation."],["Documenter les transferts internationaux","Vérifiez la base légale et les accords avec les destinataires à l’étranger."]],"dia_risk":["Risque très élevé : plusieurs problèmes critiques nécessitent un examen rapide.","Risque élevé : plusieurs pratiques manquent de garanties écrites.","Risque moyen à élevé : renforcez les preuves, contrôles et procédures.","Risque modéré : corrigez les anomalies pour améliorer la conformité.","Risque maîtrisé dans les domaines examinés ; cela ne prouve pas la conformité légale."],"dpo_summary":"L’évaluation indique si la désignation d’un Délégué peut être obligatoire selon les critères sélectionnés. Vérifiez les exigences légales avant de conclure.","dia_gaps":["Les données sensibles nécessitent des protections et des contrôles d’accès renforcés.","La vidéosurveillance, la biométrie et le suivi exigent des finalités et règles de conservation documentées.","Les sous-traitants doivent être encadrés par des accords de traitement.","Prévoyez une procédure pour les demandes des personnes et les délais applicables.","Vérifiez si un Délégué doit être désigné et enregistré.","Établissez une politique interne et des garanties pour l’usage de l’intelligence artificielle."]}};
const nativeLabels={
 en:{'Salud':'Healthcare','Educación':'Education','Financiero y seguros':'Finance and insurance','Comercio o venta en línea':'Retail and e-commerce','Tecnología y telecom':'Technology and telecom','Servicios profesionales':'Professional services','Seguridad y videovigilancia':'Security and surveillance','Otro tipo de negocio':'Other activity','Empresa':'Company','Persona natural':'Individual','Sí':'Yes','No':'No','No sé':'Not sure','Datos básicos':'Basic data','Datos sensibles':'Sensitive data','Sin datos sensibles':'No sensitive data','Menos de 50':'Fewer than 50','Más de 100.000':'Over 100,000'},
 pt:{'Salud':'Saúde','Educación':'Educação','Financiero y seguros':'Finanças e seguros','Tecnología y telecom':'Tecnologia e telecomunicações','Servicios profesionales':'Serviços profissionais','Sí':'Sim','No':'Não','No sé':'Não sei'},
 fr:{'Salud':'Santé','Educación':'Éducation','Financiero y seguros':'Finance et assurances','Tecnología y telecom':'Technologie et télécommunications','Servicios profesionales':'Services professionnels','Sí':'Oui','No':'Non','No sé':'Je ne sais pas'}
};
function label(value){if(lang==='es')return value;return (tlLocaleCatalog[lang]||{})[value] || (nativeLabels[lang]||{})[value] || value;}

function localeDpoStatus(e){
 if(lang==='es')return e.w;
 const texts={en:{registered:'DPO registered; review remaining obligations',required:'A Data Protection Officer appears to be required',review:'Legal review recommended'},pt:{registered:'Encarregado registrado; revise as demais obrigações',required:'Tudo indica que deve nomear um Encarregado',review:'Recomenda-se uma revisão jurídica'},fr:{registered:'Délégué enregistré ; vérifiez les autres obligations',required:'La désignation d’un Délégué semble obligatoire',review:'Une analyse juridique est recommandée'}};
 const d=texts[lang]||texts.en;return e.ya==='si'?d.registered:e.corresponde?d.required:d.review;
}
function localeDpoSummary(e){
 if(lang==='es')return e.sub;
 const messages={
  en:{registered:'You report that a Data Protection Officer is already registered. Review the appointment, independence and remaining duties to maintain compliance.',direct:'Your answers describe activities explicitly covered by appointment criteria; the DPO requirement may apply regardless of the overall score.',sector:'Your organization operates in a sector covered by the appointment rules. Verify the relevant legal conditions and registration.',score:'The scale and nature of the processing indicate that DPO appointment may be required.',review:'The answers do not show an automatic appointment criterion, but they do not rule one out. Obtain an individualized legal review.'},
  pt:{registered:'Você informou que já possui um Encarregado registrado. Revise a nomeação, a independência e as demais obrigações.',direct:'As atividades informadas estão expressamente previstas nos critérios de nomeação; a obrigação pode existir independentemente da pontuação.',sector:'Sua organização atua em um setor abrangido pelas regras de nomeação. Confirme os requisitos e o registro.',score:'A escala e a natureza do tratamento indicam que a nomeação de um Encarregado pode ser necessária.',review:'As respostas não indicam obrigatoriedade automática, mas não permitem descartá-la. Solicite uma avaliação jurídica individualizada.'},
  fr:{registered:'Vous indiquez qu’un Délégué est déjà enregistré. Vérifiez sa désignation, son indépendance et les autres obligations.',direct:'Les activités déclarées figurent explicitement parmi les critères de désignation ; l’obligation peut s’appliquer indépendamment du score.',sector:'Votre organisation intervient dans un secteur visé par les règles de désignation. Vérifiez les conditions légales et l’enregistrement.',score:'L’ampleur et la nature des traitements peuvent nécessiter la désignation d’un Délégué.',review:'Les réponses ne révèlent pas de critère automatique, sans exclure toute obligation. Demandez une analyse juridique individualisée.'}
 };
 const m=messages[lang]||messages.en;
 return e.ya==='si'?m.registered:e.corresponde?(e.hits?.length?m.direct:e.secs?.length?m.sector:m.score):m.review;
}
function localeDiagnosticSummary(n){return lang==='es'?n.p:(tlLocaleOutcomes[lang]||tlLocaleOutcomes.en).dia_risk[Math.max(0,5-Number(n.t))]||'';}
function localeFine(v){
 if(lang==='es')return v;
 const up={en:'up to',pt:'até',fr:'jusqu’à'}[lang]||'up to';
 return String(v).replace(/USD\s*([\d.]+(?:,\d+)?)/g,(_,value)=>{
   const n=Number(value.replace(/\./g,'').replace(',','.'));
   return 'USD '+new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(n);
 }).replace(/^hasta\s+/i,up+' ').replace(/\s+a\s+(?=USD)/g,' – ');
}

const E=(tag,cls,content='')=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.innerHTML=content;return e;};
const unique=(key,val)=>{state.answers[key]=val;state.feedback='';render();};
function choiceBlock(key,title,options,multi=false,help=''){
 const el=E('fieldset','tl-question');
 const leg=E('legend','',esc(label(title)));el.append(leg);
 if(help)el.append(E('p','tl-question-hint',esc(label(help))));
 if(multi)el.append(E('p','tl-question-hint',esc(t.selectMany)));
 const grid=E('div','tl-choice-grid');const selected=state.answers[key]??(multi?[]:null);
 options.forEach((opt,i)=>{
   const value=opt.value??opt.v??opt.id??i;
   const checked=multi?selected.includes(value):selected===value;
   const button=E('button','tl-choice'+(checked?' is-picked':''));button.type='button';button.setAttribute('aria-pressed',String(checked));
   button.innerHTML='<span class="tl-choice-check" aria-hidden="true">'+(checked?'✓':'')+'</span><span class="tl-choice-content"><strong>'+esc(label(opt.text??opt.t??opt.l??value))+'</strong>'+(opt.description?'<small>'+esc(opt.description)+'</small>':'')+'</span>';
   button.addEventListener('click',()=>{if(multi){const next=new Set(selected); if(next.has(value))next.delete(value);else if(value==='__none__')next.clear(),next.add(value);else next.delete('__none__'),next.add(value);unique(key,[...next]);}else unique(key,value);});grid.append(button);
 });el.append(grid);return el;
}
function selectBlock(key,title,items){const group=E('div','tl-input-group');const labelTag=E('label','',esc(title));labelTag.htmlFor='input-'+key;group.append(labelTag);const select=E('select','tl-select');select.id='input-'+key;const placeholder=E('option','',esc(t.select));placeholder.value='';select.append(placeholder);items.forEach(o=>{const option=E('option','',esc(label(o.l??o.t??o.text)));option.value=o.v??o.value;select.append(option);});select.value=state.answers[key]??'';select.onchange=()=>unique(key,select.value);group.append(select);return group;}
const M=parametrosMultas,D=parametrosDelegado,G=parametrosDiagnostico;
function multasStep(i){const fragment=document.createDocumentFragment();
 if(i===0){fragment.append(selectBlock('sector',t.fields.sector,M.SECTORES));fragment.append(choiceBlock('persona',t.fields.persona,[{v:'juridica',t:'Empresa / organización'},{v:'natural',t:'Persona natural'}]));fragment.append(selectBlock('trab',t.fields.trab,M.TRAB));fragment.append(selectBlock('cli',t.fields.cli,M.CLI));const g=E('div','tl-input-group');const l=E('label','',esc(t.fields.vdn));l.htmlFor='turnover';g.append(l);const input=E('input','tl-input');input.id='turnover';input.type='number';input.min='0';input.step='any';input.inputMode='decimal';input.placeholder=lang==='es'?'Ej.: 150000':lang==='en'?'E.g. 150000':lang==='pt'?'Ex.: 150000':'Ex. : 150000';input.value=state.answers.vdn??'';input.oninput=()=>{state.answers.vdn=input.value;state.feedback='';};g.append(input);fragment.append(g);}
 if(i===1){const opts=M.MTGE.titulares.o.map(o=>({v:o.v,t:o.l}));fragment.append(choiceBlock('titulares',t.fields.titulares,opts));fragment.append(choiceBlock('categorias',t.fields.categorias,M.MTGE.categorias.o.map(o=>({v:o.v,t:o.l}))));fragment.append(choiceBlock('incidente',t.fields.incidente,[{v:'no',t:'No'},{v:'si',t:'Sí'},{v:'nose',t:'No estoy seguro'}]));fragment.append(choiceBlock('spdp',t.fields.spdp,[{v:'ninguno',t:'Ninguno'},{v:'requerimiento',t:'Requerimiento de información'},{v:'medidas',t:'Medidas correctivas'},{v:'sancion',t:'Sanción previa'}]));}
 if(i===2)fragment.append(choiceBlock('cumple',t.fields.cumple,[{value:'__none__',text:t.none},...M.DUTIES.map(o=>({value:o.id,text:o.n}))],true));return fragment;}
function delegadoStep(i){const fragment=document.createDocumentFragment();if(i===0){fragment.append(choiceBlock('sec',t.fields.sec,[{value:'__none__',text:t.none},...D.SEC.map(x=>({value:x.id,text:x.t}))],true));fragment.append(choiceBlock('dir',t.fields.dir,[{value:'__none__',text:t.none},...D.DIR.map(x=>({value:x.id,text:x.t}))],true));}
 if(i===1){for(const dim of D.DIM){if(dim.id==='cam')fragment.append(choiceBlock('cam',t.fields.cam,D.CAM.map(x=>({value:x.id,text:x.t})),true));else fragment.append(choiceBlock(dim.id,dim.q,dim.o.map((o,i)=>({value:i,text:o.t})),false,dim.h));}}
 if(i===2){fragment.append(choiceBlock('fac',t.fields.fac,D.FAC.map(x=>({value:x.v,text:x.t}))));fragment.append(choiceBlock('ya',t.fields.ya,D.YA.map(x=>({value:x.v,text:x.t}))));}return fragment;}
const diaQuestions=G.QUESTIONS;
function diagnosticQuestions(){const bio=(state.answers.disp||[]).some(i=>G.QUESTIONS.find(q=>q.id==='disp').options[i]?.tag==='bio'||G.QUESTIONS.find(q=>q.id==='disp').options[i]?.tag==='audio'||G.QUESTIONS.find(q=>q.id==='disp').options[i]?.tag==='geo');return diaQuestions.filter(q=>q.id!=='dpd'||bio);}
function diagnosticStep(i){const q=diagnosticQuestions()[i];if(!q)return E('div','','');return choiceBlock(q.id,q.text,q.options.map((o,i)=>({value:i,text:o.text})),q.multi);}
function stageCount(){return tool==='diagnostico'?diagnosticQuestions().length:3;}
function stageReady(){const a=state.answers;if(tool==='multas')return [()=>a.sector&&a.persona&&a.trab&&a.cli&&a.vdn!==undefined&&a.vdn!==''&&Number(a.vdn)>=0,()=>['titulares','categorias','incidente','spdp'].every(k=>a[k]!==undefined),()=>Array.isArray(a.cumple)][state.stage]();
 if(tool==='delegado')return [()=>Array.isArray(a.sec)&&Array.isArray(a.dir),()=>Array.isArray(a.cam)&&a.cam.length>0&&['tit','fre','per','alc'].every(k=>a[k]!==undefined),()=>a.fac!==undefined&&a.ya!==undefined][state.stage]();
 const q=diagnosticQuestions()[state.stage];return q&&a[q.id]!==undefined&&(!q.multi||a[q.id].length>0);}
function getInput(){const a=state.answers;if(tool==='multas')return {...a,vdn:Number(a.vdn),cumple:(a.cumple||[]).filter(x=>x!=='__none__')};
 if(tool==='delegado'){const s={...a};s.sec=(s.sec||[]).filter(x=>x!=='__none__');s.dir=(s.dir||[]).filter(x=>x!=='__none__');for(const dim of D.DIM){if(dim.id!=='cam'&&s[dim.id]!==undefined)s[dim.id]=dim.o[s[dim.id]];}s.fac=D.FAC.find(x=>x.v===a.fac)||null;return s;}
 return respuestasDiagnosticoDesdeIndices(a);}
function action(){if(!stageReady()){state.feedback=t.required;render();return;}if(state.stage<stageCount()-1){state.stage++;state.feedback='';render();return;}state.finished=true;state.feedback='';render();}
function showResult(container){let r;try{r=tool==='multas'?calcularMultas(getInput()):tool==='delegado'?calcularDelegado(getInput()):calcularDiagnostico(getInput());}catch(e){container.append(E('p','tl-error',esc(lang==='es'?e.message:lang==='en'?'Unable to calculate. Please check your answers.':lang==='pt'?'Não foi possível calcular. Verifique suas respostas.':'Calcul impossible. Veuillez vérifier vos réponses.')));return;}
 container.append(E('p','tl-kicker',esc(t.done)));
 container.append(E('h2','tl-result-title',esc(t.result)));
 const stats=E('div','tl-stats');const add=(name,value)=>stats.append(E('div','tl-stat','<small>'+esc(name)+'</small><strong>'+esc(value)+'</strong>'));
 if(tool==='multas'){
  add(t.stat[0],r.score+'%');add(t.stat[1],r.gaps.length);add(t.stat[2],money(r.total.prob));container.append(stats);
  container.append(E('p','tl-result-summary',esc(t.range)+': '+money(r.total.min)+' – '+money(r.total.max)+'. '+esc(t.notice)));
  const list=E('div','tl-findings');r.gaps.slice(0,15).forEach(x=>list.append(E('article','tl-finding','<span class="tl-finding-category">'+esc(label(x.cat))+'</span><h3>'+esc(label(x.n))+'</h3><p>'+esc(label(x.acc))+'</p>')));container.append(E('h3','tl-section-title',esc(t.pending)));container.append(list);
 } else if(tool==='delegado'){
  add(t.risk,localeDpoStatus(r.evaluacion));add(t.score,String(r.evaluacion.total));add(t.range,localeFine(r.multa.v||'—'));container.append(stats);container.append(E('p','tl-result-summary',esc(localeDpoSummary(r.evaluacion))+' '+esc(t.notice)));
  const list=E('div','tl-findings');r.obligaciones.forEach(x=>list.append(E('article','tl-finding','<h3>'+esc(label(x.h))+'</h3><p>'+esc(label(x.p))+'</p>')));container.append(E('h3','tl-section-title',esc(t.recommend)));container.append(list);
 }else{
  if(!r.completo){container.append(E('p','tl-error',esc(t.incomplete)+' '+r.faltantes.map(id=>label((G.QUESTIONS.find(q=>q.id===id)||{}).text||id)).join(', ')));return;}
  add(t.risk,label(r.nivel.r));add(t.score,String(r.puntaje));add(t.pending,String(r.infracciones.length));container.append(stats);container.append(E('p','tl-result-summary',esc(localeDiagnosticSummary(r.nivel))+' '+esc(t.notice)));
  if(r.montos.min!==null)container.append(E('p','tl-money-range',esc(t.range)+': '+money(r.montos.min)+' – '+money(r.montos.max)));
  const list=E('div','tl-findings');r.infracciones.forEach(x=>list.append(E('article','tl-finding','<h3>'+esc(label(x.t))+'</h3><p>'+esc(x.a)+'</p>')));container.append(E('h3','tl-section-title',esc(t.recommend)));container.append(list);
 }
 const reset=E('button','tl-button tl-button-primary',esc(t.restart));reset.type='button';reset.onclick=()=>{state.stage=0;state.finished=false;state.answers={};state.feedback='';render();};container.append(reset);
}
function render(){mount.innerHTML='';const top=E('section','tl-calc-hero');top.append(E('p','tl-kicker',esc(t.badge)));top.append(E('h1','',esc(t.titles[tool])));top.append(E('p','tl-calc-lead',esc(t.sub[tool])));mount.append(top);
 const panel=E('section','tl-calc-panel');if(state.finished){showResult(panel);mount.append(panel);panel.scrollIntoView({behavior:'smooth',block:'start'});return;}
 const total=stageCount();const step=state.stage;const progress=E('div','tl-progress-row');progress.append(E('span','',esc(t.progress)));progress.append(E('strong','',(step+1)+' / '+total));panel.append(progress);
 const track=E('div','tl-progress-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label',t.progress);track.setAttribute('aria-valuenow',String(step+1));track.setAttribute('aria-valuemax',String(total));track.setAttribute('aria-valuemin','0');const fill=E('span','tl-progress-fill');fill.style.width=((step+1)/total*100)+'%';track.append(fill);panel.append(track);
 const title=tool==='diagnostico'?diagnosticQuestions()[step]?.text:t.steps[tool][step];panel.append(E('h2','tl-step-title',esc(label(title||''))));
 const form=E('div','tl-form');form.append(tool==='multas'?multasStep(step):tool==='delegado'?delegadoStep(step):diagnosticStep(step));panel.append(form);
 if(state.feedback){const f=E('p','tl-error',esc(state.feedback));f.setAttribute('role','alert');panel.append(f);}
 const actions=E('div','tl-actions');if(step>0){const back=E('button','tl-button tl-button-secondary',esc(t.previous));back.type='button';back.onclick=()=>{state.stage--;state.feedback='';render();};actions.append(back);}
 const next=E('button','tl-button tl-button-primary',esc(step===total-1?t.calculate:t.next)+'  ↗');next.type='button';next.onclick=action;actions.append(next);panel.append(actions);mount.append(panel);
}
render();

} catch(error) { console.error("TempoLegal calculator failed to load",error);const target=document.getElementById("tl-calculator-app"); if(target){const warning=document.createElement("div");warning.setAttribute("role","alert");warning.className="tl-calc-error-fallback";warning.textContent="No se pudo cargar la calculadora. Recargue la página o abra el sitio mediante un servidor local. / The calculator could not be loaded. Please reload the page.";target.append(warning);} }
