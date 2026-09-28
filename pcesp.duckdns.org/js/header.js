/**
 * header.js — Componente de Cabeçalho e Rodapé Institucional
 * Polícia Federal Virtual · DPF Virtual · Legacy Roleplay
 */
(function () {
  'use strict';

  function getCurrentPath() {
    var p = window.location.pathname || '';
    var file = p.split('/').pop().toLowerCase();
    if (!file || file === 'index.html' || file === '') return '/';
    return file.replace(/\.html$/i, '');
  }

  function renderHeaderHtml(activeSlug) {
    if (activeSlug === 'login') {
      return `
        <!-- GOV STRIPE -->
        <div class="gov-stripe">
          <div class="container gov-stripe-inner" style="display:flex;justify-content:space-between;align-items:center;">
            <div class="gov-sp-badge" style="display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-shield-halved" style="color:var(--pc-gold);"></i>
              <span>REPÚBLICA FEDERATIVA DO BRASIL · POLÍCIA FEDERAL</span>
            </div>
            <div style="font-size:0.75rem;color:rgba(255,255,255,0.7);font-weight:600;letter-spacing:0.04em;">
              CENTRAL DO ESCRIVÃO — ÁREA RESTRITA
            </div>
          </div>
        </div>
      `;
    }

    var isInicio = activeSlug === '/' || activeSlug === 'index';
    var isProcurados = activeSlug === 'procurados';
    var isAtendimento = activeSlug === 'atendimento';
    var isCidade = activeSlug === 'cidade';

    return `
      <!-- GOV STRIPE -->
      <div class="gov-stripe">
        <div class="container gov-stripe-inner">
          <div class="gov-stripe-links">
            <a href="index.html"><i class="fa-solid fa-house"></i> Início</a>
            <a href="delegacia-virtual.html"><i class="fa-solid fa-file-pen"></i> Registrar B.O.</a>
            <a href="codigo-penal.html"><i class="fa-solid fa-scale-balanced"></i> Código Penal</a>
            <a href="download.html" style="color:#c8a951;font-weight:600;"><i class="fa-brands fa-windows"></i> Aplicativo Desktop</a>
          </div>
          <div class="gov-sp-badge">
            <span class="sp-flag-mini"></span>
            <span>REPÚBLICA FEDERATIVA DO BRASIL · MINISTÉRIO DA JUSTIÇA</span>
          </div>
          <span id="stripe-datetime" style="font-size:0.76rem;"></span>
        </div>
      </div>

      <!-- SITE HEADER -->
      <header class="site-header">
        <div class="container">
          <div class="header-inner">
            <a href="index.html" class="header-brand">
              <img src="assets/logo.png" alt="Brasão Oficial da Polícia Federal Virtual" class="brand-logo">
              <div class="brand-text">
                <div class="brand-title">POLÍCIA FEDERAL</div>
                <div class="brand-subtitle">DEPARTAMENTO DE POLÍCIA FEDERAL — DPF VIRTUAL</div>
              </div>
            </a>

            <div class="brand-separator" aria-hidden="true"></div>

            <div class="brand-dept">
              <div class="brand-dept-name">Portal de Serviços Institucionais</div>
              <div class="brand-dept-desc">Sistema Integrado de Segurança Pública — SISP v4.0</div>
            </div>

            <div class="header-sp-flag-box">
              <img src="assets/sp_flag.png" alt="Brasão Oficial" class="header-sp-flag-img">
              <div>
                <div class="sp-flag-label-title">BRASIL</div>
                <div class="sp-flag-label-sub">GOVERNO FEDERAL</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- MAIN NAV -->
      <nav class="main-nav">
        <div class="container nav-inner">
          <button class="nav-mobile-toggle" type="button" aria-controls="site-primary-nav" aria-expanded="false">
            <i class="fa-solid fa-bars"></i>
            <span>Menu</span>
          </button>

          <ul class="nav-menu" id="site-primary-nav">
            <li>
              <a href="procurados.html" class="${isProcurados ? 'active' : ''}">
                <i class="fa-solid fa-user-ninja"></i> Procurados
              </a>
            </li>
            <li>
              <a href="atendimento.html" class="${isAtendimento ? 'active' : ''}">
                <i class="fa-solid fa-headset"></i> Atendimento
              </a>
            </li>
            <li>
              <a href="cidade.html" class="${isCidade ? 'active' : ''}">
                <i class="fa-solid fa-city"></i> Cidade Legacy
              </a>
            </li>
            <li>
              <a href="index.html" class="${isInicio ? 'active' : ''}">
                <i class="fa-solid fa-house-flag"></i> Início
              </a>
            </li>
            <li class="nav-services">
              <details id="nav-services-details">
                <summary><i class="fa-solid fa-grip"></i> Serviços <i class="fa-solid fa-chevron-down nav-services-arrow"></i></summary>
                <div class="nav-services-menu">
                  <div class="nav-services-top-bar">
                    <div class="nav-services-brand-info">
                      <i class="fa-solid fa-shield-halved"></i>
                      <div>
                        <strong>CENTRAL DE SERVIÇOS & SISTEMAS SISP</strong>
                        <small>Departamento de Polícia Federal · Superintendência Regional</small>
                      </div>
                    </div>
                    <div class="nav-services-search-wrapper">
                      <i class="fa-solid fa-magnifying-glass"></i>
                      <input type="text" id="nav-services-search-input" placeholder="Filtrar serviços... (ex: Plantão, B.O.)" autocomplete="off">
                    </div>
                  </div>

                  <div class="nav-services-grid" id="nav-services-grid">
                    <div class="nav-services-col" data-cat="investigacao">
                      <div class="nav-services-col-header">
                        <i class="fa-solid fa-fingerprint" style="color:#d97706;"></i>
                        <span>Investigação & Inteligência</span>
                        <span class="nav-services-col-badge">2</span>
                      </div>
                      <div class="nav-services-col-items">
                        <a href="codigo-penal.html" class="nav-service-item ${activeSlug === 'codigo-penal' ? 'active' : ''}" data-keywords="código penal 51 artigos e dosimetria de penas">
                          <div class="nav-service-item-icon">
                            <i class="fa-solid fa-scale-balanced"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Código Penal</div>
                            <div class="nav-service-item-desc">51 Artigos e dosimetria de penas</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                        <a href="balanco-operacional.html" class="nav-service-item ${activeSlug === 'balanco-operacional' ? 'active' : ''}" data-keywords="balanço operacional estatísticas consolidadas sisp">
                          <div class="nav-service-item-icon">
                            <i class="fa-solid fa-chart-column"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Balanço Operacional</div>
                            <div class="nav-service-item-desc">Estatísticas consolidadas SISP</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                      </div>
                    </div>

                    <div class="nav-services-col" data-cat="gestao">
                      <div class="nav-services-col-header">
                        <i class="fa-solid fa-building-columns" style="color:#10b981;"></i>
                        <span>Gestão & Cidadão</span>
                        <span class="nav-services-col-badge">5</span>
                      </div>
                      <div class="nav-services-col-items">
                        <a href="transparencia.html" class="nav-service-item ${activeSlug === 'transparencia' ? 'active' : ''}" data-keywords="comunicados publicações e comunicados oficiais">
                          <div class="nav-service-item-icon">
                            <i class="fa-solid fa-bullhorn"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Comunicados</div>
                            <div class="nav-service-item-desc">Publicações e comunicados oficiais</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                        <a href="denuncias.html" class="nav-service-item ${activeSlug === 'denuncias' ? 'active' : ''}" data-keywords="denúncia 181 canal anônimo de denúncias">
                          <div class="nav-service-item-icon">
                            <i class="fa-solid fa-user-secret"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Denúncia 181</div>
                            <div class="nav-service-item-desc">Canal anônimo de denúncias</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                        <a href="certidao.html" class="nav-service-item ${activeSlug === 'certidao' ? 'active' : ''}" data-keywords="antecedentes folha de antecedentes criminais">
                          <div class="nav-service-item-icon">
                            <i class="fa-solid fa-award"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Antecedentes</div>
                            <div class="nav-service-item-desc">Folha de antecedentes criminais</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                        <a href="verificar-distintivo.html" class="nav-service-item ${activeSlug === 'verificar-distintivo' ? 'active' : ''}" data-keywords="validar distintivo verificação de autenticidade sisp">
                          <div class="nav-service-item-icon">
                            <i class="fa-solid fa-id-badge"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Validar Distintivo</div>
                            <div class="nav-service-item-desc">Verificação de autenticidade SISP</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                        <a href="download.html" class="nav-service-item ${activeSlug === 'download' ? 'active' : ''}" data-keywords="aplicativo desktop software oficial para windows">
                          <div class="nav-service-item-icon">
                            <i class="fa-brands fa-windows"></i>
                          </div>
                          <div class="nav-service-item-content">
                            <div class="nav-service-item-label">Aplicativo Desktop</div>
                            <div class="nav-service-item-desc">Software oficial para Windows</div>
                          </div>
                          <i class="fa-solid fa-chevron-right nav-service-item-arrow"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div class="nav-services-footer-bar">
                    <div class="nav-services-footer-item">
                      <i class="fa-brands fa-discord" style="color:#5865f2;"></i>
                      <span>Sincronizado ao Bot Discord SISP</span>
                    </div>
                    <div class="nav-services-footer-item">
                      <i class="fa-solid fa-bolt" style="color:#eab308;"></i>
                      <span>Acesso Rápido Funcional</span>
                    </div>
                    <div class="nav-services-footer-item" style="color:#94a3b8;font-size:0.7rem;">
                      Pressione <kbd>ESC</kbd> para fechar
                    </div>
                  </div>
                </div>
              </details>
            </li>
            <li id="nav-painel-link" style="display:none;">
              <a href="espelho-indisponivel.html"><i class="fa-solid fa-shield-halved"></i> Painel Admin</a>
            </li>
          </ul>
          <div class="nav-user-area" id="nav-user-area"></div>
        </div>
      </nav>
    `;
  }

  function renderFooterHtml() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid" style="grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 2rem;">
            <div>
              <div class="footer-brand">
                <img src="assets/logo.png" alt="Brasão Polícia Federal" style="width:40px;height:40px;object-fit:contain;opacity:0.9;">
                <div>
                  <div style="font-family:var(--font-heading);font-weight:700;color:#fff;font-size:1rem;letter-spacing:0.04em;">POLÍCIA FEDERAL</div>
                  <div style="font-size:0.78rem;color:var(--pc-gold);font-weight:600;">1ª Delegacia Central</div>
                </div>
              </div>
              <p style="font-size:0.82rem;color:rgba(255,255,255,0.65);margin-top:0.75rem;max-width:380px;line-height:1.5;">
                Responsável pela investigação, elucidação de crimes e garantia da segurança pública.
              </p>
            </div>
            <div>
              <div class="footer-col-title">SEDE CENTRAL</div>
              <ul class="footer-links">
                <li><i class="fa-solid fa-phone" style="color:var(--pc-gold);margin-right:0.4rem;"></i>Central de Atendimento (190 / 194)</li>
                <li><i class="fa-solid fa-shield" style="color:var(--pc-gold);margin-right:0.4rem;"></i>DICOR — Investigação e Inteligência</li>
                <li><i class="fa-solid fa-clock" style="color:var(--pc-gold);margin-right:0.4rem;"></i>Plantão Federal 24h — Sede Central</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom" style="display:flex;justify-content:center;align-items:center;padding:1.25rem 0;border-top:1px solid rgba(255,255,255,0.08);margin-top:1.5rem;">
            <span style="font-size:0.78rem;color:rgba(255,255,255,0.65);">© 2026 Polícia Federal — 1ª Delegacia Central. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    `;
  }

  function initHeaderAndFooter() {
    var headerPlaceholder = document.getElementById('site-header-placeholder');
    var footerPlaceholder = document.getElementById('site-footer-placeholder');

    var slug = getCurrentPath();

    if (headerPlaceholder && !headerPlaceholder.hasAttribute('data-rendered')) {
      headerPlaceholder.setAttribute('data-rendered', 'true');
      headerPlaceholder.innerHTML = renderHeaderHtml(slug);
    }

    if (footerPlaceholder && !footerPlaceholder.hasAttribute('data-rendered')) {
      footerPlaceholder.setAttribute('data-rendered', 'true');
      footerPlaceholder.outerHTML = renderFooterHtml();
    }

    // Attach details dropdown events
    var servicesDetails = document.getElementById('nav-services-details');
    var servicesInput = document.getElementById('nav-services-search-input');

    if (servicesDetails) {
      document.addEventListener('click', function (e) {
        if (servicesDetails.open && !servicesDetails.contains(e.target)) {
          servicesDetails.open = false;
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && servicesDetails.open) {
          servicesDetails.open = false;
        }
      });

      servicesDetails.addEventListener('toggle', function () {
        if (servicesDetails.open && servicesInput) {
          setTimeout(function () {
            servicesInput.focus();
          }, 100);
        }
      });
    }

    if (servicesInput && servicesDetails) {
      servicesInput.addEventListener('input', function (e) {
        var query = (e.target.value || '').toLowerCase().trim();
        var items = servicesDetails.querySelectorAll('.nav-service-item');
        var cols = servicesDetails.querySelectorAll('.nav-services-col');

        items.forEach(function (item) {
          var keywords = (item.getAttribute('data-keywords') || '') + ' ' + (item.textContent || '');
          var matches = !query || keywords.toLowerCase().indexOf(query) !== -1;
          item.style.display = matches ? '' : 'none';
        });

        cols.forEach(function (col) {
          var visibleItems = col.querySelectorAll('.nav-service-item:not([style*="display: none"])');
          col.style.display = (visibleItems.length > 0) ? '' : 'none';
        });
      });
    }

    // Attach mobile toggle button
    var toggleBtn = document.querySelector('.nav-mobile-toggle');
    var navMenu = document.getElementById('site-primary-nav');

    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = navMenu.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      });

      navMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          navMenu.classList.remove('active');
          toggleBtn.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', function (e) {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
          navMenu.classList.remove('active');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Trigger user auth render from main.js if available
    if (typeof window.renderNavUser === 'function') {
      window.renderNavUser();
    }
    if (typeof window.initDatetime === 'function') {
      window.initDatetime();
    }
  }

  // Modal maintenance notice helper
  window.mostrarAvisoIndisponivel = function (msg) {
    var modal = document.getElementById('modal-app-manutencao');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-app-manutencao';
      modal.className = 'modal-backdrop';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(7,16,29,0.85);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem;';
      modal.innerHTML = `
        <div style="background:#0f172a;border:1px solid #c8a951;border-radius:12px;max-width:500px;width:100%;box-shadow:0 25px 50px rgba(0,0,0,0.7);overflow:hidden;animation:modalIn 0.25s ease-out;">
          <div style="padding:1.25rem 1.5rem;background:#1e293b;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="background:rgba(200,169,81,0.15);border:1px solid rgba(200,169,81,0.3);width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#c8a951;">
                <i class="fa-solid fa-wrench"></i>
              </div>
              <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:#fff;">Aplicativo Desktop em Manutenção</h3>
            </div>
            <button type="button" onclick="document.getElementById('modal-app-manutencao').remove()" style="background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;padding:4px;" aria-label="Fechar aviso">&times;</button>
          </div>
          <div style="padding:1.5rem;">
            <div style="display:inline-block;background:rgba(200,169,81,0.1);color:#c8a951;border:1px solid rgba(200,169,81,0.25);padding:4px 10px;border-radius:4px;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:1rem;">
              <i class="fa-solid fa-clock-rotate-left"></i> Em breve
            </div>
            <p id="modal-app-msg" style="color:#e2e8f0;font-size:0.95rem;line-height:1.6;margin:0 0 18px;">
              ${msg || 'O aplicativo Desktop para Windows encontra-se temporariamente em manutenção técnica. Em breve uma nova versão estará disponível para download.'}
            </p>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;font-size:0.8rem;color:#94a3b8;line-height:1.5;">
              <i class="fa-solid fa-circle-info" style="color:#38bdf8;margin-right:6px;"></i>
              Você pode continuar utilizando o portal completo diretamente pelo navegador.
            </div>
          </div>
          <div style="padding:1rem 1.5rem;background:#0b1120;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:flex-end;gap:0.75rem;">
            <button type="button" class="btn btn-primary" onclick="document.getElementById('modal-app-manutencao').remove()">
              Entendido
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.remove();
      });
    } else {
      var msgEl = document.getElementById('modal-app-msg');
      if (msgEl && msg) msgEl.textContent = msg;
      modal.style.display = 'flex';
    }
  };

  // Run on start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderAndFooter);
  } else {
    initHeaderAndFooter();
  }

  // Also listen for window load to ensure everything is mounted
  window.addEventListener('load', function () {
    initHeaderAndFooter();
  });
})();
