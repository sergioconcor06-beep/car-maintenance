// ===== AUTH =====

function mostrarTab(tab) {
  document.getElementById('form-login').classList.toggle('oculto', tab !== 'login');
  document.getElementById('form-registro').classList.toggle('oculto', tab !== 'registro');
  // Actualizar botones activos
  document.querySelectorAll('.auth-tab').forEach(btn => {
    btn.classList.toggle('activo', btn.getAttribute('onclick').includes("'" + tab + "'"));
  });
}

function _mostrarAuth() {
  document.getElementById('pagina-auth').classList.remove('oculto');
  document.querySelector('header').classList.add('oculto');
  document.getElementById('pagina-coches').classList.add('oculto');
  document.getElementById('pagina-detalle').classList.add('oculto');
  mostrarTab('login');
}

function _mostrarApp(user) {
  usuarioActual = user;
  document.getElementById('pagina-auth').classList.add('oculto');
  document.querySelector('header').classList.remove('oculto');
  document.getElementById('pagina-coches').classList.remove('oculto');
  const apodo = user.get('apodo') || user.get('email');
  const plan = user.get('plan') || 'free';
  document.getElementById('header-apodo').textContent = apodo + ' (' + plan.toUpperCase() + ')';
  cargarMarcas();
  cargarCochesUsuario();
    if (typeof cargarTransferenciasRecibidas === 'function') cargarTransferenciasRecibidas();
      if (typeof actualizarBadgeTransferencias === 'function') actualizarBadgeTransferencias();
}

async function loginUsuario(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const err   = document.getElementById('login-error');
  err.textContent = ''; err.classList.add('oculto');
  try {
    const user = await Parse.User.logIn(email, pass);
    _mostrarApp(user);
  } catch(ex) {
    err.textContent = 'Correo o contrasena incorrectos: ' + (ex.message || '');
    err.classList.remove('oculto');
  }
}

async function registrarUsuario(e) {
  e.preventDefault();
  const apodo = document.getElementById('reg-apodo').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const err   = document.getElementById('reg-error');
  err.textContent = ''; err.classList.add('oculto');
  try {
    const u = new Parse.User();
    u.set('username', email);
    u.set('password', pass);
    u.set('email',    email);
    u.set('apodo',    apodo);
    u.set('plan',     'free');
    await u.signUp();
    try {
      if (typeof Parse.User.requestEmailVerification === 'function') {
        await Parse.User.requestEmailVerification(email);
      }
    } catch (emailErr) {
      console.warn('No se pudo solicitar verificación de correo:', emailErr);
    }
    _mostrarApp(u);
    alert('Revisa tu correo para verificar tu cuenta y poder iniciar la prueba gratuita de Normal.');
  } catch(ex) {
    err.textContent = ex.message || 'Error al registrarse.';
    err.classList.remove('oculto');
  }
}

function cerrarSesion() {
  Parse.User.logOut().then(() => {
    usuarioActual = null;
    coches = [];
    cocheActualId = null;
    _mostrarAuth();
  });
}

// ===== INICIO =====
document.addEventListener('DOMContentLoaded', function() {
  const user = Parse.User.current();
  if (user) {
    _mostrarApp(user);
  } else {
    _mostrarAuth();
  }
});