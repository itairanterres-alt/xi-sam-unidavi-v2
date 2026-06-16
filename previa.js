/* ============================================================
   XI SAM 2026 — "VER NA TV": overlay fullscreen com edição ao vivo.
   Submissão (rascunho) e Curadoria (trabalho) abrem o MESMO overlay.
   Layout: [barra topo · Fechar] · [pôster em iframe — reduz p/ caber,
   nunca coberto] · [barra inferior · Colunas 2/3 · Restaurar automático
   · Salvar]. As figuras editam-se por arraste DENTRO do iframe; o texto
   recompõe-se sozinho (FIT do renderizador). O overlay só hospeda os
   controles GLOBAIS e a persistência.

   abrir(opts):
     trabalho     — obj do trabalho (com figuras; ajuste_layout inicial)
     desenho      — (opcional) usado só p/ leitura; o iframe já recebe tudo
     editavel     — mostra controles + alças (default true)
     salvarLabel  — texto do botão salvar (default "Salvar ajuste")
     onSalvar(ajuste_layout) — Promise|valor; resolve => sucesso (msg opc.),
                    rejeita/throw => erro (usa .message). Ausente => sem botão.
   ============================================================ */
(function () {
  var overlay = null, onKey = null, onMsg = null;
  var ultimo = { ajuste_layout: "", colunas: 2 };
  var refs = {};

  function fechar() {
    if (onKey) { window.removeEventListener("keydown", onKey); onKey = null; }
    if (onMsg) { window.removeEventListener("message", onMsg); onMsg = null; }
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; refs = {};
    try { delete window.__SAM_PREVIA_T; } catch (e) { window.__SAM_PREVIA_T = null; }
  }

  function ler(raw) { try { if (!raw) return null; var o = typeof raw === "string" ? JSON.parse(raw) : raw; return (o && typeof o === "object") ? o : null; } catch (e) { return null; } }
  function postIframe(msg) { var ifr = overlay && overlay.querySelector("iframe"); if (ifr && ifr.contentWindow) ifr.contentWindow.postMessage(msg, "*"); }

  function segBtn(txt, active, onClick, extra) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = txt;
    b.style.cssText = "border:none;border-radius:8px;padding:7px 13px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;min-width:34px;" + (extra || "");
    estiloSeg(b, active); b.onclick = onClick;
    return b;
  }
  function estiloSeg(b, active) {
    b.style.background = active ? "#00ADEF" : "rgba(255,255,255,0.12)";
    b.style.color = "#fff";
    b.style.boxShadow = active ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.28)";
  }

  function atualizarColunas(c) { ultimo.colunas = c; if (refs.col2 && refs.col3) { estiloSeg(refs.col2, c === 2); estiloSeg(refs.col3, c === 3); } }
  function atualizarReset() { if (refs.reset) { var on = !!ultimo.ajuste_layout; refs.reset.style.opacity = on ? "1" : "0.45"; refs.reset.style.pointerEvents = on ? "auto" : "none"; } }

  function abrir(opts) {
    opts = opts || {};
    var trabalho = opts.trabalho || opts; // tolera abrir(trabalho) legado
    var editavel = opts.editavel !== false;
    window.__SAM_PREVIA_T = trabalho;
    try { localStorage.setItem("sam_previa_tv", JSON.stringify(trabalho)); } catch (e) {}
    var ajIni = ler(trabalho.ajuste_layout);
    ultimo = { ajuste_layout: trabalho.ajuste_layout || "", colunas: ajIni && ajIni.colunas === 3 ? 3 : 2 };

    // já aberto → recarrega conteúdo
    if (overlay) { postIframe({ tipo: "sam-previa", trabalho: trabalho }); postIframe({ tipo: "sam-editavel", editavel: editavel }); atualizarColunas(ultimo.colunas); atualizarReset(); return; }

    overlay = document.createElement("div");
    overlay.setAttribute("data-sam-previa", "1");
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0A1422;display:flex;flex-direction:column;font-family:'IBM Plex Sans',system-ui,sans-serif;";

    /* ---- barra superior ---- */
    var top = document.createElement("div");
    top.style.cssText = "flex:0 0 auto;height:46px;display:flex;align-items:center;gap:10px;padding:0 14px;background:#01285A;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);";
    top.innerHTML = '<span style="font-size:11px;font-weight:800;letter-spacing:0.8px;color:#00ADEF;text-transform:uppercase;">Prévia na TV</span>'
      + '<span style="font-size:13px;opacity:0.82;">Pôster como aparece no telão (1920×1080, sem rolagem)</span>';
    var bx = document.createElement("button");
    bx.type = "button"; bx.setAttribute("aria-label", "Fechar prévia");
    bx.style.cssText = "margin-left:auto;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.12);color:#fff;font-family:inherit;font-size:13px;font-weight:700;border-radius:9px;padding:7px 13px;cursor:pointer;";
    bx.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg> Fechar';
    bx.onclick = fechar; top.appendChild(bx);

    /* ---- painel do pôster (iframe) ---- */
    var pane = document.createElement("div");
    pane.style.cssText = "flex:1 1 auto;min-height:0;position:relative;";
    var ifr = document.createElement("iframe");
    ifr.src = "previa-tv.html?ts=" + Date.now();
    ifr.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#0A1422;";
    ifr.addEventListener("load", function () { postIframe({ tipo: "sam-previa", trabalho: trabalho }); postIframe({ tipo: "sam-editavel", editavel: editavel }); });
    pane.appendChild(ifr);

    /* ---- barra inferior (controles globais) ---- */
    var bot = document.createElement("div");
    bot.style.cssText = "flex:0 0 auto;min-height:60px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:10px 16px;background:#0E2038;color:#fff;border-top:1px solid rgba(255,255,255,0.08);";

    if (editavel) {
      // colunas
      var grpCol = document.createElement("div");
      grpCol.style.cssText = "display:flex;align-items:center;gap:7px;";
      var lblCol = document.createElement("span");
      lblCol.textContent = "Colunas"; lblCol.style.cssText = "font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#8FB4DE;";
      refs.col2 = segBtn("2", ultimo.colunas === 2, function () { atualizarColunas(2); postIframe({ tipo: "sam-colunas", colunas: 2 }); });
      refs.col3 = segBtn("3", ultimo.colunas === 3, function () { atualizarColunas(3); postIframe({ tipo: "sam-colunas", colunas: 3 }); });
      grpCol.appendChild(lblCol); grpCol.appendChild(refs.col2); grpCol.appendChild(refs.col3);
      bot.appendChild(grpCol);

      // dica
      var dica = document.createElement("span");
      dica.style.cssText = "font-size:12.5px;color:#A9C0DC;line-height:1.35;max-width:480px;";
      dica.innerHTML = 'Toque (ou passe o mouse) em uma figura para ajustar · escolha <b>P / M / G / XG</b> · <b>◀ ▶</b> troca o lado. O texto se recompõe sozinho.';
      bot.appendChild(dica);

      // grupo direito: reset + salvar + status
      var dir = document.createElement("div");
      dir.style.cssText = "margin-left:auto;display:flex;align-items:center;gap:12px;";
      var status = document.createElement("span");
      status.style.cssText = "font-size:12.5px;font-weight:600;color:#8FB4DE;"; refs.status = status;
      // reset
      refs.reset = document.createElement("button");
      refs.reset.type = "button";
      refs.reset.style.cssText = "display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,0.34);background:transparent;color:#fff;font-family:inherit;font-size:13px;font-weight:700;border-radius:9px;padding:8px 13px;cursor:pointer;";
      refs.reset.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> Restaurar automático';
      refs.reset.title = "Volta ao layout automático (descarta os ajustes manuais)";
      refs.reset.onclick = function () { atualizarColunas(2); postIframe({ tipo: "sam-reset" }); status.textContent = ""; };
      dir.appendChild(status); dir.appendChild(refs.reset);

      if (typeof opts.onSalvar === "function") {
        var salvar = document.createElement("button");
        salvar.type = "button";
        salvar.style.cssText = "display:inline-flex;align-items:center;gap:8px;border:none;background:#00ADEF;color:#04243F;font-family:inherit;font-size:13.5px;font-weight:800;border-radius:9px;padding:9px 17px;cursor:pointer;";
        salvar.textContent = opts.salvarLabel || "Salvar ajuste";
        salvar.onclick = function () {
          salvar.disabled = true; var prev = salvar.textContent; salvar.textContent = "Salvando…"; status.style.color = "#8FB4DE"; status.textContent = "";
          Promise.resolve().then(function () { return opts.onSalvar(ultimo.ajuste_layout); })
            .then(function (msg) { status.style.color = "#7CE0A8"; status.textContent = (typeof msg === "string" && msg) ? msg : "Ajuste salvo."; })
            .catch(function (err) { status.style.color = "#FF9B9B"; status.textContent = (err && err.message) ? err.message : "Não foi possível salvar."; })
            .then(function () { salvar.disabled = false; salvar.textContent = prev; });
        };
        dir.appendChild(salvar);
      }
      bot.appendChild(dir);
    } else {
      var so = document.createElement("span");
      so.style.cssText = "font-size:12.5px;color:#A9C0DC;"; so.textContent = "Somente visualização.";
      bot.appendChild(so);
    }

    overlay.appendChild(top); overlay.appendChild(pane); overlay.appendChild(bot);
    document.body.appendChild(overlay);
    atualizarReset();

    // recebe estado do iframe (string do contrato + colunas) p/ Salvar/Reset
    onMsg = function (e) {
      var d = e.data || {};
      if (d.tipo === "sam-ajuste-pronto") { ultimo.ajuste_layout = d.ajuste_layout || ""; if (typeof d.colunas === "number") atualizarColunas(d.colunas); atualizarReset(); }
    };
    window.addEventListener("message", onMsg);
    onKey = function (e) { if (e.key === "Escape") fechar(); };
    window.addEventListener("keydown", onKey);
  }

  window.SAM_PREVIA = { abrir: abrir, fechar: fechar };
})();
