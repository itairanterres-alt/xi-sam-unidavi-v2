/* ============================================================
   XI SAM 2026 — PAINÉIS LED (384×768)
   Gera 2 painéis por dia a partir de window.PROGRAMA:
     · Apresentações orais  (acento ciano)
     · Pôsteres             (acento âmbar/ouro)
   Cada painel traz QR da programação completa + QR da
   transmissão ao vivo (YouTube) daquele dia.
   ============================================================ */
(function () {
  const PROG = window.PROGRAMA, DIAS = window.DIAS, AREA = window.AREA_COR;
  const SITE = "https://xi-sam-unidavi.vercel.app/";

  function dayParts(d) { const [w, dt] = d.split(" · "); return { w, dt }; }

  function qrURL(text, cell, margin) {
    const qr = qrcode(0, "M");
    qr.addData(text); qr.make();
    return qr.createDataURL(cell || 5, margin == null ? 1 : margin);
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function chip(area) {
    const c = AREA[area] || "#5B6B7E";
    return `<span class="area" style="background:${c}">${esc(area)}</span>`;
  }

  function itemOral(o) {
    return `<div class="item">
      <div class="topline"><span class="time">${esc(o.hora)}</span>${chip(o.area)}</div>
      <div class="title">${esc(o.titulo)}</div>
      <div class="ap"><span class="dot"></span>${esc(o.ap)}</div>
    </div>`;
  }
  function itemPoster(p) {
    return `<div class="item">
      <div class="topline"><span class="time">Pôster ${p.n}</span>${chip(p.area)}</div>
      <div class="title">${esc(p.titulo)}</div>
      <div class="ap"><span class="dot"></span>${esc(p.ap)}</div>
    </div>`;
  }

  function panel(dia, tipo) {
    const d = PROG[dia];
    const { w, dt } = dayParts(dia);
    const isOral = tipo === "oral";
    const items = isOral ? d.orais : d.posteres;
    const accent = isOral ? "#00ADEF" : "#E9B23C";
    const typeLabel = isOral ? "APRESENTAÇÕES ORAIS" : "PÔSTERES";
    const venue = isOral
      ? "Auditório Célio Simão Martignago"
      : "Hall do Auditório · Science with Coffee";
    const lines = items.length <= 5 ? 3 : 2;
    const itemsHTML = items.map(isOral ? itemOral : itemPoster).join("");
    const qrProg = qrURL(SITE, 5, 1);
    const qrYt = d.youtube ? qrURL(d.youtube, 5, 1) : null;

    return `<div class="panel" data-tipo="${tipo}" style="--accent:${accent};--lines:${lines}">
      <div class="pHead">
        <div class="brandRow">
          <span class="wm">XI<b>SAM</b><i>26</i></span>
          <span class="ev">SEMANA ACADÊMICA DA MEDICINA · UNIDAVI</span>
        </div>
        <div class="typeBand">
          <div class="bandTop">
            <span class="day">${esc(w).toUpperCase()} · ${esc(dt)}</span>
            <span class="count">${items.length} ${isOral ? "trabalhos" : "pôsteres"}</span>
          </div>
          <div class="type">${typeLabel}</div>
          <div class="venue">${esc(venue)}</div>
        </div>
      </div>
      <div class="pList">${itemsHTML}</div>
      <div class="pFoot">
        <div class="qrRow">
          <div class="qrCard">
            <img class="qr" src="${qrProg}" alt="QR programação">
            <div class="qrTxt"><b>PROGRAMAÇÃO</b><span class="url">xi-sam-unidavi.vercel.app</span></div>
          </div>
          ${qrYt ? `<div class="qrCard">
            <img class="qr" src="${qrYt}" alt="QR transmissão">
            <div class="qrTxt"><b>AO VIVO</b><span>YouTube · Universo Unidavi</span></div>
          </div>` : ""}
        </div>
        <img class="logos" src="assets/logo-strip.jpeg" alt="UNIDAVI Medicina · LigaMed · XI SAM">
      </div>
    </div>`;
  }

  window.SAM_PANELS = function () {
    const list = [];
    DIAS.forEach((dia) => {
      list.push({ dia, tipo: "oral" });
      list.push({ dia, tipo: "poster" });
    });
    return list.map((p, i) => ({
      idx: i,
      dia: p.dia,
      tipo: p.tipo,
      file: fileName(p.dia, p.tipo),
      html: panel(p.dia, p.tipo),
    }));
  };

  function fileName(dia, tipo) {
    // "Ter · 23/06" -> "23-06"
    const dt = dia.split(" · ")[1].replace("/", "-");
    return `${dt}_${tipo === "oral" ? "orais" : "posteres"}.png`;
  }
})();
