/**
 * Garaje Tu Estilo · Cotizaciones a Google Sheets
 *
 * Cómo se instala (5 minutos, una sola vez):
 * 1. Crea una hoja nueva en Google Sheets (por ejemplo "Cotizaciones Garaje Tu Estilo").
 * 2. En la hoja: Extensiones → Apps Script. Borra lo que haya y pega todo este archivo. Guarda.
 * 3. Arriba a la derecha: Implementar → Nueva implementación → tipo "Aplicación web".
 *      Ejecutar como: Yo
 *      Quién tiene acceso: Cualquier usuario
 *    Pulsa Implementar y acepta los permisos (Google te pedirá confirmar tu cuenta).
 * 4. Copia la URL que termina en /exec.
 * 5. En index.html busca  leads: {sheetUrl:null}  y cámbialo a  leads: {sheetUrl:'LA_URL_QUE_COPIASTE'}
 *    Sube el index.html a GitHub. Listo: cada cotización entra como una fila en la pestaña "Cotizaciones".
 *
 * Opcional: escribe tu correo en AVISAR_A para recibir un email con cada cotización nueva.
 * Si cambias este código después, usa Implementar → Gestionar implementaciones → editar → Nueva versión
 * (así la URL no cambia).
 */
const AVISAR_A = '';           // ej. 'tucorreo@gmail.com'  ·  vacío = sin email
const PESTANA = 'Cotizaciones';

const COLUMNAS = [
  ['fecha', 'Fecha'], ['tipo', 'Vía'], ['nombre', 'Nombre'], ['telefono', 'Teléfono'], ['municipio', 'Municipio'],
  ['visita', 'Visita para medir'], ['notas', 'Notas'], ['medidas', 'Medidas'], ['area', 'Área'], ['losa', 'Losa'],
  ['losas', 'Losas (con extra)'], ['rampas', 'Piezas de rampa'], ['estimado', 'Estimado'], ['descuento', 'Descuento'], ['luces', 'Luces LED'], ['logo', 'Logo 3D de pared'], ['objetos', 'Autos y muebles'],
  ['enlace', 'Ver el diseño'], ['idioma', 'Idioma'], ['id', 'ID del diseño']
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const hoja = obtenerHoja();
    const fila = COLUMNAS.map(([k]) => k === 'fecha' ? new Date() : limpiar(d[k]));
    const idCol = COLUMNAS.length, tipoCol = 2, ultima = hoja.getLastRow();
    let filaExistente = 0;
    if (d.id && ultima > 1) {
      const ids = hoja.getRange(2, idCol, ultima - 1, 1).getValues();
      const tipos = hoja.getRange(2, tipoCol, ultima - 1, 1).getValues();
      for (let i = ids.length - 1; i >= 0; i--) {
        if (ids[i][0] === d.id && tipos[i][0] === d.tipo) { filaExistente = i + 2; break; }
      }
    }
    if (filaExistente) hoja.getRange(filaExistente, 1, 1, fila.length).setValues([fila]);
    else hoja.appendRow(fila);
    if (AVISAR_A && !filaExistente) avisar(d);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Abre la URL /exec en el navegador para comprobar que está instalado.
function doGet() {
  return ContentService.createTextOutput('Garaje Tu Estilo: la hoja de cotizaciones está lista.');
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(PESTANA);
  if (!hoja) hoja = libro.insertSheet(PESTANA);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS.map(c => c[1]));
    hoja.setFrozenRows(1);
    hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold').setBackground('#121a15').setFontColor('#d6dd17');
    hoja.getRange('A:A').setNumberFormat('yyyy-mm-dd h:mm am/pm');
  }
  return hoja;
}

// Texto plano: evita que algo escrito por el cliente se convierta en una fórmula.
function limpiar(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'number') return v;
  const t = String(v).slice(0, 2000);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function avisar(d) {
  const lineas = COLUMNAS.filter(([k]) => k !== 'fecha' && d[k]).map(([k, n]) => n + ': ' + d[k]);
  MailApp.sendEmail(AVISAR_A, 'Nueva cotización: ' + (d.nombre || 'sin nombre') + ' · ' + (d.medidas || ''), lineas.join('\n'));
}
