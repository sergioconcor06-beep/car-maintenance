=== EVENTOS (DOM listeners) =====

// Añadir coche
document.getElementById('form-coche').addEventListener('submit', e => {
  e.preventDefault();
  const marca = document.getElementById('marca-coche').value.trim();
  const modelo = document.getElementById('modelo-coche').value.trim();
  const año = document.getElementById('año-coche').value || null;
  const titulo = document.getElementById('detalle-titulo').value.trim();
  if (!marca || !modelo) return alert('Marca y modelo son obligatorios');
  const c = {
    marca,
    modelo: modelo || 'Otro modelo...',
    año,
    titulo,
    aprobado: añosAprobados.includes(parseInt(año))
  };
  guardarCocheEnParse(c).then(() => {
    cargarCochesUsuario();
    e.target.reset();
  });
});

// Añadir mantenimiento
document.getElementById('form-mantenimiento').addEventListener('submit', e => {
  e.preventDefault();
  if (!cocheActual) return alert('Selecciona un coche primero');
  const tipo = document.getElementById('tipo-mantenimiento').value.trim();
  const fecha = document.getElementById('fecha-mantenimiento').value;
  const km = document.getElementById('km-mantenimiento').value;
  const coste = document.getElementById('coste-mantenimiento').value;
  const detalles = document.getElementById('detalles-mantenimiento').value.trim();
  const motivo = document.getElementById('motivo-mantenimiento')?.value || tipo;
  añadirMantenimientoEnParse(
    cocheActual.id,
    tipo,
    fecha,
    parseInt(km) || 0,
    parseFloat(coste) || 0,
    detalles,
    [],
    motivo
  ).then(() => {
    cargarCochesUsuario();
    e.target.reset();
  });
});

// Añadir referencia
document.getElementById('form-referencia').addEventListener('submit', e => {
  e.preventDefault();
  if (mantActualIdx === null) return alert('Selecciona un mantenimiento primero');
  const desc = document.getElementById('descripcion-ref').value.trim();
  const precio = document.getElementById('precio-ref').value;
  const detalle = document.getElementById('detalle-ref').value.trim();
  añadirReferenciaEnParse(
    cocheActual.id,
    mantActualIdx,
    desc,
    parseFloat(precio) || 0,
    detalle
  ).then(() => {
    cargarCochesUsuario();
    e.target.reset();
  });
});

// Guardar edición de coche
document.getElementById('btn-guardar-edit-coche').addEventListener('click', () => {
  const marca = document.getElementById('edit-marca').value.trim();
  const modelo = document.getElementById('edit-modelo').value.trim();
  const año = document.getElementById('edit-año').value || null;
  const titulo = document.getElementById('edit-titulo').value.trim();
  actualizarCocheEnParse(
    cocheActual.id,
    marca,
    modelo,
    año,
    titulo,
    añosAprobados.includes(parseInt(año))
  ).then(() => {
    cargarCochesUsuario();
    document.getElementById('modal-editar-coche').style.display = 'none';
  });
});

// Guardar edición de mantenimiento
document.getElementById('btn-guardar-edit-mant').addEventListener('click', () => {
  const idx = parseInt(document.getElementById('edit-mant-idx').value);
  const km = document.getElementById('edit-mant-km').value;
  const fecha = document.getElementById('edit-mant-fecha').value;
  const coste = document.getElementById('edit-mant-coste').value;
  const detalles = document.getElementById('edit-mant-detalles').value.trim();
  const motivo = document.getElementById('edit-mant-tipo').value;
  actualizarMantenimientoEnParse(
    cocheActual.id,
    idx,
    motivo,
    fecha,
    parseInt(km) || 0,
    parseFloat(coste) || 0,
    detalles,
    cocheActual.mantenimientos[idx].referencias || [],
    motivo
  ).then(() => {
    cargarCochesUsuario();
    document.getElementById('modal-editar-mant').style.display = 'none';
  });
});

// Cerrar modales
document.querySelectorAll('.btn-cancelar-modal').forEach(b => {
  b.addEventListener('click', () => {
    document.getElementById('modal-editar-coche').style.display = 'none';
    document.getElementById('modal-editar-mant').style.display = 'none';
  });
});
