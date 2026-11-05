/**
 * TempoLegal · Captura de contactos de las herramientas LOPDP · V1 · 2026-10-29
 *
 * Recibe los datos que dejan las personas en:
 *   - Calculadora de multas LOPDP
 *   - Calculadora de Delegado de Protección de Datos
 *   - Diagnóstico LOPDP
 * Guarda cada contacto en la hoja "Leads" y avisa por correo a info@tempolegal.com.
 *
 * Instalación (10 minutos, ver GUIA-PUBLICACION):
 *   1. Crear una hoja de cálculo de Google: "TempoLegal · Leads herramientas LOPDP".
 *   2. Extensiones > Apps Script. Borrar lo que haya y pegar este archivo completo.
 *   3. Implementar > Nueva implementación > Tipo: Aplicación web.
 *        Ejecutar como: Yo.   Quién tiene acceso: Cualquier usuario.
 *   4. Autorizar los permisos que pida Google.
 *   5. Copiar la URL que termina en /exec y pegarla en las tres herramientas.
 */

const CORREO_AVISO = 'info@tempolegal.com';
const HOJA = 'Leads';
const COLUMNAS = ['Fecha', 'Herramienta', 'Versión', 'Nombre', 'Organización', 'Cargo', 'Canal',
  'WhatsApp', 'Correo', 'Contacto (rescate)', 'Solo dejó el contacto', 'Resultado', 'Consentimiento',
  'Página', 'Datos completos'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const hoja = obtenerHoja_();
    const fila = [
      new Date(),
      d.herramienta || '',
      d.version || '',
      d.nombre || '',
      d.organizacion || '',
      d.cargo || '',
      d.canal || '',
      d.whatsapp || '',
      d.correo || '',
      d.contacto || '',
      d.parcial ? 'Sí' : 'No',
      resumen_(d),
      d.consentimiento === true || d.consentimiento === undefined ? 'Sí, autorizó en el formulario' : String(d.consentimiento),
      d.url || '',
      JSON.stringify(d)
    ].map(limpiar_);
    hoja.appendRow(fila);
    avisar_(d);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

/* Para probar que la URL responde: abrirla en el navegador debe mostrar "TempoLegal leads ok". */
function doGet() {
  return ContentService.createTextOutput('TempoLegal leads ok');
}

function obtenerHoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA);
  if (!hoja) hoja = libro.insertSheet(HOJA);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold');
  }
  return hoja;
}

/* Una línea legible con lo que salió en la herramienta. */
function resumen_(d) {
  const p = [];
  if (d.multa !== undefined) p.push('Multa estimada USD ' + Number(d.multa).toLocaleString('es-EC'));
  if (d.infracciones !== undefined) p.push(d.infracciones + ' faltas' + (d.graves !== undefined ? ' (' + d.graves + ' graves)' : ''));
  if (d.cumplimiento !== undefined) p.push('Cumplimiento ' + d.cumplimiento + '/100');
  const NIV = { si: 'Le corresponde Delegado', rev: 'Delegado por revisar', ok: 'Ya tiene Delegado inscrito' };
  if (d.nivel) p.push(NIV[d.nivel] || ('Nivel: ' + d.nivel));
  if (d.veredicto) p.push(d.veredicto);
  if (d.delegado) p.push('Delegado: ' + d.delegado);
  if (d.servicio) p.push('Servicio sugerido: ' + d.servicio);
  if (d.sector) p.push('Actividad: ' + d.sector);
  if (d.facturacion) p.push('Facturación: ' + d.facturacion);
  if (d.paso) p.push('Se quedó en el paso ' + d.paso);
  return p.join(' · ');
}

function avisar_(d) {
  const quien = d.nombre || d.contacto || d.whatsapp || d.correo || 'Sin nombre';
  const asunto = 'Nuevo contacto · ' + (d.herramienta || 'Herramienta LOPDP') + ' · ' + quien;
  const lineas = [
    'Herramienta: ' + (d.herramienta || '') + ' ' + (d.version || ''),
    'Nombre: ' + (d.nombre || '—'),
    'Organización: ' + (d.organizacion || '—'),
    'Cargo: ' + (d.cargo || '—'),
    'WhatsApp: ' + (d.whatsapp || (d.canal === 'whatsapp' ? d.contacto : '') || '—'),
    'Correo: ' + (d.correo || (d.canal === 'correo' ? d.contacto : '') || '—'),
    '',
    'Resultado: ' + resumen_(d),
    d.parcial ? 'Ojo: dejó solo el contacto, no terminó el cuestionario.' : '',
    '',
    'Recuerde: respuesta en menos de 24 horas, idealmente el mismo día.',
    'Detalle completo en la hoja "Leads".'
  ].filter(function (x) { return x !== null; });
  MailApp.sendEmail({ to: CORREO_AVISO, subject: asunto, body: lineas.join('\n') });
}

/* Evita que un texto que empiece con = + - @ se ejecute como fórmula en la hoja. */
function limpiar_(v) {
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}
