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

export const parametrosMultas = Object.freeze({RATES,SECTORES:PERFIL_SECTOR,TRAB,CLI,DUTIES,MTGE,SERVICIOS});
export function calcularMultas(entradas,{modo="rapido"}={}) {
 if(!entradas || typeof entradas!=="object") throw new TypeError("Se requieren entradas estructuradas");
 if(!Number.isFinite(entradas.vdn) || entradas.vdn<0) throw new RangeError("vdn debe ser una cifra anual no negativa");
 return compute({...entradas, cumple:[...(entradas.cumple||[])]}, modo === "detalle" ? "detalle" : "rapido");
}
