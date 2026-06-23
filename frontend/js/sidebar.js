/* ============================================================
   sidebar.js — genera e inyecta el sidebar de navegación.
   Uso: incluir en cada página protegida DESPUÉS de auth-guard.js

   <script src="../js/auth-guard.js"></script>
   <script src="../js/api.js"></script>
   <script src="../js/sidebar.js"></script>

   El sidebar se inyecta automáticamente en <body>.
   La página activa se detecta por la URL actual.
============================================================ */

(function () {

  /* ── Iconos SVG inline (sin dependencias de CDN) ─────────── */
  const ICONS = {
    home:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    user:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    link:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    users:      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    building:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="15" y1="22" x2="15" y2="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="7" x2="9" y2="7"/><line x1="4" y1="17" x2="9" y2="17"/><line x1="15" y1="17" x2="20" y2="17"/><line x1="15" y1="7" x2="20" y2="7"/></svg>`,
    briefcase:  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    file:       `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    dollar:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    search:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    car:        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="11" width="22" height="9" rx="2"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><circle cx="7" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>`,
    parking:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
    heart:      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    chart:      `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    logout:     `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  };

  /* ── Items de navegación ─────────────────────────────────────
     roles: lista de roles que pueden ver este item.
     [] = todos los roles autenticados lo ven.
  ─────────────────────────────────────────────────────────── */
  const NAV_ITEMS = [
    { label: 'Inicio',          icon: 'home',      path: '../miembros/miembros.html',             roles: [] },
    { label: 'Mi Perfil',       icon: 'user',      path: '../miembros/miembros.html',             roles: [] },
    { label: 'Vinculaciones',   icon: 'link',      path: '../vinculaciones/vinculaciones.html',   roles: [] },
    { label: 'Beneficiarios',   icon: 'users',     path: '../beneficiarios/beneficiarios.html',   roles: ['admin', 'director', 'miembro'] },
    { label: 'Infraestructura', icon: 'building',  path: '../infraestructura/infraestructura.html', roles: ['admin', 'director'] },
    { label: 'Servicios',       icon: 'briefcase', path: '../servicios/servicios.html',           roles: [] },
    { label: 'Solicitudes',     icon: 'file',      path: '../solicitudes/solicitudes.html',       roles: [] },
    { label: 'Financiero',      icon: 'dollar',    path: '../financiero/financiero.html',         roles: ['admin', 'director', 'cajero'] },
    { label: 'Bolsa de Trabajo',icon: 'search',    path: '../bolsatrabajo/bolsatrabajo.html',     roles: [] },
    { label: 'Vehículos',       icon: 'car',       path: '../vehiculos/vehiculos.html',           roles: [] },
    { label: 'Estacionamiento', icon: 'parking',   path: '../estacionamiento/estacionamiento.html', roles: [] },
    { label: 'Voluntariado',    icon: 'heart',     path: '../voluntariado/voluntariado.html',     roles: [] },
    { label: 'Reportes',        icon: 'chart',     path: '../reportes/reportes.html',             roles: ['admin', 'director'] },
  ];

  /* ── Detectar página activa ────────────────────────────────── */
  function esActivo(path) {
    return window.location.pathname.includes(path.replace('../', ''));
  }

  /* ── Filtrar items por rol del usuario ─────────────────────── */
  function itemsVisibles(usuario) {
    if (!usuario) return [];
    return NAV_ITEMS.filter(item =>
      item.roles.length === 0 || item.roles.includes(usuario.rol)
    );
  }

  /* ── Iniciales del usuario para el avatar ──────────────────── */
  function iniciales(usuario) {
    if (!usuario) return 'UC';
    const n = usuario.nombre || '';
    const partes = n.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : (partes[0]?.[0] || 'U').toUpperCase();
  }

  /* ── HTML del sidebar ──────────────────────────────────────── */
  function crearSidebar(usuario) {
    const items = itemsVisibles(usuario);

    const navHTML = items.map(item => {
      const activo = esActivo(item.path) ? 'sb-nav__item--active' : '';
      return `
        <a href="${item.path}" class="sb-nav__item ${activo}" title="${item.label}">
          <span class="sb-nav__icon">${ICONS[item.icon]}</span>
          <span class="sb-nav__label">${item.label}</span>
        </a>`;
    }).join('');

    const subtipo = usuario?.subtipo ? `<span class="sb-user__subtipo">${usuario.subtipo}</span>` : '';

    return `
      <aside class="sidebar" id="sidebar">

        <!-- Logo -->
        <div class="sb-logo">
          <div class="sb-logo__icon">UC</div>
          <span class="sb-logo__text">UCAB Services</span>
        </div>

        <!-- Navegación -->
        <nav class="sb-nav">${navHTML}</nav>

        <!-- Usuario + Logout -->
        <div class="sb-footer">
          <div class="sb-user">
            <div class="sb-user__avatar">${iniciales(usuario)}</div>
            <div class="sb-user__info">
              <p class="sb-user__nombre">${usuario?.nombre || 'Usuario'}</p>
              ${subtipo}
            </div>
          </div>
          <button class="sb-logout" id="sb-logout-btn" title="Cerrar sesión">
            ${ICONS.logout}
          </button>
        </div>

      </aside>

      <!-- Overlay para móvil -->
      <div class="sb-overlay" id="sb-overlay"></div>
    `;
  }

  /* ── CSS del sidebar (inyectado en <head>) ─────────────────── */
  const CSS = `
    :root {
      --sb-width: 220px;
      --sb-navy: #1C3D6E;
      --sb-navy-dark: #162F56;
      --sb-amber: #E8A317;
      --sb-text: rgba(255,255,255,0.75);
      --sb-text-active: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { display: flex; min-height: 100vh; background: #EEF1F7; font-family: 'Segoe UI', system-ui, sans-serif; }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sb-width);
      min-height: 100vh;
      background: var(--sb-navy);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
    }

    /* Logo */
    .sb-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sb-logo__icon {
      width: 34px; height: 34px;
      background: var(--sb-amber);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #fff;
      flex-shrink: 0;
    }
    .sb-logo__text { color: #fff; font-size: 14px; font-weight: 600; }

    /* Nav items */
    .sb-nav { flex: 1; padding: 10px 0; overflow-y: auto; }
    .sb-nav__item {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 16px;
      color: var(--sb-text);
      text-decoration: none;
      font-size: 13.5px;
      border-left: 3px solid transparent;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .sb-nav__item:hover {
      background: rgba(255,255,255,0.07);
      color: var(--sb-text-active);
    }
    .sb-nav__item--active {
      background: rgba(255,255,255,0.10);
      color: var(--sb-text-active);
      border-left-color: var(--sb-amber);
    }
    .sb-nav__icon { flex-shrink: 0; display: flex; }
    .sb-nav__label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Footer usuario */
    .sb-footer {
      padding: 14px 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; gap: 10px;
    }
    .sb-user { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .sb-user__avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--sb-amber);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .sb-user__info { min-width: 0; }
    .sb-user__nombre { color: #fff; font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sb-user__subtipo { color: var(--sb-text); font-size: 11px; }
    .sb-logout {
      background: none; border: none; cursor: pointer;
      color: var(--sb-text); padding: 6px; border-radius: 6px;
      display: flex; align-items: center; flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }
    .sb-logout:hover { background: rgba(255,255,255,0.1); color: #fff; }

    /* Contenido principal */
    .main-content {
      flex: 1;
      min-width: 0;
      padding: 28px;
      overflow-y: auto;
    }

    /* Overlay móvil */
    .sb-overlay { display: none; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed; left: -var(--sb-width); top: 0;
        transition: transform 0.25s;
        transform: translateX(-100%);
      }
      .sidebar.open { transform: translateX(0); }
      .sb-overlay {
        display: block; position: fixed; inset: 0;
        background: rgba(0,0,0,0.4); z-index: 99; opacity: 0;
        pointer-events: none; transition: opacity 0.25s;
      }
      .sb-overlay.visible { opacity: 1; pointer-events: all; }
      .main-content { padding: 16px; }
    }
  `;

  /* ── Inyectar CSS ──────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── Inyectar sidebar en body ──────────────────────────────── */
  const usuario = window.usuarioActual || null;
  const sidebarEl = document.createElement('div');
  sidebarEl.innerHTML = crearSidebar(usuario);

  // Envolver el contenido existente del body en .main-content
  const contenidoActual = document.body.innerHTML;
  document.body.innerHTML = '';
  document.body.appendChild(sidebarEl.firstElementChild); // <aside>
  document.body.appendChild(sidebarEl.lastElementChild);  // overlay

  const mainContent = document.createElement('div');
  mainContent.className = 'main-content';
  mainContent.innerHTML = contenidoActual;
  document.body.appendChild(mainContent);

  /* ── Logout ────────────────────────────────────────────────── */
  document.getElementById('sb-logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../login/login.html';
  });

  /* ── Overlay móvil ─────────────────────────────────────────── */
  document.getElementById('sb-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sb-overlay')?.classList.remove('visible');
  });

})();