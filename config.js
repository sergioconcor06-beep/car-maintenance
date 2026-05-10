// ===== BACK4APP CONFIG =====
Parse.initialize('VNCETodfuWvUtF1L5O5kcCp3r8JpFpg0GugpBNWz', '5wbDOn3d10TBhGPPfEoFgvZp7EDO5TiD2YyssAPv');
Parse.serverURL = 'https://parseapi.back4app.com/';

// ===== ESTADO GLOBAL =====
let vehiculosDB = [];
let coches = [];
let cocheActualId = null;
let usuarioActual = null;
let mantEditId = null;

// ===== PLANES =====
const PLANES = {
  free:     { coches:1,   mantenimientos:15,   referencias:20,  dinero:false, alarmas:false, enviar:0,   recibir:0   },
  basic:    { coches:2,   mantenimientos:30,   referencias:50,  dinero:true,  alarmas:false, enviar:0,   recibir:0   },
  normal:   { coches:4,   mantenimientos:100,  referencias:100, dinero:true,  alarmas:true,  enviar:0,   recibir:3   },
  pro:      { coches:8,   mantenimientos:300,  referencias:300, dinero:true,  alarmas:true,  enviar:8,   recibir:10  },
  premium:  { coches:15,  mantenimientos:999,  referencias:999, dinero:true,  alarmas:true,  enviar:15,  recibir:15  },
  business: { coches:999, mantenimientos:9999, referencias:9999,dinero:true,  alarmas:true,  enviar:999, recibir:999 }
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
