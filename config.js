// ===== BACK4APP CONFIG =====
Parse.initialize('VNCETodfuWvUtF1L5O5kcCp3r8JpFpg0GugpBNWz', '5wbDOn3d10TBhGPPfEoFgvZp7EDO5TiD2YyssAPv');
Parse.serverURL = 'https://parseapi.back4app.com/';

// ===== ESTADO GLOBAL =====
let vehiculosDB = [];
let coches = [];
let cocheActualId = null;
let usuarioActual = null;
let mantEditId = null;

function getCocheById(id) {
  const idStr = String(id);
  return coches.find(c => String(c.id) === idStr);
}

// ===== PLANES =====
const PLANES = {
  free:     { coches:1,   mantenimientos:15,   referencias:20,  dinero:false, alarmas:false, enviar:0,   recibir:0,    precioMensual:0,     precioAnual:0 },
  basic:    { coches:2,   mantenimientos:40,   referencias:50,  dinero:true,  alarmas:false, enviar:0,   recibir:0,    precioMensual:2.5,   precioAnual:24.00 },
  normal:   { coches:4,   mantenimientos:100,  referencias:100, dinero:true,  alarmas:true,  enviar:0,   recibir:3,    precioMensual:4.99,  precioAnual:47.92 },
  pro:      { coches:8,   mantenimientos:300,  referencias:300, dinero:true,  alarmas:true,  enviar:8,   recibir:10,   precioMensual:14.99, precioAnual:143.90 },
  premium:  { coches:15,  mantenimientos:650,  referencias:650, dinero:true,  alarmas:true,  enviar:15,  recibir:15,   precioMensual:24.99, precioAnual:239.90 },
  business: { coches:9999999, mantenimientos:9999999, referencias:9999999,dinero:true,  alarmas:true,  enviar:9999999, recibir:9999999, precioMensual:249.99, precioAnual:2400 }
};

// ===== MOTIVOS MANTENIMIENTO =====
const MOTIVOS_DEFAULT = [
  'Cambio de aceite','Filtro de aire','Filtro de combustible',
  'Pastillas de freno','Discos de freno','Correa de distribucion',
  'Bujias','Neumaticos','Bateria','ITV','Revision general'
];

function getMotivos() {
  const extras = JSON.parse(localStorage.getItem('motivos_custom') || '[]');
  return [...MOTIVOS_DEFAULT, ...extras];
}

function guardarMotivoCustom(m) {
  const extras = JSON.parse(localStorage.getItem('motivos_custom') || '[]');
  if (!extras.includes(m)) {
    extras.push(m);
    localStorage.setItem('motivos_custom', JSON.stringify(extras));
  }
}

function getPlan() {
  if (!usuarioActual) return PLANES.free;
  return PLANES[usuarioActual.get('plan') || 'free'] || PLANES.free;
}

function getPlanKey() {
  if (!usuarioActual) return 'free';
  return usuarioActual.get('plan') || 'free';
}

function userHasAlarmas() {
  return getPlan().alarmas;
}

function isEmailVerified() {
  if (!usuarioActual) return false;
  return Boolean(usuarioActual.get('emailVerified'));
}

function isTrialActive() {
  if (!usuarioActual) return false;
  const trialEnd = usuarioActual.get('trialEnd');
  return trialEnd && new Date(trialEnd) > new Date();
}

function trialDaysRemaining() {
  if (!usuarioActual) return 0;
  const trialEnd = usuarioActual.get('trialEnd');
  if (!trialEnd) return 0;
  const diff = new Date(trialEnd) - new Date();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}