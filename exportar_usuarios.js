// Script para exportar usuarios a archivo JSON
// Ejecutar con: node exportar_usuarios.js

const Parse = require('parse/node');

Parse.initialize('VNCETodfuWvUtF1L5O5kcCp3r8JpFpg0GugpBNWz', '5wbDOn3d10TBhGPPfEoFgvZp7EDO5TiD2YyssAPv');
Parse.serverURL = 'https://parseapi.back4app.com/';

async function exportarUsuarios() {
  try {
    const query = new Parse.Query(Parse.User);
    query.limit(1000); // Ajustar si hay más usuarios
    const usuarios = await query.find({ useMasterKey: true }); // Necesita master key para leer usuarios

    const datos = usuarios.map(u => ({
      apodo: u.get('apodo') || u.get('username'),
      email: u.get('email') || u.get('username'),
      plan: u.get('plan') || 'free',
      fechaCreacion: u.get('createdAt').toISOString(),
      id: u.id
    }));

    const fs = require('fs');
    const path = require('path');
    const fecha = new Date().toISOString().split('T')[0];
    const archivo = path.join(__dirname, `usuarios_export_${fecha}.json`);
    fs.writeFileSync(archivo, JSON.stringify(datos, null, 2));
    console.log(`✅ Usuarios exportados a ${archivo}`);
  } catch (e) {
    console.error('Error al exportar:', e.message);
  }
}

exportarUsuarios();