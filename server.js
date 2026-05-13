// Servidor local para actualizar usuarios_export.json
// Ejecutar con: node server.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const Parse = require('parse/node');
const nodemailer = require('nodemailer');

const APP_ID = 'VNCETodfuWvUtF1L5O5kcCp3r8JpFpg0GugpBNWz';
const JS_KEY = '5wbDOn3d10TBhGPPfEoFgvZp7EDO5TiD2YyssAPv';
const MASTER_KEY = 'NRDHAXUrreuLS8fvPFScqs5f6fGDLqJKWFxx7ZTD';

console.log('Usando Master Key fija para Back4App.');

Parse.initialize(APP_ID, JS_KEY, MASTER_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

const app = express();
const PORT = 3000;

// Configurar Nodemailer (cambiar credenciales por las tuyas)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tuemail@gmail.com', // Reemplaza con tu email de Gmail
    pass: 'tuapppassword' // Reemplaza con tu app password de Gmail
  }
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.static(path.join(__dirname))); // Servir archivos estáticos como admin.html

app.post('/update-usuarios', async (req, res) => {
  console.log('POST /update-usuarios recibido');
  try {
    const query = new Parse.Query(Parse.User);
    query.limit(1000);
    const usuarios = await query.find({ useMasterKey: true });

    const datos = usuarios.map(u => ({
      apodo: u.get('apodo') || u.get('username'),
      email: u.get('email') || u.get('username'),
      plan: u.get('plan') || 'free',
      fechaCreacion: u.get('createdAt').toISOString(),
      id: u.id
    }));

    const archivo = path.join(__dirname, 'usuarios_export.json');
    fs.writeFileSync(archivo, JSON.stringify(datos, null, 2));
    console.log('Archivo usuarios_export.json actualizado con', datos.length, 'usuarios');
    res.json({ success: true, message: 'Archivo actualizado' });
  } catch (e) {
    console.error('Error en /update-usuarios:', e);
    const msg = e.message && e.message.toLowerCase().includes('unauthorized')
      ? 'Master Key inválida o acceso denegado. Revisa tu Master Key de Back4App.'
      : e.message || 'unknown error';
    res.status(500).json({ success: false, error: msg });
  }
});

app.post('/find-user', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ success: false, error: 'Email requerido' });
  try {
    const query = new Parse.Query(Parse.User);
    query.equalTo('email', email);
    const user = await query.first({ useMasterKey: true });
    if (!user) return res.status(404).json({ success: false, error: 'No existe ninguna cuenta con ese correo.' });
    res.json({ success: true, user: { id: user.id, email: user.get('email'), apodo: user.get('apodo') || user.get('username') } });
  } catch (e) {
    console.error('Error en /find-user:', e);
    res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

app.get('/admin/users', async (req, res) => {
  try {
    const query = new Parse.Query(Parse.User);
    query.limit(1000);
    query.ascending('createdAt');
    const usuarios = await query.find({ useMasterKey: true });
    const datos = usuarios.map(u => ({
      id: u.id,
      apodo: u.get('apodo') || u.get('username'),
      email: u.get('email') || u.get('username'),
      plan: u.get('plan') || 'free',
      createdAt: u.get('createdAt') ? u.get('createdAt').toISOString() : null,
      updatedAt: u.get('updatedAt') ? u.get('updatedAt').toISOString() : null
    }));
    res.json({ success: true, users: datos });
  } catch (e) {
    console.error('Error en /admin/users:', e);
    res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

app.post('/admin/change-plan', async (req, res) => {
  const { userId, nuevoPlan } = req.body;
  if (!userId || !nuevoPlan) return res.status(400).json({ success: false, error: 'userId y nuevoPlan son requeridos' });
  try {
    const query = new Parse.Query(Parse.User);
    const user = await query.get(userId, { useMasterKey: true });
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    user.set('plan', nuevoPlan);
    await user.save(null, { useMasterKey: true });
    res.json({ success: true, message: 'Plan actualizado correctamente' });
  } catch (e) {
    console.error('Error en /admin/change-plan:', e);
    res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Abre admin.html en el navegador para usar el botón de exportar.');
});

app.post("/send-verification-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email requerido" });
  try {
    const mailOptions = {
      from: "tuemail@gmail.com",
      to: email,
      subject: "Verifica tu correo para Mis Coches",
      html: `<h2>Verificación de correo</h2><p>Haz clic en el enlace para verificar tu correo y acceder a la prueba gratuita de Normal:</p><a href="http://localhost:3000/verify?email=${encodeURIComponent(email)}">Verificar correo</a><p>Si no funciona, copia esta URL: http://localhost:3000/verify?email=${encodeURIComponent(email)}</p>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email de verificación enviado" });
  } catch (e) {
    console.error("Error enviando email:", e);
    res.status(500).json({ success: false, error: "Error enviando email" });
  }
});

app.get('/verify', async (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  if (!email) return res.status(400).send('Email requerido.');
  try {
    const query = new Parse.Query(Parse.User);
    query.equalTo('email', email);
    const user = await query.first({ useMasterKey: true });
    if (!user) return res.status(404).send('No se encontró un usuario con ese correo.');
    user.set('emailVerified', true);
    await user.save(null, { useMasterKey: true });
    res.send(`<h1>Correo verificado</h1><p>Tu correo ${email} ha sido verificado con éxito. Vuelve a la app y comienza tu prueba gratuita.</p>`);
  } catch (e) {
    console.error('Error verificando correo:', e);
    res.status(500).send('Error verificando el correo.');
  }
});

app.post("/send-alarm-notification", async (req, res) => {
  const { email, coche, alarma, dias } = req.body;
  if (!email || !alarma) return res.status(400).json({ success: false, error: "Datos requeridos" });
  try {
    const mailOptions = {
      from: "tuemail@gmail.com",
      to: email,
      subject: `Recordatorio: ${alarma.descripcion} para ${coche}`,
      html: `<h2>Recordatorio de mantenimiento</h2><p>Tu coche <strong>${coche}</strong> tiene una alarma próxima:</p><p><strong>${alarma.descripcion}</strong></p><p>Fecha: ${new Date(alarma.fecha).toLocaleDateString()}</p>${alarma.km ? `<p>Kilómetros: ${alarma.km}</p>` : ""}<p>Quedan ${dias} día(s).</p><p>Accede a la app para más detalles.</p>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Notificación enviada" });
  } catch (e) {
    console.error("Error enviando notificación:", e);
    res.status(500).json({ success: false, error: "Error enviando notificación" });
  }
});

app.post("/create-notification", async (req, res) => {
  const { destinatarioId, userId, mensaje, tipo } = req.body;
  const destinatario = destinatarioId || userId;
  if (!destinatario || !mensaje) return res.status(400).json({ success: false, error: "Datos requeridos" });
  try {
    const Notif = Parse.Object.extend("Notificacion");
    const notif = new Notif();
    notif.set("destinatario", { __type: "Pointer", className: "_User", objectId: destinatario });
    notif.set("mensaje", mensaje);
    notif.set("tipo", tipo || "info");
    notif.set("leida", false);
    await notif.save(null, { useMasterKey: true });
    res.json({ success: true, message: "Notificación creada" });
  } catch (e) {
    console.error("Error creando notificación:", e);
    res.status(500).json({ success: false, error: e.message || "Error interno" });
  }
});

app.get("/get-notifications/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ success: false, error: "User ID requerido" });
  try {
    const Notif = Parse.Object.extend("Notificacion");
    const query = new Parse.Query(Notif);
    query.equalTo("destinatario", Parse.User.createWithoutData(userId));
    query.equalTo("leida", false);
    query.descending("createdAt");
    const notifs = await query.find({ useMasterKey: true });
    const data = notifs.map(n => ({ id: n.id, mensaje: n.get("mensaje"), tipo: n.get("tipo"), fecha: n.get("createdAt").toISOString() }));
    res.json({ success: true, notifications: data });
  } catch (e) {
    console.error("Error obteniendo notificaciones:", e);
    res.status(500).json({ success: false, error: e.message || "Error interno" });
  }
});

app.post("/mark-notification-read/:notifId", async (req, res) => {
  const notifId = req.params.notifId;
  if (!notifId) return res.status(400).json({ success: false, error: "Notification ID requerido" });
  try {
    const Notif = Parse.Object.extend("Notificacion");
    const notif = new Notif();
    notif.id = notifId;
    notif.set("leida", true);
    await notif.save(null, { useMasterKey: true });
    res.json({ success: true, message: "Notificación marcada como leída" });
  } catch (e) {
    console.error("Error marcando notificación:", e);
    res.status(500).json({ success: false, error: e.message || "Error interno" });
  }
});