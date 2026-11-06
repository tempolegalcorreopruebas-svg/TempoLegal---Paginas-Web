
/* ============================== RESULTADO ============================== */
const VARS=[
  {k:"pT",max:4,c:"--s1",t:"De cuánta gente tiene datos",  d:()=>S.tit?S.tit.t:"sin marcar"},
  {k:"pV",max:3,c:"--s2",t:"Cuántos datos distintos guarda",  d:R=>R.vL},
  {k:"pC",max:3,c:"--s3",t:"Qué tan delicados son",        d:R=>R.cL},
  {k:"pF",max:2,c:"--s4",t:"Cada cuánto le entran",        d:()=>S.fre?S.fre.t:"sin marcar"},
  {k:"pP",max:2,c:"--s5",t:"Cuánto tiempo los guarda",     d:()=>S.per?S.per.t:"sin marcar"},
  {k:"pA",max:3,c:"--s6",t:"Hasta dónde llegan",           d:()=>S.alc?S.alc.t:"sin marcar"}
];

function pintar(R){
  const M=multa(S), C=comparacion(S,R), I=inversion(R), OB=obligaciones(S,R);
  let h="", d=0;
  const step=()=>`style="animation-delay:${(d++)*40}ms"`;

  /* 1. Veredicto con color, con el "por qué" adentro */
  let porque="";
  if(R.tier!=="ok" && R.corresponde) porque=`<p>${R.vias.length?"Por lo que marcó, "+R.vias.join(", y ")+".":esc(R.sub)}</p>`;
  else porque=`<p>${esc(R.sub)}</p>`;
  h += `<div class="rev" ${step()}><div class="hood ${R.tier}">
    <div class="k">Su resultado · estimación referencial, no es asesoría legal</div><h2>${esc(R.w)}</h2>${porque}</div></div>`;

  /* 2. Delegado inscrito: pantalla verde propia */
  if(R.tier==="ok"){
    h += `<div class="rev" ${step()}><div class="disc">Estimación referencial · no es asesoría legal</div><div class="key g">
      <h3>${M.ok?"Lo que se está ahorrando":"Lo que ya tiene resuelto"}</h3>
      <p>Tener Delegado nombrado e inscrito es justo lo que evita una de las faltas graves más fáciles de probar. ${M.ok?`En su tramo, una sola falta así podría costarle <b class="num">${M.v}</b>.`:``}</p>
      <p>Ahora toca sostenerlo, porque el cumplimiento se vence solo cuando entra un sistema nuevo, un proveedor nuevo o una cámara nueva. Y tener Delegado no lo blinda contra la demanda de una persona afectada ni contra el hábeas data, el juicio rápido para que muestre, corrija o borre datos.</p>
      <span class="ref">${esc(N.d28)} · ${esc(N.hd)}</span></div></div>`;
  }
  if(R.tier==="rev"){
    h += `<div class="rev" ${step()}><div class="key w">
      <h3>Esto no quiere decir que no le toque</h3>
      <p>Con ocho pasos no se determina si a usted le corresponde Delegado. Eso depende de qué hace exactamente con los datos, si los cruza, si los cede, si los saca del país, si arma perfiles, y de la actividad precisa de su RUC. Nada de eso se puede leer desde aquí.</p>
      <p>Lo que sí sabemos es que, si al revisarlo resulta que le corresponde, se le abren <b>cuatro frentes a la vez</b>. Están más abajo.</p>
      <p>${R.cerca?"Y está cerca del punto desde el que la norma exige Delegado. Una cámara apuntando a la vereda, un reloj de huella o pasar la información a la nube lo pasan al otro lado de un solo golpe.":"Esto cambia rápido. Una cámara apuntando a la vereda, un reloj de huella o pasar la información a la nube lo cambian de un solo golpe."}</p>
      <span class="ref">${esc(N.dpd48)} · ${esc(N.d10)}</span></div></div>`;
  }

  /* 3. La cifra */
  if(R.tier!=="ok"){
    h += `<div class="rev" ${step()}><div class="lbl">Lo que está en juego</div>`;
    if(M.ok){
      h += `<div class="money">
        <div class="disc">Estimación referencial · no es asesoría legal</div>
        <div class="money-t">${R.tier==="rev"?"Si resulta que le corresponde, lo que le podrían cobrar por <b>una</b> falta grave":"Lo que le pueden cobrar por <b>una</b> falta grave"}</div>
        <div class="money-v">${esc(M.v)}</div>
        <div class="money-f">${M.f}</div>
        <div class="money-f"><b>Y son faltas distintas.</b> No tener Delegado, no hacer el estudio de riesgos que pide la ley (la evaluación de impacto) y no inscribir sus bases de datos en el registro público de la autoridad se pueden sancionar por separado.</div>
        <div class="prec"><h4>Ya está pasando en Ecuador</h4>
          <span class="big">${usd(CONFIG.SANCION.total)}</span>
          <p>Es lo que suman las ${CONFIG.SANCION.casos} multas puestas a ${CONFIG.SANCION.verificado}, todas a ${CONFIG.SANCION.entidades}. A las dos primero les pidieron información, les visitaron las oficinas y les ordenaron corregir. El camino habitual hacia una multa es una denuncia en línea, y cualquiera puede ponerla desde el celular.</p>
          ${CONFIG.SANCION.detalle.length?`<p>${CONFIG.SANCION.detalle.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.numero)}</a>`).join(" · ")}</p>`:``}</div>
        <span class="ref">${esc(M.ref)}</span></div>`;
    }else{
      h += `<div class="pend"><b>Todavía no le mostramos ninguna cifra.</b> ${M.f} Preferimos dejarlo en blanco antes que inventarle un número. <button type="button" class="lnk" id="ir-fac">Volver a esa pregunta</button></div>`;
    }
    h += `</div>`;
  }

  /* 4. Qué hacer */
  h += `<div class="rev" ${step()}><div class="lbl">${R.tier==="ok"?"Lo que le toca para sostenerlo":"Qué hacer, en este orden"}</div>`;
  if(R.tier!=="ok"){
    const sale = R.corresponde ? "De ahí sale cuál de las tareas de abajo le urge más y en qué orden conviene resolverlas." : "De ahí sale si le toca Delegado, cuál de las tareas de abajo le aplica y en qué orden conviene resolverlas.";
    h += `<div class="ob" style="border-left-color:var(--brand)"><h4>Primero, hable con un abogado</h4><p>Antes de comprar documentos o de nombrar a alguien, hay que ver qué maneja usted de verdad. Esa primera conversación no tiene costo. ${sale}</p></div>`;
  }
  h += OB.map(o=>`<div class="ob ${o.c}"><h4>${esc(o.h)}</h4><p>${o.p}</p><span class="ref">${esc(o.r)}</span></div>`).join("")+`</div>`;

  /* 5. El regalo. Punto de conversión 1 de 3. */
  h += `<div class="rev" ${step()}>` + (S._lead ? gracias() : formulario()) + `</div>`;

  /* 6. Las dos cifras */
  if(C.ok){
    const kA = R.tier==="rev" ? "Si resulta que le corresponde, por una sola falta grave" : "Si no hace nada, por una sola falta grave";
    const kB = R.tier==="rev" ? "Lo que cuesta salir de dudas por escrito" : "Lo que cuesta "+esc(C.I.que);
    const fB = R.tier==="rev" ? "Auditoría, un solo pago." : (C.I.meses?"Implementación en un pago, más doce meses de Delegado.":"Un solo pago.");
    h += `<div class="rev" ${step()}><div class="lbl">Las dos cifras</div>
    <div class="disc">Estimación referencial · no es asesoría legal</div>
    ${C.mult>=2?`<div class="cmp">
      <div class="a"><div class="k">${kA}</div><div class="n">${esc(C.M.v)}</div><div class="f">Y sin contar la demanda ni el hábeas data.</div></div>
      <div class="b"><div class="k">${kB}</div><div class="n">${esc(C.I.txt)} + IVA</div><div class="f">${fB}</div></div>
    </div>`:``}
    <p style="font-size:15.5px;color:var(--ink-2);margin-bottom:14px">${C.txt}${C.mult<2?" Y si le ordenan borrar la información, la operación se le para hasta que la vuelva a levantar.":""}</p></div>`;
  }

  /* 7. Los cuatro frentes */
  if(R.tier!=="ok"){
    h += `<div class="rev" ${step()}><div class="lbl">Los cuatro frentes</div>
    <p style="font-size:15.5px;color:var(--ink-2);margin-bottom:11px">Además de la multa, la persona afectada puede demandarlo, ir directo a un juez y denunciarlo penalmente, y puede hacer las tres cosas a la vez.<span class="ref">${esc(N.r90)} · ${esc(N.a64)}</span></p>
    <div class="fr">
      <div class="fr-i fr-1"><div class="fr-b">1</div><div><h4>La multa</h4><p>Hasta el 1 % de lo que factura por cada falta. Y además le pueden ordenar parar el manejo de datos, avisar a cada afectado y borrar la información.</p><span class="ref">${esc(N.s_grave)}</span></div></div>
      <div class="fr-i fr-2"><div class="fr-b">2</div><div><h4>La demanda</h4><p>La persona afectada puede demandarle los perjuicios, incluido el daño moral. Es plata aparte de la multa, va a manos del afectado y la ley no le pone un tope fijo.</p><span class="ref">${esc(N.civ)}</span></div></div>
      <div class="fr-i fr-3"><div class="fr-b">3</div><div><h4>El hábeas data</h4><p>Es un juicio rápido para obligarle a mostrar, corregir o borrar los datos de una persona. Ella lo presenta sobre sus propios datos, también contra una empresa privada, y lo resuelve un juez, no la autoridad de datos.</p><span class="ref">${esc(N.hd)}</span></div></div>
      <div class="fr-i fr-4"><div class="fr-b">4</div><div><h4>Lo penal</h4><p>Revelar una base de datos es delito, con uno a tres años de cárcel, y de tres a cinco si lo hace un funcionario público o un empleado de banco. La empresa también puede responder penalmente en los casos que la ley prevé, y el gerente o administrador responde por separado, por su propia conducta.</p><span class="ref">${esc(N.coip)}</span></div></div>
    </div></div>`;
  }

  /* 8. Puntaje, plegado salvo cuando decide */
  if(R.listo){
    const abierto = R.tier==="rev" ? " open" : "";
    h += `<div class="rev" ${step()}><details class="det"${abierto}><summary>Ver de dónde sale su puntaje (${p1(R.total)} de 17)</summary>
      <div class="disc" style="margin-top:10px">Estimación referencial · no es asesoría legal</div><div class="bars">`+
      VARS.map(v=>{
        const val=R[v.k], w=Math.max(3,val/v.max*100);
        const col = val>=v.max ? "var(--critical)" : val>=v.max/2 ? "var(--serious)" : "var(--warning)";
        return `<div class="bar">
          <div class="bar-t"><b>${v.t}<small>${esc(typeof v.d==="function"?v.d(R):"")}</small></b><span class="v num">${p1(val)} / ${v.max}</span></div>
          <div class="bar-r"><i style="--w:${w}%;background:${col}"></i></div></div>`;
      }).join("")+
      `<div class="bar-sum"><span>Total</span><span class="num">${p1(R.total)} de 17</span></div></div>
      <span class="ref">${esc(N.a10)}. Desde 6 puntos la norma considera que usted maneja muchos datos y le exige Delegado. Estar debajo de 6 no lo deja fuera. La obligación también llega por lo que hace con los datos, y eso no se ve en este puntaje.</span></details></div>`;
  }

  /* 9. Honorarios */
  h += `<div class="rev" ${step()}><div class="lbl">Lo que cobramos</div>`;
  if(R.corresponde && R.tier!=="ok"){
    const med = S.ya==="med";
    h += `<div class="pr main"><span class="pr-tag">${med?"Si prefiere que lo asumamos nosotros":"Lo que normalmente corresponde en su caso"}</span><h4>Delegado de Protección de Datos externo</h4><div class="pr-v">desde ${usd2(CONFIG.P.delegadoMes)} + IVA/mes</div><p>Asumimos el cargo y lo inscribimos en la Superintendencia.</p></div>
    <div class="pr${med?" main":""}"><h4>Implementación LOPDP${med?" e inscripción de su Delegado":""}</h4><div class="pr-v">desde ${usd2(CONFIG.P.implementacion)} + IVA, pago único</div><p>Incluye registro de actividades, políticas, avisos, cláusulas y contratos con proveedores${med?", y la inscripción de la persona que usted ya nombró":""}. En 8 a 12 días está implementado y auditado. El alcance exacto se fija por escrito antes de empezar.</p></div>`;
  }else{
    h += `<div class="pr"><h4>${R.tier==="ok"?"Auditoría de mantenimiento":"Auditoría de cumplimiento"}</h4><div class="pr-v">desde ${usd2(CONFIG.P.auditoria)} + IVA, pago único</div><p>Revisamos cómo está hoy de verdad y le entregamos los hallazgos ordenados por urgencia. Sirve para saber por dónde empezar sin comprarlo todo de una.</p></div>`;
  }
  h += `<p style="font-size:14.5px;color:var(--muted-text)">Son precios de partida. El suyo depende de cuántos sistemas, cuánta gente y cuántos proveedores haya de por medio, y se lo cerramos por escrito antes de que firme nada.</p></div>`;

  /* 10. Cierre. Punto de conversión 3 de 3. */
  h += `<div class="rev" ${step()}><div class="cta">
    <h3>${R.tier==="ok"?"¿Lo revisamos juntos?":"Hable con un abogado, sin costo"}</h3>
    <p>${R.tier==="ok"
      ? "Como ya tiene Delegado inscrito, lo que conviene ahora es una revisión para confirmar que el registro de actividades y los contratos con proveedores estén al día."
      : "Somos el Delegado de Protección de Datos de más de 60 organizaciones y hemos implementado el sistema en más de 130 compañías y personas naturales. En una primera conversación, normalmente de quince minutos y sin costo, le orientamos sobre por dónde empezar."}</p>
    <button class="btn wa full" id="wa" type="button">Conversar con un abogado por WhatsApp</button>
  </div></div>`;

  $("res").innerHTML=h;
  cablear(R);
}

function formulario(){
  return `<div class="gift" id="gift">
    <h3>Le mandamos la lista completa por escrito</h3>
    <p class="gl">Gratis, con su resultado explicado y el artículo de la ley en cada punto.</p>
    <ul>
      <li>Qué le corresponde y de dónde sale, norma por norma</li>
      <li>Qué le sube el riesgo sin que usted se dé cuenta</li>
      <li>El paso a paso, y qué parte puede hacer usted mismo</li>
      <li>Qué perfil debe tener el Delegado y cómo se lo inscribe</li>
    </ul>
    <div class="err" id="gerr" role="alert"></div>
    <label class="lab" for="g-wa">WhatsApp</label>
    <input type="tel" id="g-wa" placeholder="09 y ocho números más" autocomplete="tel" inputmode="tel">
    <label class="lab" for="g-nom">Nombre y apellido</label>
    <input type="text" id="g-nom" autocomplete="name">
    <label class="lab" for="g-org">Organización <span>opcional</span></label>
    <input type="text" id="g-org" autocomplete="organization">
    <label class="lab" for="g-car">Su cargo <span>opcional</span></label>
    <input type="text" id="g-car" autocomplete="organization-title">
    <label class="lab" for="g-mail">Correo <span>si prefiere recibirlo por ahí</span></label>
    <input type="email" id="g-mail" autocomplete="email" inputmode="email">
    <label class="chk"><input type="checkbox" id="g-ok"><span>Autorizo a TempoLegal a enviarme este documento y a escribirme por WhatsApp o correo sobre mi caso.</span></label>
    <button class="btn full" id="g-send" type="button">Enviarme el informe</button>
    <p class="aviso"><b>Quién usa sus datos:</b> ${esc(CONFIG.RESPONSABLE)}. <b>Para qué:</b> enviarle el documento y conversar sobre su caso, junto con sus respuestas de este cuestionario. <b>Con qué permiso:</b> su autorización, que puede retirar cuando quiera. <b>Hasta cuándo:</b> mientras dure el contacto comercial y los plazos legales que nos apliquen. <b>Quién más los ve:</b> usamos proveedores de correo y almacenamiento, algunos fuera del Ecuador. <b>Para ver, corregir o borrar sus datos:</b> escriba a ${CONFIG.EMAIL}. El detalle está en la <a href="${CONFIG.PRIVACIDAD}" target="_blank" rel="noopener">política de privacidad</a>.</p>
  </div>`;
}

function gracias(){
  return `<div class="gift"><h3>Listo, ${esc(S._lead.nombre.split(" ")[0])}</h3>
    <p class="gl">Le enviamos el informe completo, normalmente el mismo día hábil.</p>
    ${CONFIG.LEAD_ENDPOINT?'':`<a class="btn wa full" style="margin:4px 0 10px" target="_blank" rel="noopener"
      href="https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent('Hola, soy '+S._lead.nombre+(S._lead.organizacion?' de '+S._lead.organizacion:'')+'. Dejé mis datos en la calculadora de Delegado y quiero mi informe.')}">Asegurar mi informe por WhatsApp</a>`}
    <p style="font-size:15px">Un abogado del equipo le va a escribir, normalmente el mismo día hábil. Le hará tres o cuatro preguntas cortas sobre sus sistemas y sus proveedores, y con eso le arma una propuesta con precio cerrado. Solo le escribiremos sobre su caso, y puede pedirnos que dejemos de hacerlo cuando quiera. Si prefiere no esperar, toque el botón verde de abajo.</p></div>`;
}

function cablear(R){
  const wa=$("wa"); if(wa) wa.onclick=()=>{ TL.track("cta",{lugar:"cierre"}); abrirWA(R); };
  const irf=$("ir-fac"); if(irf) irf.onclick=()=>{ verResultado=false; $("res").classList.remove("on"); $("res").innerHTML="";
    $("stage").style.display=""; $("rail").style.display=""; iPaso=visibles().findIndex(p=>p.id==="fac"); pintarPaso(); irArriba(); };
  const send=$("g-send"); if(send) send.onclick=()=>enviar(R);
}

function abrirWA(R){
  const partes=["Hola, hice la calculadora de Delegado de TempoLegal."];
  partes.push(R.tier==="ok" ? "Ya tengo Delegado inscrito y quisiera revisar lo demás."
            : R.corresponde ? (S.ya==="med" ? "Tengo Delegado nombrado pero no inscrito y me sale que me corresponde." : "Me sale que probablemente me corresponde nombrar Delegado.")
            : "Me sale por revisar y quisiera confirmarlo.");
  if(S._lead && S._lead.organizacion) partes.push("Soy de "+S._lead.organizacion+".");
  try{ if(window.fbq) window.fbq("track","Contact"); }catch(e){}
  window.open("https://wa.me/"+CONFIG.WHATSAPP+"?text="+encodeURIComponent(partes.join(" ")),"_blank","noopener");
}

function waValido(v){ const d=v.replace(/\D/g,""); return /^(0?9\d{8}|5939\d{8})$/.test(d); }
function mailValido(v){ return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v); }
function enviar(R){
  if(!$("g-send") || S._lead) return;
  const nom=$("g-nom").value.trim(), org=$("g-org").value.trim(), car=$("g-car").value.trim(),
        wa=$("g-wa").value.trim(), mail=$("g-mail").value.trim(), ok=$("g-ok").checked;
  const err=$("gerr"); let msg="", foco=null;
  if(!nom){ msg="Nos falta su nombre."; foco="g-nom"; }
  else if(!wa && !mail){ msg="Déjenos un WhatsApp o un correo para enviarle la lista."; foco="g-wa"; }
  else if(wa && !waValido(wa)){ msg="Ese WhatsApp no parece un número ecuatoriano. Son diez dígitos y empiezan con 09."; foco="g-wa"; }
  else if(mail && !mailValido(mail)){ msg="Ese correo no parece completo."; foco="g-mail"; }
  else if(!ok){ msg="Falta marcar la autorización para enviarle el documento."; foco="g-ok"; }
  ["g-nom","g-wa","g-mail","g-ok"].forEach(id=>{ const el=$(id); if(el) el.removeAttribute("aria-invalid"); });
  if(msg){ err.textContent=msg; err.classList.add("on"); const el=$(foco); if(el){ el.setAttribute("aria-invalid","true"); el.focus(); } return; }
  const lead={nombre:nom, organizacion:org, cargo:car, whatsapp:wa, correo:mail, canal: wa?"whatsapp":"correo",
    nivel:R.tier, corresponde:R.corresponde, puntos:R.total,
    tipo:S.tipo||null, facturacion:S.fac?S.fac.t:null, titulares:S.tit?S.tit.t:null,
    sectores:[...S.sec], supuestos:[...S.dir], yaDelegado:S.ya,
    url:location.href, utm:TL.utm, fecha:new Date().toISOString()};
  S._lead=lead; guardar(lead);
  TL.track("lead",{canal:lead.canal, nivel:R.tier, value:R.tier==="si"?CONFIG.P.implementacion+CONFIG.P.delegadoMes*12:CONFIG.P.auditoria, currency:"USD"});
  const g=$("gift"); if(g){ g.outerHTML=gracias(); const n=$("res").querySelector(".gift"); if(n) n.scrollIntoView({behavior:"smooth",block:"center"}); }
}

function guardar(lead){
  if(CONFIG.LEAD_ENDPOINT){
    try{ fetch(CONFIG.LEAD_ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({herramienta:"Calculadora de Delegado",version:"V3"},lead)),keepalive:true}).catch(()=>{}); }catch(e){}
  }else{
    console.warn("[TempoLegal] CONFIG.LEAD_ENDPOINT está vacío. Este lead NO se guardó en ningún lado. Configúrelo antes de publicar.");
  }
}

/* ------------------------ Rescate de abandono ------------------------ */
function rescatar(){
  if(rescatado || !tocado || verResultado) return;
  rescatado=true;
  const faltan=visibles().length-(iPaso+1);
  const rp=$("rescue-p"); if(rp && faltan>0) rp.textContent=`Le ${faltan===1?"falta una pregunta":"faltan "+faltan+" preguntas"}. Déjenos un WhatsApp o un correo y le mandamos lo que lleva hasta aquí, con lo que le tocaría hacer.`;
  $("rescue").classList.add("on"); $("r-canal").focus();
  TL.track("abandono",{paso:iPaso+1});
}
document.addEventListener("mouseout",e=>{ if(!e.relatedTarget && e.clientY<=0) rescatar(); });
let ocultaDesde=0;
document.addEventListener("visibilitychange",()=>{ if(document.hidden) ocultaDesde=Date.now(); else if(ocultaDesde && Date.now()-ocultaDesde>20000) rescatar(); });
$("r-mail").textContent=CONFIG.EMAIL; $("r-resp").textContent=CONFIG.RESPONSABLE;
function cerrarRescate(){ $("rescue").classList.remove("on"); }
$("r-no").onclick=cerrarRescate;
$("rescue").addEventListener("click",e=>{ if(e.target===$("rescue")) cerrarRescate(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && $("rescue").classList.contains("on")) cerrarRescate(); });
$("r-go").onclick=()=>{
  const c=$("r-canal").value.trim(), ok=$("r-ok").checked, err=$("rerr"), esMail=/@/.test(c);
  let msg="";
  if(!c) msg="Déjenos un WhatsApp o un correo.";
  else if(esMail && !mailValido(c)) msg="Ese correo no parece completo.";
  else if(!esMail && !waValido(c)) msg="Ese WhatsApp no parece un número ecuatoriano. Son diez dígitos y empiezan con 09.";
  else if(!ok) msg="Falta marcar la autorización.";
  if(msg){ err.textContent=msg; err.classList.add("on"); return; }
  const R=evaluar(S);
  const lead={nombre:"(rescate)",organizacion:"",cargo:"",whatsapp:esMail?"":c,correo:esMail?c:"",
    canal:esMail?"correo":"whatsapp", nivel:R.tier, corresponde:R.corresponde, puntos:R.total,
    parcial:true, paso:iPaso+1, url:location.href, utm:TL.utm, fecha:new Date().toISOString()};
  guardar(lead);
  TL.track("lead_parcial",{canal:lead.canal, paso:iPaso+1});
  $("rescue").querySelector(".rescue-box").innerHTML=`<h3>Listo</h3><p>Le escribimos normalmente el mismo día hábil con lo que lleva hasta aquí. Si quiere, siga contestando y el resultado sale completo.</p><button class="btn full" id="r-fin" type="button">Seguir contestando</button>`;
  $("r-fin").onclick=cerrarRescate;
};

/* ------------------------------ Arranque ------------------------------ */
TL.track("inicio",{});
pintarPaso();
const _em=document.getElementById('empezar');
if(_em) _em.onclick=()=>{ TL.track("inicio",{desde:"hero"}); irArriba(); };
