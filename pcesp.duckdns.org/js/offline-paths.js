(function () {
  var LOCAL_PAGES = {
    "transparencia": "transparencia.html",
    "admin": "espelho-indisponivel.html",
    "": "index.html",
    "index": "index.html",
    "index.html": "index.html",
    "login": "login.html",
    "delegacia-virtual": "delegacia-virtual.html",
    "codigo-penal": "codigo-penal.html",
    "download": "download.html",
    "procurados": "procurados.html",
    "atendimento": "atendimento.html",
    "certidao": "certidao.html",
    "denuncias": "denuncias.html",
    "verificar-distintivo": "verificar-distintivo.html",
    "balanco-operacional": "balanco-operacional.html",
    "prontuarios": "prontuarios.html",
    "recrutamento": "recrutamento.html",
    "privacidade": "privacidade.html",
    "cidade": "cidade.html",
    "perfil": "perfil.html",
    "central": "central.html",
    "comunicados": "transparencia.html",
    "meus-protocolos": "protocolos.html",
    "protocolos": "protocolos.html"
  };

  function splitParts(href) {
    var hash = "";
    var search = "";
    var path = href;
    var h = path.indexOf("#");
    if (h >= 0) {
      hash = path.slice(h);
      path = path.slice(0, h);
    }
    var q = path.indexOf("?");
    if (q >= 0) {
      search = path.slice(q);
      path = path.slice(0, q);
    }
    return { path: path, search: search, hash: hash };
  }

  function pageFile(slug) {
    slug = String(slug || "")
      .replace(/^\/+/, "")
      .replace(/\.html$/i, "");
    if (Object.prototype.hasOwnProperty.call(LOCAL_PAGES, slug)) return LOCAL_PAGES[slug];
    if (!slug) return "index.html";
    return "espelho-indisponivel.html";
  }

  function localFromSitePath(pathname, search, hash) {
    var file = (pathname || "/").replace(/\\/g, "/");
    var marker = "/pcesp.duckdns.org/";
    var idx = file.toLowerCase().indexOf(marker);
    if (idx >= 0) file = file.slice(idx + marker.length);
    file = file.replace(/^\/+/, "");
    if (!file || file === "index.html") return "index.html" + (search || "") + (hash || "");
    if (/\.(png|jpe?g|gif|webp|svg|ico|css|js|woff2?|ttf|eot|exe)$/i.test(file)) {
      return file + (search || "") + (hash || "");
    }
    return pageFile(file) + (search || "") + (hash || "");
  }

  function toLocalHref(raw) {
    if (raw == null) return raw;
    var href = String(raw).trim();
    if (!href) return href;
    if (/^(#|mailto:|tel:|javascript:|data:|blob:)/i.test(href)) return href;
    if (href.charAt(0) === "/" && href.charAt(1) !== "/") {
      var p = splitParts(href);
      return localFromSitePath(p.path, p.search, p.hash);
    }
    if (/^https?:\/\/pcesp\.duckdns\.org/i.test(href)) {
      var p2 = splitParts(href.replace(/^https?:\/\/pcesp\.duckdns\.org/i, ""));
      if (!p2.path || p2.path === "/") return "index.html" + p2.search + p2.hash;
      return localFromSitePath(p2.path, p2.search, p2.hash);
    }
    return href;
  }

  function toLocalSrc(raw) {
    if (raw == null) return raw;
    var src = String(raw);
    if (/^(data:|blob:|javascript:)/i.test(src)) return src;
    src = src.replace(/^https?:\/\/pcesp\.duckdns\.org\//i, "");
    if (src.charAt(0) === "/" && src.charAt(1) !== "/") src = src.replace(/^\/+/, "");
    src = src.replace(/^\.\/[^"]*_files\//, function (_, all) {
      return "assets/";
    });
    src = src.replace(/Autentica[^"]*_files\//g, "assets/");
    src = src.replace(/\.download$/i, "");
    if (/logo\.png(\?|$)/i.test(src)) return "assets/logo.png";
    if (/sp_flag\.png/i.test(src)) return "assets/sp_flag.png";
    if (/thumbnail\.png/i.test(src) && src.indexOf("http") !== 0) return src.replace(/^.*thumbnail\.png/i, "assets/thumbnail.png");
    return src;
  }

  function rewriteNode(root) {
    if (!root) return;
    var scope = root.querySelectorAll ? root : document;
    if (root.querySelectorAll) {
      root.querySelectorAll("a[href]").forEach(function (el) {
        var next = toLocalHref(el.getAttribute("href"));
        if (next != null && next !== el.getAttribute("href")) el.setAttribute("href", next);
      });
      root.querySelectorAll("[src]").forEach(function (el) {
        var next = toLocalSrc(el.getAttribute("src"));
        if (next != null && next !== el.getAttribute("src")) el.setAttribute("src", next);
      });
      root.querySelectorAll("link[href]").forEach(function (el) {
        var rel = (el.getAttribute("rel") || "").toLowerCase();
        var href = el.getAttribute("href") || "";
        if (rel.indexOf("stylesheet") >= 0 || rel.indexOf("icon") >= 0) {
          var next = toLocalSrc(href);
          if (next != null && next !== href) el.setAttribute("href", next);
        } else {
          var nextHref = toLocalHref(href);
          if (nextHref != null && nextHref !== href) el.setAttribute("href", nextHref);
        }
      });
    }
  }

  function boot() {
    rewriteNode(document);
  }

  var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
      record.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) rewriteNode(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  boot();
  document.addEventListener("DOMContentLoaded", boot);
})();


