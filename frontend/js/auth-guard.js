(function () {
  const token   = localStorage.getItem('token');
  const usuario = (() => {
    try { return JSON.parse(localStorage.getItem('usuario')); }
    catch { return null; }
  })();

  if (!token || !usuario) {
    window.location.href = '/frontend/login/login.html';
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/frontend/login/login.html';
      return;
    }
  } catch {
    localStorage.removeItem('token');
    window.location.href = '/frontend/login/login.html';
    return;
  }

  const checkRoles = typeof ROLES_PERMITIDOS !== 'undefined' && ROLES_PERMITIDOS.length > 0;
  const checkSubtipos = typeof SUBTIPOS_PERMITIDOS !== 'undefined' && SUBTIPOS_PERMITIDOS.length > 0;

  if (checkRoles || checkSubtipos) {
    const rolValido = checkRoles && ROLES_PERMITIDOS.includes(usuario.rol);
    const subtipoValido = checkSubtipos && SUBTIPOS_PERMITIDOS.includes(usuario.subtipo);

    if (!rolValido && !subtipoValido) {
      window.location.href = '/frontend/login/login.html';
      return;
    }
  }

  window.usuarioActual = usuario;
})();
