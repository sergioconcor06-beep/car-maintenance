// ===== REFERENCIAS =====

function renderReferencias() {
  const c = getCocheById(cocheActualId);
  if (!c) return;
  if (!c.referencias) c.referencias = [];
  const div = document.getElementById('lista-referencias');
  if (!c.referencias.length) {
    div.innerHTML = '<p style="color:#888;text-align:center">Sin referencias aun.</p>';
    return;
  }
  div.innerHTML = c.referencias.map(r => `
    <div class="ref-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <strong>${r.nombre}</strong>
          ${r.codigo ? `<span style="background:#1e3a5f;color:#90caf9;padding:2px 8px;border-radius:4px;font-size:0.8rem;margin-left:6px">🔖 ${r.codigo}</span>` : ''}
          ${r.marca  ? `<span style="color:#aaa;font-size:0.85rem;margin-left:6px">${r.marca}</span>` : ''}
        </div>
        <button class="btn-icon btn-danger" onclick="eliminarReferencia('${r.id}')">&#215;</button>
      </div>
      ${r.notas ? `<p style="color:#aaa;font-size:0.9rem;margin-top:0.3rem">📝 ${r.notas}</p>` : ''}
      <div style="display:flex;gap:0.5rem;margin-top:0.4rem;flex-wrap:wrap">
        ${r.fotoPieza   ? `<img src="${r.fotoPieza}"   style="max-height:80px;border-radius:6px" alt="Pieza">` : ''}
        ${r.fotoFactura ? `<img src="${r.fotoFactura}" style="max-height:80px;border-radius:6px" alt="Factura">` : ''}
      </div>
    </div>
  `).join('');
}

function eliminarReferencia(id) {
  if (!confirm('Eliminar esta referencia?')) return;
  const c = getCocheById(cocheActualId);
  c.referencias = c.referencias.filter(r => String(r.id) !== String(id));
  guardarCocheEnParse(c).catch(() => {});
  renderReferencias();
}