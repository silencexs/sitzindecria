/**
 * offline-login.js
 * Intercepta o formulario de login localmente (modo offline / file://).
 * Nao modifica nenhum arquivo de UI existente.
 */
(function () {
  "use strict";

  /* 1. Detecta modo offline */
  var isOffline =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    (location.hostname !== "pcesp.duckdns.org" && location.hostname !== "");

  if (!isOffline) return;

  /* 2. Suprime fetch para /api/* */
  var originalFetch = window.fetch;
  window.fetch = function (url, opts) {
    var urlStr = String(url || "");
    if (
      urlStr.indexOf("/api/") === 0 ||
      urlStr.indexOf("pcesp.duckdns.org/api") !== -1
    ) {
      return Promise.resolve(
        new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
    return originalFetch.apply(this, arguments);
  };

  /* 3. Patch no objeto API apos carregamento */
  function patchAPI() {
    if (typeof window.API === "undefined") return;
    window.API.auth = window.API.auth || {};
    window.API.auth.login = function (passaporte, senha) {
      return new Promise(function (resolve, reject) {
        if (!passaporte || !senha) {
          reject(new Error("Preencha o ID/Passaporte e a Senha."));
          return;
        }
        resolve({
          token: "offline-token-" + Date.now(),
          user: {
            passaporte: passaporte,
            nome: "Usuario Local",
            cargo: "Visitante Offline",
            vinculo: "CIDADAO",
            must_change_password: false,
          },
          message: "Acesso local autorizado.",
        });
      });
    };
    window.API.auth.register = function () {
      return new Promise(function (resolve) {
        resolve({
          token: "offline-reg-" + Date.now(),
          user: { nome: "Novo Usuario", must_change_password: false },
          message: "Cadastro simulado (modo offline).",
        });
      });
    };
  }

  /* 4. Handler direto no formulario de login */
  function attachDirectHandler() {
    var form = document.getElementById("form-login");
    var errDiv = document.getElementById("login-error");
    var btn = document.getElementById("btn-login");
    if (!form) return;

    form.onsubmit = null;
    form.addEventListener(
      "submit",
      function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var passport = (document.getElementById("login-passport") || {}).value || "";
        var senha = (document.getElementById("login-senha") || {}).value || "";

        if (!passport.trim()) {
          if (errDiv) { errDiv.textContent = "Informe seu ID/Passaporte."; errDiv.style.display = "block"; }
          return;
        }
        if (!senha) {
          if (errDiv) { errDiv.textContent = "Informe sua senha."; errDiv.style.display = "block"; }
          return;
        }

        if (errDiv) errDiv.style.display = "none";
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Verificando...";
        }

        setTimeout(function () {
          window.location.href = "index.html";
        }, 600);
      },
      true
    );
  }

  /* 5. Boot */
  function boot() {
    patchAPI();
    attachDirectHandler();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", function () {
    patchAPI();
    attachDirectHandler();
  });
})();
