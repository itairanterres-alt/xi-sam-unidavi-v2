/* ============================================================
   SAM · MEDICINA UNIDAVI — ARQUIVO DE EDIÇÕES
   Página de uma edição arquivada (route-ready: #/edicao/:id).
   Renderização DIRIGIDA POR CAMPO: campo nulo / lista vazia → não
   renderiza rótulo nem linha. poster_tc1 nunca exibe vídeo.
   ============================================================ */

/* ---- registro de edições (route-ready). Navegação entre edições = commit 2 ---- */
const EDICOES_INDEX = {
  xi:   { file: "xi_sam.json" },
  i:    { file: "i_sam.json" },
  ii:   { file: "ii_sam.json" },
  iii:  { file: "iii_sam.json" },
  iv:   { file: "iv_sam.json" },
  v:    { file: "v_sam.json" },
  vi:   { file: "vi_sam.json" },
  vii:  { file: "vii_sam.json" },
  viii: { file: "viii_sam.json" },
  ix:   { file: "ix_sam.json" },
  x:    { file: "x_sam.json" },
};

/* ---- cor da área: paleta oficial; áreas novas ganham cor estável
   (oklch de mesma leveza/croma, hue derivado do nome) ---- */
function corArea(area) {
  if (!area) return C.cinza;
  if (AREA_COR[area]) return AREA_COR[area];
  let h = 0;
  for (let i = 0; i < area.length; i++) h = (h * 31 + area.charCodeAt(i)) % 360;
  return `oklch(0.52 0.12 ${h})`;
}

/* ---- nomes legíveis dos dias a partir de "DD/MM" ---- */
function _ddmm(s) { const m = String(s || "").match(/(\d{2})\/(\d{2})/); return m ? m[1] + "/" + m[2] : null; }

/* ---- realça "Medicina" em ciano dentro do nome da edição ---- */
function nomeRealce(nome) {
  return String(nome || "").split(/(Medicina)/).map((p, i) =>
    p === "Medicina" ? <span key={i} style={{ color:C.ciano }}>{p}</span> : p
  );
}

/* ============================================================
   CABEÇALHO — "SAM · Medicina UNIDAVI" (linka à raiz)
   ============================================================ */
function EdicaoHeader() {
  return (
    <header style={{ background:"#fff", borderBottom:"1px solid #E3EAF2", position:"sticky", top:0, zIndex:10 }}>
      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 16px", display:"flex", alignItems:"center", gap:12, height:60 }}>
        <a href="index.html" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none" }}>
          <div style={{ height:42, padding:"0 12px", borderRadius:10, background:C.azul, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src={(window.__resources && window.__resources.logoUnidavi) || "assets/logo-unidavi.png"} alt="UNIDAVI" style={{ height:24, width:"auto", display:"block" }} />
          </div>
          <div style={{ lineHeight:1, paddingLeft:12, borderLeft:"1px solid #E3EAF2" }}>
            <div style={{ fontWeight:800, fontSize:17, color:C.azul, letterSpacing:-0.3, whiteSpace:"nowrap" }}>SAM <span style={{ color:C.ciano }}>·</span> Medicina UNIDAVI</div>
            <div style={{ fontSize:11, color:C.cinza, marginTop:3, whiteSpace:"nowrap" }}>Arquivo de edições</div>
          </div>
        </a>
        <nav style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          <a href="index.html" style={{ fontSize:14, fontWeight:700, textDecoration:"none", padding:"10px 14px", borderRadius:9, color:C.cinza }}>Edição atual</a>
        </nav>
      </div>
    </header>
  );
}

/* ============================================================
   HERO — consome só a Edicao. Arte-base padrão da SAM quando
   arteFundo é null; texto da edição sobreposto na faixa escura.
   ============================================================ */
function HeroEdicao({ ed }) {
  const encerrada = ed.status === "encerrada";
  const arteOverride = ed.arteFundo ? { backgroundImage:`url(${ed.arteFundo})` } : undefined;
  return (
    <div className="hero-wrap" style={{ position:"relative", borderRadius:18, overflow:"hidden", background:C.azulEsc, boxShadow:"0 10px 30px rgba(2,40,90,0.16)", display:"flex" }}>
      <div className="hero-arte" style={arteOverride} />
      <div className="hero-scrim" />
      <div className="hero-pad">
        <div className="hero-card">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:12, fontWeight:700, letterSpacing:1.4, textTransform:"uppercase", color:encerrada ? "#9FD9F5" : C.ciano, background:"rgba(0,173,239,0.14)", border:"1px solid rgba(0,173,239,0.35)", borderRadius:999, padding:"6px 13px" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:encerrada ? "#7FCBEE" : "#3FD27A", flexShrink:0 }} />
              {encerrada ? "Edição encerrada" : "Edição em andamento"}
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:"clamp(14px,2.4vw,26px)", flexWrap:"wrap" }}>
            <span style={{ fontSize:"clamp(64px, 12vw, 132px)", fontWeight:800, lineHeight:0.82, color:"#fff", letterSpacing:-3 }}>{ed.edicaoRomano}</span>
            <span style={{ fontSize:"clamp(13px,1.5vw,17px)", fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:C.ciano }}>SAM</span>
          </div>
          <h1 style={{ fontSize:"clamp(20px, 2.7vw, 30px)", fontWeight:700, color:"#fff", letterSpacing:-0.4, margin:"18px 0 0", lineHeight:1.18, textWrap:"balance" }}>{nomeRealce(ed.nome)}</h1>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 22px", marginTop:18, color:"rgba(255,255,255,0.92)", fontSize:"clamp(14px,1.5vw,16.5px)" }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:8, fontWeight:600 }}>
              <CalendarDays size={18} color={C.ciano} /> {ed.datasTexto}
            </span>
            {ed.local ? (
              <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}><MapPin size={18} color={C.ciano} /> {ed.local}</span>
            ) : null}
            {ed.modalidade ? (
              <span style={{ display:"inline-flex", alignItems:"center", gap:8, textTransform:"capitalize" }}><Monitor size={18} color={C.ciano} /> {ed.modalidade}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TRANSMISSÕES — vídeos a nível de edição (YouTube). Só quando
   a edição os tem (status/encerrada → arquivo das transmissões).
   ============================================================ */
function TransmissoesEdicao({ videos, resumo }) {
  const temVideos = !!(videos && videos.length);
  if (!temVideos && !resumo) return null;
  return (
    <div style={{ marginTop:22 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <Monitor size={18} color={C.azul} />
        <h2 style={{ fontSize:16, fontWeight:800, color:C.tinta, margin:0 }}>Transmissões</h2>
        <span style={{ fontSize:12.5, color:C.cinza }}>· gravações no canal UNIDAVI TV</span>
      </div>
      {resumo ? (
        <a href={resumo} target="_blank" rel="noopener noreferrer" className="card-link"
          style={{ display:"inline-flex", alignItems:"center", gap:11, textDecoration:"none", background:"#FF0000", color:"#fff", borderRadius:11, padding:"11px 18px", fontWeight:700, fontSize:14, marginBottom:temVideos ? 12 : 0, boxShadow:"0 4px 14px rgba(255,0,0,0.22)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
          Vídeo-resumo da edição
        </a>
      ) : null}
      {temVideos ? (
        <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
          {videos.map((v) => (
            <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer" className="card-link"
              style={{ display:"inline-flex", alignItems:"center", gap:9, textDecoration:"none", background:"#fff", border:"1px solid #E3EAF2", borderRadius:11, padding:"10px 15px", color:C.tinta, fontWeight:700, fontSize:13.5 }}>
              <span style={{ width:26, height:26, borderRadius:7, background:"#FF0000", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
              </span>
              {v.rotulo}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   AVISO DE COBERTURA — só ajusta a expectativa do leitor para
   edições parciais. Cobertura "completa" → sem aviso.
   ============================================================ */
const _COBERTURA_AVISO = {
  cronograma: "Esta edição tem apenas o cronograma — os trabalhos individuais ainda não foram catalogados.",
  titulos: "Desta edição registramos os títulos dos trabalhos; alguns papéis e detalhes ainda estão sendo coletados.",
  programa_autor: "Desta edição registramos o programa e a autoria; alguns papéis e resumos ainda estão sendo coletados.",
};
function AvisoCobertura({ cobertura }) {
  const txt = _COBERTURA_AVISO[cobertura];
  if (!txt) return null;
  return (
    <div style={{ marginTop:18, display:"flex", gap:11, alignItems:"flex-start", background:"#FBF6EA", border:"1px solid #EAD9AE", borderRadius:12, padding:"13px 16px", color:"#7A5A12", fontSize:13.5, lineHeight:1.45 }}>
      <Layers size={17} color="#B07A18" style={{ flexShrink:0, marginTop:1 }} />
      <span>{txt}</span>
    </div>
  );
}

/* ============================================================
   PAPÉIS DO TRABALHO — dirigido por campo: só renderiza o que existe.
   ============================================================ */
function _val(x) { const s = (x == null ? "" : String(x)).trim(); return (s === "" || s === "—" || s === "-" || s === "–") ? null : s; }
function _lista(v) { return Array.isArray(v) ? v.map(_val).filter(Boolean) : []; }
function RolesTrabalho({ t }) {
  /* limpa superscritos de afiliação (¹²³) e índices numéricos finais */
  const _limparAut = (s) => String(s || "")
    .replace(/[\u00B2\u00B3\u00B9\u2070-\u209F\u2020\u2021\u00A7\u00B6\*]/g, "")
    .replace(/\s*\d+(?:\s*[,;]\s*\d+)*\s*$/g, "")
    .replace(/\s{2,}/g, " ").trim();
  const autLimpos = _lista(t.autores).map(_limparAut).filter(Boolean);
  const linhas = [];
  if (autLimpos.length > 1) linhas.push(["Autoria", autLimpos.join(" · ")]);
  if (_val(t.orientador)) linhas.push(["Orientação", _val(t.orientador)]);
  if (_lista(t.coorientadores).length) linhas.push(["Coorientação", _lista(t.coorientadores).join(" · ")]);
  if (_val(t.profUc)) linhas.push(["Prof.ª da UC", _val(t.profUc)]);
  if (_val(t.avaliador)) linhas.push(["Avaliação", _val(t.avaliador)]);
  if (_lista(t.colaboradores).length) linhas.push(["Colaboração", _lista(t.colaboradores).join(" · ")]);
  if (!linhas.length) return null;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"6px 14px", marginTop:14, paddingTop:14, borderTop:"1px solid #EEF2F6" }}>
      {linhas.map(([rot, val]) => (
        <React.Fragment key={rot}>
          <div style={{ fontSize:11.5, fontWeight:700, letterSpacing:0.3, textTransform:"uppercase", color:C.cinza, whiteSpace:"nowrap", paddingTop:1 }}>{rot}</div>
          <div style={{ fontSize:13.5, color:C.tinta, lineHeight:1.45 }}>{val}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============================================================
   MATERIAIS SUPLEMENTARES — figuras, foto dos autores, palavras-
   chave, afiliação e referências que os alunos anexaram (XI SAM+).
   Dirigido por campo: edições sem esses campos não renderizam nada.
   ============================================================ */
function MateriaisTrabalho({ t, cor }) {
  const [ampliada, setAmpliada] = useState(null);
  const figuras = Array.isArray(t.figuras) ? t.figuras.filter((f) => f && _val(f.url)) : [];
  const palavras = _lista(t.palavras);
  const refs = _val(t.referencias);
  const afil = _val(t.afiliacao);
  if (!figuras.length && !palavras.length && !refs && !afil) return null;
  return (
    <React.Fragment>
      {palavras.length ? (
        <div style={{ marginTop:14, display:"flex", flexWrap:"wrap", gap:7 }}>
          {palavras.map((p, i) => (
            <span key={i} style={{ fontSize:11.5, fontWeight:600, color:C.cinza, background:C.cinzaClaro, borderRadius:999, padding:"3px 11px" }}>{p}</span>
          ))}
        </div>
      ) : null}
      {figuras.length ? (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:11.5, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Figuras <span style={{ color:C.cinza }}>· {figuras.length}</span></div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:14 }}>
            {figuras.map((f, i) => (
              <figure key={i} style={{ margin:0, border:"1px solid #E3EAF2", borderRadius:11, overflow:"hidden", background:"#fff" }}>
                <div onClick={() => setAmpliada(f.url)} style={{ display:"block", background:C.cinzaClaro, cursor:"zoom-in" }}>
                  <img src={f.url} alt={f.titulo || ("Figura " + (f.ordem || i + 1))} loading="lazy" referrerPolicy="no-referrer" style={{ display:"block", width:"100%", height:160, objectFit:"cover" }} />
                </div>
                <figcaption style={{ padding:"9px 11px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                    {f.principal ? <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:0.4, textTransform:"uppercase", color:"#fff", background:cor, borderRadius:999, padding:"2px 7px" }}>Principal</span> : null}
                    {_val(f.secao) ? <span style={{ fontSize:10.5, fontWeight:700, color:C.cinza, textTransform:"uppercase", letterSpacing:0.3 }}>{f.secao}</span> : null}
                  </div>
                  {_val(f.titulo) ? <div style={{ fontSize:12.5, fontWeight:700, color:C.tinta, lineHeight:1.3 }}>{f.titulo}</div> : null}
                  {_val(f.legenda) ? <div style={{ fontSize:11.5, color:C.cinza, lineHeight:1.4, marginTop:3 }}>{f.legenda}</div> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      {afil ? (
        <div style={{ marginTop:14 }}>
          <div style={{ fontSize:11.5, fontWeight:800, color:C.cinza, textTransform:"uppercase", letterSpacing:0.5, marginBottom:5 }}>Afiliação</div>
          <div style={{ fontSize:12, color:C.cinza, lineHeight:1.5 }}>{afil}</div>
        </div>
      ) : null}
      {refs ? (
        <details style={{ marginTop:14, border:"1px solid #EEF2F6", borderRadius:10, overflow:"hidden" }}>
          <summary style={{ cursor:"pointer", padding:"10px 13px", fontSize:11.5, fontWeight:800, color:C.cinza, textTransform:"uppercase", letterSpacing:0.5, background:C.papel }}>Referências</summary>
          <div style={{ padding:"4px 13px 13px", fontSize:12, color:C.tinta, lineHeight:1.55, whiteSpace:"pre-wrap" }}>{refs}</div>
        </details>
      ) : null}
      {ampliada ? ReactDOM.createPortal(
        <div onClick={() => setAmpliada(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out" }}>
          <img src={ampliada} alt="" referrerPolicy="no-referrer" style={{ maxWidth:"92vw", maxHeight:"92vh", borderRadius:12, boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }} />
        </div>, document.body
      ) : null}
    </React.Fragment>
  );
}

/* ============================================================
   CARD DE TRABALHO — abre/fecha (acordeão) para revelar papéis.
   Botão "Assistir à apresentação": aparece em todo card que tenha
   videoUrl preenchido (link do YouTube já no timestamp do trabalho);
   sem videoUrl, o botão é simplesmente omitido. Visível sempre,
   independente do acordeão estar aberto.
   ============================================================ */
function CardTrabalho({ t, ordem }) {
  const [aberto, setAberto] = useState(false);
  const [fotoAberta, setFotoAberta] = useState(false);
  const cor = corArea(t.area);
  const temVideo = !!t.videoUrl;
  const autor = _val(t.autor);
  const resumo = _val(t.resumo);
  const linkArtigo = _val(t.linkArtigo);
  const publicacao = _val(t.publicacao);
  const temPub = !!linkArtigo;
  const temPapeis = !!(_val(t.orientador) || _lista(t.coorientadores).length || _val(t.profUc) || _val(t.avaliador) || _lista(t.colaboradores).length);
  const temMateriais = !!((Array.isArray(t.figuras) && t.figuras.length) || _lista(t.palavras).length || _val(t.referencias) || _val(t.afiliacao));
  const temExtra = temPapeis || !!resumo || temPub || temMateriais;
  return (
    <div style={{ background:"#fff", border:"1px solid #E3EAF2", borderLeft:`4px solid ${cor}`, borderRadius:12, overflow:"hidden" }}>
      <button onClick={() => temExtra && setAberto((a) => !a)} className={temExtra ? "card-link" : ""} aria-expanded={aberto}
        style={{ width:"100%", textAlign:"left", border:"none", background:"transparent", padding:"15px 17px", display:"flex", gap:13, cursor:temExtra ? "pointer" : "default", fontFamily:"inherit" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" }}>
            {ordem != null && <span style={{ fontSize:11, fontWeight:800, color:C.cinza, fontVariantNumeric:"tabular-nums" }}>{String(ordem).padStart(2,"0")}</span>}
            {t.area ? <span style={{ background:cor, color:"#fff", borderRadius:999, padding:"3px 11px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{t.area}</span> : null}
            {t.horario ? <span style={{ fontSize:11.5, fontWeight:700, color:C.cinza }}>{t.horario}</span> : null}
            {temPub ? <span title="Trabalho com publicação revisada por pares" style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.azul, color:"#fff", borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}><BookOpenCheck size={12} color="#fff" /> Publicado</span> : null}
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:C.tinta, lineHeight:1.32, textWrap:"pretty" }}>{t.titulo}</div>
          {autor ? (
            <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:11 }}>
              {_val(t.fotoAutores)
                ? <img src={t.fotoAutores} alt={autor} referrerPolicy="no-referrer" onClick={(e) => { e.stopPropagation(); setFotoAberta(true); }} style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", flexShrink:0, background:C.cinzaClaro, cursor:"zoom-in" }} />
                : <span style={{ width:44, height:44, borderRadius:"50%", background:C.cinzaClaro, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><UserRound size={20} color="#B9C5D3" /></span>}
              <span style={{ fontSize:13.5, color:C.tinta, fontWeight:600 }}>{autor}</span>
            </div>
          ) : null}
        </div>
        {temExtra ? (
          <span style={{ flexShrink:0, color:C.cinza, transform:aberto ? "rotate(90deg)" : "none", transition:"transform .18s ease", alignSelf:"flex-start", marginTop:2 }}><ChevronRight size={18} /></span>
        ) : null}
      </button>
      {aberto && temExtra ? (
        <div style={{ padding:"0 17px 16px" }}>
          {resumo ? (
            <div style={{ marginTop:4, paddingTop:14, borderTop:"1px solid #EEF2F6" }}>
              <div style={{ fontSize:11.5, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:7 }}>Resumo</div>
              <div className="sam-resumo-card" style={{ color:C.tinta }}>{resumo}</div>
            </div>
          ) : null}
          <MateriaisTrabalho t={t} cor={cor} />
          {temPub ? (
            <div style={{ marginTop:14, border:`1px solid ${C.azul}33`, borderRadius:12, background:C.cianoClaro, padding:"14px 15px", display:"flex", flexDirection:"column", gap:11 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ width:34, height:34, borderRadius:9, background:C.azul, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><BookOpenCheck size={18} color="#fff" /></span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11.5, fontWeight:800, color:C.azul, textTransform:"uppercase", letterSpacing:0.5 }}>Trabalho publicado</div>
                  <div style={{ fontSize:12.5, color:C.cinza, marginTop:2, lineHeight:1.4 }}>Resultado revisado por pares em periódico científico.</div>
                </div>
              </div>
              {publicacao ? <div style={{ fontSize:13, lineHeight:1.5, color:C.tinta, background:"#fff", border:"1px solid #E3EAF2", borderRadius:9, padding:"10px 12px" }}>{publicacao}</div> : null}
              <a href={linkArtigo} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignSelf:"flex-start", alignItems:"center", gap:8, textDecoration:"none", background:C.azul, color:"#fff", borderRadius:9, padding:"9px 16px", fontSize:13, fontWeight:700 }}>
                <BookOpenCheck size={15} color="#fff" /> Ver publicação
              </a>
            </div>
          ) : null}
          <RolesTrabalho t={t} />
        </div>
      ) : null}
      {temVideo ? (
        <div style={{ padding:"0 17px 16px" }}>
          <a href={t.videoUrl} target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none", background:"#FF0000", color:"#fff", borderRadius:9, padding:"8px 14px", fontWeight:700, fontSize:13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
            Assistir à apresentação
          </a>
        </div>
      ) : null}
      {fotoAberta ? ReactDOM.createPortal(
        <div onClick={() => setFotoAberta(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", cursor:"zoom-out" }}>
          <img src={t.fotoAutores} alt={autor} referrerPolicy="no-referrer" style={{ maxWidth:"92vw", maxHeight:"92vh", borderRadius:12, boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }} />
        </div>, document.body
      ) : null}
    </div>
  );
}

/* ============================================================
   GRUPO POR CAMADA — cada camada dividida por dia.
   ============================================================ */
function GrupoCamada({ titulo, sub, icone, trabalhos, ordemDias, contadorRef }) {
  if (!trabalhos.length) return null;
  const Ic = icone;
  const porDia = {};
  trabalhos.forEach((t) => { const d = _val(t.dia) || "—"; (porDia[d] = porDia[d] || []).push(t); });
  const dias = Object.keys(porDia).sort((a, b) => (ordemDias.indexOf(a) - ordemDias.indexOf(b)));
  const temDias = dias.some((d) => d !== "—");
  return (
    <section style={{ marginTop:48 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:`${C.ciano}1A`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Ic size={21} color={C.azul} /></div>
        <div style={{ flex:1, minWidth:0 }}>
          <h2 style={{ fontSize:19, fontWeight:800, color:C.tinta, margin:0, lineHeight:1.15 }}>{titulo} <span style={{ fontSize:14, fontWeight:700, color:C.cinza }}>· {trabalhos.length}</span></h2>
          <div style={{ fontSize:13, color:C.cinza, marginTop:2, lineHeight:1.4 }}>{sub}</div>
        </div>
      </div>
      {dias.map((d) => {
        const real = d !== "—";
        const num = ordemDias.indexOf(d) + 1;
        return (
          <div key={d} style={{ marginTop: temDias ? 28 : 16 }}>
            {temDias ? (
              <div style={{ display:"flex", alignItems:"center", gap:9, margin:"0 0 12px", position:"sticky", top:60, background:C.papel, padding:"8px 0", zIndex:5 }}>
                {real
                  ? <><span style={{ fontSize:12, fontWeight:800, letterSpacing:1, textTransform:"uppercase", color:C.azul }}>{"Dia " + num}</span><span style={{ fontSize:13, fontWeight:700, color:C.cinza }}>{d}</span></>
                  : <span style={{ fontSize:12, fontWeight:800, letterSpacing:1, textTransform:"uppercase", color:C.cinza }}>Sem data definida</span>}
                <span style={{ flex:1, height:1, background:"#E3EAF2" }} />
                <span style={{ fontSize:12, color:C.cinza }}>{porDia[d].length}</span>
              </div>
            ) : null}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {porDia[d].map((t, i) => <CardTrabalho key={t.titulo + i} t={t} ordem={(contadorRef.n += 1)} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ============================================================
   EDIÇÕES ANTERIORES — slot ANTECIPADO (sem preencher ainda).
   ============================================================ */
function EdicoesAnteriores({ atual }) {
  return (
    <section style={{ marginTop:54 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:C.tinta, margin:0 }}>Edições anteriores</h2>
        <span style={{ flex:1, height:1, background:"#E3EAF2" }} />
      </div>
      <div style={{ border:"1px dashed #CBD7E3", borderRadius:14, padding:"26px 22px", background:"#fff", display:"flex", gap:13, alignItems:"center", color:C.cinza }}>
        <Layers size={22} color="#B9C5D3" style={{ flexShrink:0 }} />
        <div style={{ fontSize:14, lineHeight:1.5 }}>
          As dez edições da SAM (<strong style={{ color:C.tinta }}>I–X</strong>) já estão arquivadas — cada uma abre pela rota <code style={{ background:C.cinzaClaro, padding:"1px 6px", borderRadius:5, fontSize:12.5 }}>#/edicao/:id</code>. O índice navegável entre elas chega no próximo passo.
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PÁGINA DA EDIÇÃO — orquestra fetch + agrupamento + render.
   ============================================================ */
function useEdicaoData(id) {
  const [estado, setEstado] = useState({ status:"carregando", data:null });
  useEffect(() => {
    const reg = EDICOES_INDEX[id];
    if (!reg) { setEstado({ status:"nao_encontrada", data:null }); return; }
    let vivo = true;
    setEstado({ status:"carregando", data:null });
    fetch(reg.file)
      .then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then((d) => { if (vivo) setEstado({ status:"ok", data:d }); })
      .catch(() => { if (vivo) setEstado({ status:"erro", data:null }); });
    return () => { vivo = false; };
  }, [id]);
  return estado;
}

/* ---- busca entre edições: carrega as 10 sob demanda (cache compartilhado) ---- */
let _todasPromise = null;
/* XI (edição viva): não tem *_sam.json — seus itens vêm do PROGRAMA (data.js).
   Entram na busca "todas as edições" como camada oral/pôster, ligados à Home. */
function _xiTrabalhos() {
  if (typeof PROGRAMA === "undefined" || !PROGRAMA || typeof DIAS === "undefined") return [];
  const meta = { _edId:"xi", _edRomano:"XI", _edNum:11, _edDatas:"22 a 26 de junho de 2026" };
  const out = [];
  DIAS.forEach((d) => {
    const dia = (d.split("·")[1] || d).trim();
    const pg = PROGRAMA[d]; if (!pg) return;
    (pg.orais || []).forEach((o) => out.push({ camada:"oral_tc2", titulo:o.titulo, autor:o.ap, area:o.area, orientador:o.uc || null, dia, horario:o.hora, ...meta }));
    (pg.posteres || []).forEach((p) => out.push({ camada:"poster_tc1", titulo:p.titulo, autor:p.ap, area:p.area, orientador:null, dia, ...meta }));
  });
  return out;
}
function carregarTodasEdicoes() {
  if (_todasPromise) return _todasPromise;
  const ids = Object.keys(EDICOES_INDEX);
  _todasPromise = Promise.all(ids.map((id) =>
    fetch(EDICOES_INDEX[id].file).then((r) => r.json())
      .then((d) => (d.trabalhos || []).map((t) => ({ ...t, _edId: d.edicao.id, _edRomano: d.edicao.edicaoRomano, _edNum: d.edicao.edicaoNum, _edDatas: d.edicao.datasTexto })))
      .catch(() => [])
  )).then((arrs) => arrs.flat());
  return _todasPromise;
}
function useTodasEdicoes(ativo) {
  const [estado, setEstado] = useState({ carregando:false, lista:null });
  useEffect(() => {
    if (!ativo || estado.lista) return;
    setEstado({ carregando:true, lista:null });
    carregarTodasEdicoes().then((lista) => setEstado({ carregando:false, lista }));
  }, [ativo]);
  return estado;
}

const CAMADA_ROTULO = { oral_tc2:"Oral", poster_tc1:"Pôster", palestra:"Palestra", ic_2fase:"IC", case:"Case", atividade:"Atividade" };

/* resultado de busca cruzada — abre a edição correspondente, levando o termo */
function ResultadoCruzado({ t, termo }) {
  const cor = corArea(t.area);
  const autor = _val(t.autor);
  const href = `edicao.html#/edicao/${t._edId}?q=${encodeURIComponent(termo)}`;
  return (
    <a href={href} onClick={() => window.scrollTo(0, 0)} className="card-link" style={{ width:"100%", textAlign:"left", textDecoration:"none", background:"#fff", border:"1px solid #E3EAF2", borderLeft:`4px solid ${cor}`, borderRadius:12, padding:"13px 16px", display:"flex", gap:12, alignItems:"center" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, fontWeight:800, letterSpacing:0.5, color:C.azul, background:C.cianoClaro, borderRadius:6, padding:"2px 8px" }}>{t._edRomano} SAM</span>
          <span style={{ fontSize:11, fontWeight:700, color:C.cinza }}>{CAMADA_ROTULO[t.camada] || ""}</span>
          {t.area ? <span style={{ background:cor, color:"#fff", borderRadius:999, padding:"2px 9px", fontSize:10.5, fontWeight:700 }}>{t.area}</span> : null}
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:C.tinta, lineHeight:1.3, textWrap:"pretty" }}>{t.titulo}</div>
        {autor ? <div style={{ fontSize:12.5, color:C.cinza, marginTop:4 }}>{autor}</div> : null}
      </div>
      <ChevronRight size={18} color={C.ciano} style={{ flexShrink:0 }} />
    </a>
  );
}

/* painel de resultados quando o escopo é "todas as edições" */
function BuscaTodas({ bn, termo, estado }) {
  if (!bn) return (
    <div style={{ marginTop:24, textAlign:"center", color:C.cinza, fontSize:14 }}>Digite para buscar nas dez edições da SAM.</div>
  );
  if (estado.carregando || !estado.lista) return <Carregando frase="Buscando em todas as edições…" style={{ padding:"34px 0" }} />;
  const res = estado.lista.filter((t) => [t.titulo, t.autor, t.area, t.orientador].some((v) => normalizaNome(v).includes(bn)));
  if (!res.length) return (
    <div style={{ marginTop:24, textAlign:"center", color:C.cinza, fontSize:14 }}>Nenhum trabalho encontrado para “{termo.trim()}” em nenhuma edição.</div>
  );
  const porEd = {};
  res.forEach((t) => { (porEd[t._edId] = porEd[t._edId] || []).push(t); });
  const eds = Object.keys(porEd).sort((a, b) => porEd[b][0]._edNum - porEd[a][0]._edNum);
  return (
    <div style={{ marginTop:22 }}>
      <div style={{ fontSize:13, color:C.cinza, marginBottom:16 }}>{res.length} {res.length === 1 ? "resultado" : "resultados"} em {eds.length} {eds.length === 1 ? "edição" : "edições"}</div>
      {eds.map((edId) => (
        <div key={edId} style={{ marginTop:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
            <span style={{ fontSize:12, fontWeight:800, letterSpacing:1, textTransform:"uppercase", color:C.azul }}>{porEd[edId][0]._edRomano} SAM</span>
            <span style={{ fontSize:12.5, color:C.cinza }}>{porEd[edId][0]._edDatas}</span>
            <span style={{ flex:1, height:1, background:"#E3EAF2" }} />
            <span style={{ fontSize:12, color:C.cinza }}>{porEd[edId].length}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {porEd[edId].map((t, i) => <ResultadoCruzado key={t.titulo + i} t={t} termo={termo} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginaEdicao({ id, initialQ }) {
  const { status, data } = useEdicaoData(id);
  const [busca, setBusca] = useState(initialQ || "");
  const [escopo, setEscopo] = useState("edicao");        // "edicao" | "todas"
  const todasEd = useTodasEdicoes(escopo === "todas");
  useEffect(() => { setBusca(initialQ || ""); setEscopo("edicao"); }, [id, initialQ]);

  if (status === "nao_encontrada") {
    return (
      <div>
        <EdicaoHeader />
        <div style={{ maxWidth:600, margin:"60px auto", padding:"0 16px", textAlign:"center", color:C.cinza }}>
          Edição não encontrada. <a href="index.html" style={{ color:C.azul }}>Voltar ao início</a>
        </div>
      </div>
    );
  }
  if (status !== "ok") {
    return (
      <div>
        <EdicaoHeader />
        <div style={{ maxWidth:980, margin:"0 auto", padding:"40px 16px" }}>
          {status === "erro"
            ? <div style={{ textAlign:"center", color:C.cinza, fontSize:14 }}>Não foi possível carregar esta edição agora.</div>
            : <Carregando frase="Carregando a edição…" style={{ padding:"40px 0" }} />}
        </div>
      </div>
    );
  }

  const ed = data.edicao;
  const todos = data.trabalhos || [];
  const ordemDias = [...new Set(todos.map((t) => t.dia).filter(Boolean))].sort((a, b) => {
    const A = _ddmm(a), B = _ddmm(b);
    return String(A).localeCompare(String(B));
  });

  const bn = normalizaNome(busca);
  const filtrados = bn
    ? todos.filter((t) => [t.titulo, t.autor, t.area, t.orientador].some((v) => normalizaNome(v).includes(bn)))
    : todos;

  const orais = filtrados.filter((t) => t.camada === "oral_tc2");
  const posteres = filtrados.filter((t) => t.camada === "poster_tc1");
  const palestras = filtrados.filter((t) => t.camada === "palestra");
  const ics = filtrados.filter((t) => t.camada === "ic_2fase");
  const cases = filtrados.filter((t) => t.camada === "case");
  const atividades = filtrados.filter((t) => t.camada === "atividade");
  const contador = { n: 0 };
  const nCam = (c) => todos.filter((t) => t.camada === c).length;
  const resumoItens = [
    [nCam("oral_tc2"), "apresentações orais"],
    [nCam("poster_tc1"), "pôsteres"],
    [nCam("palestra"), "palestras"],
    [nCam("ic_2fase"), "trabalhos de IC"],
    [nCam("case"), "cases"],
    [ordemDias.length, "dias de programação"],
  ].filter(([v]) => v > 0);

  return (
    <div>
      <EdicaoHeader />
      <div style={{ maxWidth:980, margin:"0 auto", padding:"24px 16px 70px" }}>
        <HeroEdicao ed={ed} />
        <TransmissoesEdicao videos={ed.videos} resumo={ed.videoResumoUrl} />
        <AvisoCobertura cobertura={ed.cobertura} />

        {/* resumo numérico — contexto de navegação, não enfeite */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 20px", marginTop:24, color:C.cinza, fontSize:13.5 }}>
          {resumoItens.map(([v, lbl], i) => <span key={i}><strong style={{ color:C.tinta }}>{v}</strong> {lbl}</span>)}
        </div>

        {/* busca + escopo */}
        <div style={{ marginTop:18 }}>
          <div style={{ position:"relative" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.cinza} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={escopo === "todas" ? "Buscar nas dez edições…" : "Buscar trabalho, autor, área ou orientador…"} aria-label="Buscar"
              style={{ width:"100%", padding:"13px 42px", border:"1px solid #E3EAF2", borderRadius:11, fontSize:14.5, color:C.tinta, background:"#fff", boxSizing:"border-box" }} />
            {busca && <button onClick={() => setBusca("")} aria-label="Limpar" style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", width:30, height:30, border:"none", background:"transparent", color:C.cinza, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16} /></button>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:10, flexWrap:"wrap" }}>
            <span style={{ fontSize:12.5, color:C.cinza, fontWeight:600 }}>Buscar em:</span>
            <div style={{ display:"inline-flex", background:"#fff", border:"1px solid #E3EAF2", borderRadius:999, padding:3, gap:3 }}>
              {[["edicao", "Nesta edição"], ["todas", "Todas as edições"]].map(([k, lbl]) => (
                <button key={k} onClick={() => setEscopo(k)} style={{ border:"none", borderRadius:999, padding:"7px 15px", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit", background: escopo === k ? C.azul : "transparent", color: escopo === k ? "#fff" : C.cinza }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>

        {escopo === "todas" ? (
          <BuscaTodas bn={bn} termo={busca} estado={todasEd} />
        ) : (
          <>
            {bn && !filtrados.length ? (
              <div style={{ marginTop:26, textAlign:"center", color:C.cinza, fontSize:14 }}>Nenhum trabalho encontrado para “{busca.trim()}” nesta edição.</div>
            ) : null}

            <GrupoCamada titulo="Apresentações orais" sub="Trabalhos de Curso II concluídos (8ª fase), apresentados nas sessões orais." icone={Mic} trabalhos={orais} ordemDias={ordemDias} contadorRef={contador} />
            <GrupoCamada titulo="Pôsteres" sub="Projetos de Trabalho de Curso I (7ª fase), expostos na sessão de pôsteres." icone={Users} trabalhos={posteres} ordemDias={ordemDias} contadorRef={contador} />
            <GrupoCamada titulo="Palestras e convidados" sub="Abertura, palestrantes convidados e momentos do programa." icone={Award} trabalhos={palestras} ordemDias={ordemDias} contadorRef={contador} />
            <GrupoCamada titulo="Iniciação científica" sub="Trabalhos de IC — 2ª fase." icone={Microscope} trabalhos={ics} ordemDias={ordemDias} contadorRef={contador} />
            <GrupoCamada titulo="Cases de sucesso" sub="Trajetórias e relatos de egressos da Medicina UNIDAVI." icone={Award} trabalhos={cases} ordemDias={ordemDias} contadorRef={contador} />
            <GrupoCamada titulo="Atividades" sub="Mesas-redondas, ligas acadêmicas e demais atividades." icone={Users} trabalhos={atividades} ordemDias={ordemDias} contadorRef={contador} />
          </>
        )}

        <EdicoesAnteriores atual={ed.edicaoRomano} />
      </div>
      <footer style={{ textAlign:"center", padding:"24px 16px 44px", color:C.cinza, fontSize:12 }}>
        {ed.edicaoRomano} {ed.nome} · {ed.datasTexto}
      </footer>
    </div>
  );
}

Object.assign(window, {
  EDICOES_INDEX, corArea, EdicaoHeader, HeroEdicao, TransmissoesEdicao,
  AvisoCobertura, RolesTrabalho, MateriaisTrabalho, CardTrabalho, GrupoCamada, EdicoesAnteriores,
  useEdicaoData, carregarTodasEdicoes, useTodasEdicoes, ResultadoCruzado, BuscaTodas, PaginaEdicao,
});
