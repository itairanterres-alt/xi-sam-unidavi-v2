/* ============================================================
   XI SAM 2026 — AJUSTE_LAYOUT (DOC 3): construir/ler/aplicar.
   FONTE ÚNICA do FORMATO do contrato. Usado pela SUBMISSÃO e pela
   CURADORIA para gravar o campo `ajuste_layout`, e para recarregá-lo
   de volta nos controles. O RENDERIZADOR (posters.jsx) lê o mesmo
   formato. NÃO muda o contrato de dados — só monta/parseia a string.

   Chave de figura (DOC 3): "<Rótulo da seção>:<índice no bucket>".
   O RÓTULO vem do esquema.js (varia por desenho); o índice é a
   posição da figura DENTRO do seu bucket canônico (f.secao), na
   ordem em que o aluno as listou. Depende de window.SAM_ESQUEMA.
   ============================================================ */
(function () {
  function _secMap(desenho) {
    const m = {};
    if (window.SAM_ESQUEMA && typeof window.SAM_ESQUEMA.secoesDe === "function") {
      window.SAM_ESQUEMA.secoesDe({ desenho }).forEach((s) => { if (s.sec) m[s.sec] = s.rotulo; });
    }
    return m;
  }
  /* chave de contrato de cada figura, na mesma ordem da lista recebida */
  function chavesDe(figs, desenho) {
    const secMap = _secMap(desenho);
    const counts = {};
    return (figs || []).map((fg) => {
      const b = fg.secao || "Outra";
      const idx = counts[b] || 0; counts[b] = idx + 1;
      return (secMap[b] || b) + ":" + idx;
    });
  }
  /* monta a STRING ajuste_layout a partir das figuras (com tamanho/lado
     opcionais por figura) e do número de colunas. Retorna "" quando não
     há nada a salvar (colunas padrão 2 e nenhuma figura ajustada) =>
     ausência => o renderizador usa a heurística automática (DOC 4). */
  function montar(figs, colunas, desenho) {
    const chaves = chavesDe(figs, desenho);
    const figuras = {};
    (figs || []).forEach((fg, i) => {
      if (fg && (fg.tamanho || fg.lado || fg.secaoOverride)) {
        const o = {};
        if (fg.tamanho) o.tamanho = fg.tamanho;
        if (fg.lado) o.lado = fg.lado;
        if (fg.secaoOverride) o.secao = fg.secaoOverride;
        figuras[chaves[i]] = o;
      }
    });
    const col = colunas === 3 ? 3 : 2;
    const temFig = Object.keys(figuras).length > 0;
    if (col === 2 && !temFig) return "";
    const out = { v: 3, colunas: col };
    if (temFig) out.figuras = figuras;
    return JSON.stringify(out);
  }
  function ler(raw) {
    try { if (!raw) return null; const o = typeof raw === "string" ? JSON.parse(raw) : raw; return (o && typeof o === "object") ? o : null; }
    catch (e) { return null; }
  }
  /* devolve uma NOVA lista de figs com tamanho/lado preenchidos a partir
     de um ajuste lido (round-trip nos controles). */
  function aplicar(figs, desenho, aj) {
    if (!aj || !aj.figuras) return figs || [];
    const chaves = chavesDe(figs, desenho);
    return (figs || []).map((fg, i) => {
      const o = aj.figuras[chaves[i]];
      return o ? { ...fg, tamanho: o.tamanho || fg.tamanho, lado: o.lado || fg.lado, secaoOverride: o.secao || fg.secaoOverride } : fg;
    });
  }
  window.SAM_AJUSTE = { montar, ler, aplicar, chavesDe };
})();
