/* ============================================================
   XI SAM 2026 — APRECIAÇÃO CIENTÍFICA (fluxo público)
   Botão "Apreciar este trabalho" → quem é o apreciador →
   formulário (completo p/ docente · enxuto p/ público) → POST.
   Aberto (sem login). Reusa C, ícones e SAM_API_URL (globais).
   TC1/TC2 é automático pela fase: 7→TC1 (projeto) · 8→TC2 (artigo).
   ============================================================ */

/* ---------- Login Google (GIS) — reusa o mesmo Client ID e domínio do material.
   Docente e Aluno exigem login @unidavi.edu.br; "Outro" é anônimo. ---------- */
const AP_GOOGLE_CLIENT_ID = "403359576266-0darbt2j0b0ggmprmjafmr7lg72akp3d.apps.googleusercontent.com";
const AP_HD_DOMINIO = "unidavi.edu.br";
const AP_CLIENT_OK = /\.apps\.googleusercontent\.com$/.test(AP_GOOGLE_CLIENT_ID) && !/^COLE_AQUI/.test(AP_GOOGLE_CLIENT_ID);
/* decodifica o payload do JWT (ID token) só p/ exibir e-mail/nome (validação real é no backend) */
function apDecodeJwt(tok) {
  try {
    const b = tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(b).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
  } catch (e) { return {}; }
}
/* botão "Entrar com Google" idêntico ao do material */
function ApBotaoGoogle({ onCredential }) {
  const ref = useRef(null);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    if (!AP_CLIENT_OK) return;
    let cancelado = false;
    const tentar = () => {
      if (cancelado) return;
      const g = window.google && window.google.accounts && window.google.accounts.id;
      if (!g) { setTimeout(tentar, 150); return; }
      try {
        g.initialize({ client_id: AP_GOOGLE_CLIENT_ID, callback: onCredential, hd: AP_HD_DOMINIO, auto_select:false, ux_mode:"popup" });
        if (ref.current) g.renderButton(ref.current, { type:"standard", theme:"filled_blue", size:"large", text:"signin_with", shape:"pill", logo_alignment:"left", width:280 });
        setPronto(true);
      } catch (e) {}
    };
    tentar();
    return () => { cancelado = true; };
  }, []);
  if (!AP_CLIENT_OK) {
    return (
      <div style={{ background:"#FFF7E6", border:"1px solid #F0D9A0", borderRadius:12, padding:"13px 14px", fontSize:13, color:"#7A5A12", lineHeight:1.5, textAlign:"left" }}>
        <strong>Configuração pendente.</strong> Defina o <code>AP_GOOGLE_CLIENT_ID</code> em <code>apreciacao.jsx</code>.
      </div>
    );
  }
  return (
    <div>
      <div ref={ref} style={{ display:"flex", justifyContent:"center", minHeight:44 }} />
      {!pronto && <div style={{ fontSize:13, color:"#5B6B7E", textAlign:"center", marginTop:8 }}>Carregando o login…</div>}
    </div>
  );
}

/* ---------- Escalas ---------- */
const AP_INT = [
  { v:1, curto:"Muito\nbaixa", rotulo:"Muito baixa" },
  { v:2, curto:"Baixa",        rotulo:"Baixa" },
  { v:3, curto:"Média",        rotulo:"Média" },
  { v:4, curto:"Alta",         rotulo:"Alta" },
  { v:5, curto:"Muito\nalta",  rotulo:"Muito alta" },
];
const AP_AGR = [
  { v:1, curto:"Discordo\ntotalmente",  rotulo:"Discordo totalmente" },
  { v:2, curto:"Discordo",              rotulo:"Discordo" },
  { v:3, curto:"Neutro",                rotulo:"Neutro" },
  { v:4, curto:"Concordo",              rotulo:"Concordo" },
  { v:5, curto:"Concordo\nplenamente",  rotulo:"Concordo plenamente" },
];
const AP_GLOBAL = [
  { v:1, curto:"Insufi-\nciente", rotulo:"Insuficiente" },
  { v:2, curto:"Regular",         rotulo:"Regular" },
  { v:3, curto:"Boa",             rotulo:"Boa" },
  { v:4, curto:"Muito\nboa",      rotulo:"Muito boa" },
  { v:5, curto:"Exce-\nlente",    rotulo:"Excelente" },
];
const AP_ENT = [
  { v:1, curto:"Muito\npouco", rotulo:"Muito pouco" },
  { v:2, curto:"Pouco",        rotulo:"Pouco" },
  { v:3, curto:"Médio",        rotulo:"Médio" },
  { v:4, curto:"Bastante",     rotulo:"Bastante" },
  { v:5, curto:"Muito",        rotulo:"Muito" },
];
const AP_REC = [
  { v:1, curto:"Não",    rotulo:"Não" },
  { v:2, curto:"Talvez", rotulo:"Talvez" },
  { v:3, curto:"Sim",    rotulo:"Sim" },
];
/* ramp divergente, tons sóbrios da marca (baixo → alto) — usada no PÚBLICO */
const AP_RAMP5 = ["#C0392B", "#C16A2E", "#7E8794", "#3E9468", "#1F8A5B"];
const AP_RAMP3 = ["#C0392B", "#7E8794", "#1F8A5B"];

/* ramp SEQUENCIAL quente/sóbria (neutro-frio → âmbar) — usada no DOCENTE.
   Visível desde o repouso (rest); ao selecionar, intensifica (fill). Sem
   juízo bom/ruim — codifica só a POSIÇÃO na escala. Sem vermelho→verde. */
const AP_SEQ = [
  { rest:"#ECEFF3", fill:"#74808F", restBorda:"rgba(28,40,58,0.08)" }, // mais clara/fria
  { rest:"#F1EDE0", fill:"#9C894E", restBorda:"rgba(120,96,40,0.14)" },
  { rest:"#F5EBD5", fill:"#B5912F", restBorda:"rgba(150,120,30,0.16)" },
  { rest:"#F1E2C2", fill:"#9C6E16", restBorda:"rgba(150,110,20,0.18)" },
  { rest:"#EBD6AC", fill:"#7E5610", restBorda:"rgba(126,86,16,0.22)" }, // mais quente/intensa
];
/* tons em repouso da divergente (versões pálidas do AP_RAMP5) — PÚBLICO
   também esmaece em repouso e acende (intensifica) ao selecionar. */
const AP_DIV = [
  { rest:"#F6E1DE", restBorda:"rgba(192,57,43,0.20)" },  // vermelho pálido
  { rest:"#F6E6D9", restBorda:"rgba(193,106,46,0.20)" }, // laranja pálido
  { rest:"#ECEEF1", restBorda:"rgba(120,135,148,0.22)" },// neutro pálido
  { rest:"#DDEDE3", restBorda:"rgba(62,148,104,0.22)" }, // verde pálido
  { rest:"#D6EADE", restBorda:"rgba(31,138,91,0.22)" },  // verde pálido
];
/* posição i de N mapeada para o passo 0..4 da rampa (cobre escalas de 3 e 5) */
function apPasso(i, total) { return total <= 1 ? 0 : Math.round((i / (total - 1)) * 4); }
function apEstilo(modo, i, total) {
  const p = apPasso(i, total);
  if (modo === "seq") {
    const s = AP_SEQ[p] || AP_SEQ[AP_SEQ.length - 1];
    return { rest:s.rest, fill:s.fill, restBorda:s.restBorda, restInk:"#5A5340" };
  }
  // divergente (público): repouso tingido (pálido) → acende (cor cheia) ao selecionar
  const d = AP_DIV[p] || AP_DIV[AP_DIV.length - 1];
  return { rest:d.rest, fill:AP_RAMP5[p] || "#023E88", restBorda:d.restBorda, restInk:"#5B6B7E" };
}

/* ---------- Blocos do formulário do docente ---------- */
const AP_BLOCOS_DOC = [
  { titulo:"Relevância", escala:AP_INT, ramp:AP_RAMP5, itens:[
    "Relevância do tema para a prática médica",
    "Relevância para o contexto regional/local",
    "Originalidade da proposta",
    "Atualidade do tema",
  ]},
  { titulo:"Qualidade científica", escala:AP_AGR, ramp:AP_RAMP5, itens:[
    "Os objetivos estão claros e bem definidos",
    "A metodologia é adequada aos objetivos",
    "Os resultados estão apresentados de forma clara",
    "As conclusões são sustentadas pelos resultados",
    "As referências são adequadas e atualizadas",
  ]},
  { titulo:"Comunicação", escala:AP_AGR, ramp:AP_RAMP5, itens:[
    "A apresentação foi clara e organizada",
    "O tempo foi bem administrado",
    "Os recursos visuais (pôster/slides) foram adequados",
    "O apresentador demonstrou domínio do conteúdo",
    "As respostas às perguntas foram consistentes",
    "A linguagem foi adequada ao público",
  ]},
  { titulo:"Contribuição", escala:AP_INT, ramp:AP_RAMP5, itens:[
    "Contribuição para o conhecimento da área",
    "Potencial de aplicação prática",
    "Potencial de continuidade/desdobramento",
    "Contribuição para a formação dos autores",
  ]},
];
const AP_ESPEC_TC1 = [
  "A pergunta de pesquisa é pertinente e viável",
  "O delineamento proposto é adequado",
  "O cronograma e os recursos são exequíveis",
];
const AP_ESPEC_TC2 = [
  "Os resultados respondem à pergunta de pesquisa",
  "A discussão dialoga com a literatura",
  "O trabalho tem potencial de publicação",
];

/* ---------- Estilos base do fluxo ---------- */
const apCampo = { width:"100%", padding:"11px 13px", border:"1px solid #D6DFE9", borderRadius:10, fontSize:14.5, color:"#0C1A2B", fontFamily:"inherit", background:"#fff", boxSizing:"border-box" };
const apLabel = { fontSize:12, fontWeight:700, color:"#023E88", marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:0.4 };

/* ---------- Escala (linha de botões) ---------- */
function ApEscala({ opcoes, valor, onChange, modo = "div" }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      {opcoes.map((op, i) => {
        const on = valor === op.v;
        const st = apEstilo(modo, i, opcoes.length);
        return (
          <button key={op.v} type="button" onClick={() => onChange(op)}
            aria-pressed={on} title={op.rotulo}
            style={{ flex:1, minWidth:0, minHeight:54, border:on ? `1px solid ${st.fill}` : `1px solid ${st.restBorda}`,
              background:on ? st.fill : st.rest, color:on ? "#fff" : st.restInk, borderRadius:11, cursor:"pointer",
              fontFamily:"inherit", fontSize:11, fontWeight:on ? 800 : 600, lineHeight:1.18, padding:"6px 3px",
              whiteSpace:"pre-line", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center",
              boxShadow:on ? `0 3px 10px ${st.fill}55` : "none", transform:on ? "translateY(-1px)" : "none",
              transition:"background .12s, color .12s, box-shadow .12s, transform .12s" }}>
            {op.curto}
          </button>
        );
      })}
    </div>
  );
}
/* ---------- Item (pergunta + escala) ---------- */
function ApItem({ n, texto, escala, modo, valor, onChange }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:14, color:"#0C1A2B", lineHeight:1.4, marginBottom:9 }}>
        {n != null && <span style={{ color:"#023E88", fontWeight:800, marginRight:2 }}>{n}.</span>} {texto}
      </div>
      <ApEscala opcoes={escala} modo={modo} valor={valor} onChange={onChange} />
    </div>
  );
}
/* ---------- Cabeçalho de bloco ---------- */
function ApBloco({ titulo }) {
  return (
    <div style={{ fontSize:12, fontWeight:800, color:"#00ADEF", textTransform:"uppercase", letterSpacing:1, margin:"26px 0 12px", paddingBottom:7, borderBottom:"1px solid #EEF2F6" }}>{titulo}</div>
  );
}
/* ---------- Cartão de campo aberto ---------- */
function ApTexto({ rotulo, valor, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={apLabel}>{rotulo}</label>
      <textarea value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ ...apCampo, resize:"vertical", minHeight:64, lineHeight:1.5 }} />
    </div>
  );
}

/* ============================================================
   FLUXO PRINCIPAL
   ============================================================ */
function FluxoApreciacao({ t, onClose }) {
  const tc = Number(t.fase) === 8 ? "TC2" : "TC1";
  const [etapa, setEtapa] = useState("quem");   // quem | login | docente | publico | ok
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [auth, setAuth] = useState(null);        // { idToken, email, nome } (docente/aluno)
  const [pendente, setPendente] = useState(null);// para qual form ir depois do login: "docente" | "publico"

  // trava o scroll do fundo
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* lista achatada e numerada das perguntas do docente (depende da fase) */
  const flatDoc = useMemo(() => {
    const blocos = [
      ...AP_BLOCOS_DOC,
      { titulo:"Questões específicas", escala:AP_AGR, ramp:AP_RAMP5,
        itens: tc === "TC1" ? AP_ESPEC_TC1 : AP_ESPEC_TC2 },
    ];
    let n = 0;
    const flat = [];
    blocos.forEach((b) => b.itens.forEach((texto) => { n++; flat.push({ n, grupo:b.titulo, texto, escala:b.escala, ramp:b.ramp }); }));
    return { blocos, flat };
  }, [tc]);

  /* ---------- estado do formulário docente ---------- */
  const [respD, setRespD] = useState({});       // n -> opção
  const [globalD, setGlobalD] = useState(null);
  const [recD, setRecD] = useState(null);
  const [pf, setPf] = useState(""); const [pm, setPm] = useState(""); const [sug, setSug] = useState("");

  /* ---------- estado do formulário público ---------- */
  const [nome, setNome] = useState("");
  const [respP, setRespP] = useState({});       // chave -> opção
  const [globalP, setGlobalP] = useState(null);
  const [comentP, setComentP] = useState("");

  async function postar(payload) {
    setEnviando(true); setErro("");
    try {
      const r = await fetch(SAM_API_URL, {
        method:"POST",
        headers:{ "Content-Type":"text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const res = await r.json();
      if (res && res.ok) setEtapa("ok");
      else setErro((res && res.erro) || "Não foi possível registrar a apreciação agora.");
    } catch (e) {
      setErro("Falha de conexão. Verifique a internet e tente novamente.");
    } finally { setEnviando(false); }
  }

  /* recebe o ID token do Google e segue para o formulário pendente */
  function aoLogar(resp) {
    const idToken = resp && resp.credential;
    if (!idToken) { setErro("Login não concluído. Tente novamente."); return; }
    const p = apDecodeJwt(idToken);
    const email = (p.email || "").toLowerCase();
    if (AP_HD_DOMINIO && email && !email.endsWith("@" + AP_HD_DOMINIO)) {
      setErro(`Use a sua conta institucional @${AP_HD_DOMINIO}. A conta “${email}” não pertence ao domínio da UNIDAVI.`);
      try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
      return;
    }
    setErro("");
    setAuth({ idToken, email, nome: p.name || "" });
    setEtapa(pendente || "docente");
  }

  function enviarDocente() {
    if (!auth || !auth.idToken) { setErro("Entre com sua conta @unidavi.edu.br para enviar."); setEtapa("login"); setPendente("docente"); return; }
    const itens = flatDoc.flat.map((it) => {
      const op = respD[it.n];
      return { n:it.n, grupo:it.grupo, texto:it.texto, resposta: op ? op.rotulo : null, valor: op ? op.v : null };
    });
    const respostas = {
      itens,
      global: globalD ? { texto:"Avaliação global", resposta:globalD.rotulo, valor:globalD.v } : null,
      recomenda: recD ? { texto:"Recomendaria este trabalho para premiação/destaque?", resposta:recD.rotulo, valor:recD.v } : null,
    };
    const partes = [];
    if (pf.trim())  partes.push("Pontos fortes: " + pf.trim());
    if (pm.trim())  partes.push("Pontos a melhorar: " + pm.trim());
    if (sug.trim()) partes.push("Sugestões e comentários: " + sug.trim());
    postar({
      tipo:"apreciacao", trabalho_id:t.id, trabalho_titulo:t.titulo, fase:Number(t.fase),
      tipo_apreciador:"docente", idToken: auth.idToken, tipo_tc:tc,
      respostas, comentario_aberto: partes.join("\n\n"),
    });
  }

  function enviarPublico(tipo) {
    if (tipo === "aluno" && (!auth || !auth.idToken)) {
      setErro("Entre com sua conta @unidavi.edu.br para enviar."); setEtapa("login"); setPendente("publico"); return;
    }
    const itens = [
      { grupo:"Relevância",   texto:"A relevância do tema",                          ...packP(respP.q1) },
      { grupo:"Clareza",      texto:"A apresentação foi clara e fácil de entender",  ...packP(respP.q2) },
      { grupo:"Aprendizado",  texto:"Quanto seu entendimento sobre o tema aumentou", ...packP(respP.q3) },
    ];
    const respostas = {
      itens,
      global: globalP ? { texto:"Avaliação global", resposta:globalP.rotulo, valor:globalP.v } : null,
      recomenda: null,
    };
    const payload = {
      tipo:"apreciacao", trabalho_id:t.id, trabalho_titulo:t.titulo, fase:Number(t.fase),
      tipo_apreciador:tipo, tipo_tc:tc, respostas, comentario_aberto: comentP.trim(),
    };
    if (tipo === "aluno") payload.idToken = auth.idToken;
    else payload.nome_apreciador = nome.trim();
    postar(payload);
  }
  function packP(op) { return { resposta: op ? op.rotulo : null, valor: op ? op.v : null }; }

  /* tipo do público guardado para o envio (aluno | outro) */
  const [tipoPub, setTipoPub] = useState("aluno");

  /* ---------- chrome do modal ---------- */
  const corFase = AREA_COR[t.area] || "#00ADEF";
  return (
    <div onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(6,18,34,0.55)", backdropFilter:"blur(2px)",
        display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background:"#fff", width:"100%", maxWidth:560, maxHeight:"94vh", borderRadius:"20px 20px 0 0",
          display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 -10px 40px rgba(2,40,90,0.25)" }}
        className="ap-sheet">
        {/* topo fixo */}
        <div style={{ background:"linear-gradient(135deg, #023E88, #01285A)", color:"#fff", padding:"16px 18px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:15.5, fontWeight:800 }}>Apreciar este trabalho</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.titulo}</div>
            </div>
            <button onClick={onClose} aria-label="Fechar"
              style={{ flexShrink:0, width:36, height:36, border:"none", background:"rgba(255,255,255,0.14)", color:"#fff", borderRadius:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={18} color="#fff" />
            </button>
          </div>
          <div style={{ display:"flex", gap:6, marginTop:11, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.16)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:999, padding:"3px 10px" }}>{t.fase}ª fase</span>
            <span style={{ fontSize:11, fontWeight:700, background:corFase, borderRadius:999, padding:"3px 10px" }}>{tc} · {t.fase === 8 || Number(t.fase) === 8 ? "artigo" : "projeto"}</span>
            <span style={{ fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.16)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:999, padding:"3px 10px" }}>{t.id}</span>
          </div>
        </div>

        {/* corpo rolável */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 8px" }}>
          {etapa === "quem" && <EtapaQuem onEscolher={(tp) => {
            setErro("");
            if (tp === "docente") { setPendente("docente"); setEtapa(auth ? "docente" : "login"); }
            else if (tp === "aluno") { setTipoPub("aluno"); setPendente("publico"); setEtapa(auth ? "publico" : "login"); }
            else { setTipoPub("outro"); setEtapa("publico"); }
          }} />}

          {etapa === "login" && <EtapaLogin alvo={pendente} onCredential={aoLogar} erro={erro} />}

          {etapa === "docente" && (
            <FormDocente
              flat={flatDoc.flat} blocos={flatDoc.blocos} tc={tc}
              auth={auth}
              respD={respD} setRespD={setRespD}
              globalD={globalD} setGlobalD={setGlobalD}
              recD={recD} setRecD={setRecD}
              pf={pf} setPf={setPf} pm={pm} setPm={setPm} sug={sug} setSug={setSug}
              erro={erro}
            />
          )}

          {etapa === "publico" && (
            <FormPublico
              tipo={tipoPub} setTipo={setTipoPub}
              auth={auth}
              nome={nome} setNome={setNome}
              respP={respP} setRespP={setRespP}
              globalP={globalP} setGlobalP={setGlobalP}
              comentP={comentP} setComentP={setComentP}
              erro={erro}
            />
          )}

          {etapa === "ok" && <EtapaOk onClose={onClose} />}
        </div>

        {/* rodapé fixo com ação (login não mostra Enviar) */}
        {etapa !== "quem" && etapa !== "ok" && etapa !== "login" && (
          <div style={{ flexShrink:0, borderTop:"1px solid #EEF2F6", padding:"12px 18px", background:"#fff" }}>
            {erro && <div style={{ fontSize:12.5, color:"#C0392B", marginBottom:9, fontWeight:600 }}>{erro}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setErro(""); setEtapa("quem"); }} disabled={enviando}
                style={{ border:"1px solid #E3EAF2", background:"#fff", color:"#5B6B7E", borderRadius:11, padding:"12px 16px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Voltar</button>
              <button onClick={() => etapa === "docente" ? enviarDocente() : enviarPublico(tipoPub)} disabled={enviando}
                style={{ flex:1, border:"none", background:enviando ? "#5B6B7E" : "#023E88", color:"#fff", borderRadius:11, padding:"12px 16px", fontSize:14.5, fontWeight:800, cursor:enviando ? "default" : "pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {enviando ? "Enviando…" : <>Enviar apreciação <Check size={17} color="#fff" /></>}
              </button>
            </div>
          </div>
        )}
        {/* rodapé do login: só Voltar */}
        {etapa === "login" && (
          <div style={{ flexShrink:0, borderTop:"1px solid #EEF2F6", padding:"12px 18px", background:"#fff" }}>
            <button onClick={() => { setErro(""); setEtapa("quem"); }}
              style={{ border:"1px solid #E3EAF2", background:"#fff", color:"#5B6B7E", borderRadius:11, padding:"12px 16px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Etapa: quem é o apreciador ---------- */
function EtapaQuem({ onEscolher }) {
  const opt = (tp, Icone, titulo, sub) => (
    <button onClick={() => onEscolher(tp)}
      style={{ display:"flex", alignItems:"center", gap:14, width:"100%", textAlign:"left", background:"#fff",
        border:"1px solid #E3EAF2", borderRadius:14, padding:"16px 16px", cursor:"pointer", fontFamily:"inherit", marginBottom:11 }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00ADEF"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(2,62,136,0.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E3EAF2"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ width:46, height:46, borderRadius:12, background:"#E5F6FE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icone size={23} color="#023E88" />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15.5, fontWeight:800, color:"#0C1A2B" }}>{titulo}</div>
        <div style={{ fontSize:13, color:"#5B6B7E", marginTop:2, lineHeight:1.35 }}>{sub}</div>
      </div>
      <ChevronRight size={20} color="#00ADEF" />
    </button>
  );
  return (
    <div>
      <div style={{ fontSize:15, fontWeight:700, color:"#0C1A2B", marginBottom:4 }}>Você é:</div>
      <div style={{ fontSize:13, color:"#5B6B7E", marginBottom:16, lineHeight:1.45 }}>Escolha como está apreciando este trabalho. O formulário se ajusta ao seu perfil.</div>
      {opt("docente", Stethoscope, "Docente / Banca", "Avaliação completa · entra com conta @unidavi.edu.br")}
      {opt("aluno", UserRound, "Aluno de medicina", "5 perguntas · entra com conta @unidavi.edu.br")}
      {opt("outro", Users, "Outro", "Visitante, comunidade · sem login")}
    </div>
  );
}

/* ---------- Etapa: login Google (docente / aluno) ---------- */
function EtapaLogin({ alvo, onCredential, erro }) {
  return (
    <div style={{ padding:"6px 2px 10px", textAlign:"center" }}>
      <div style={{ width:54, height:54, borderRadius:14, background:"#E5F6FE", display:"flex", alignItems:"center", justifyContent:"center", margin:"6px auto 16px" }}>
        <Lock size={24} color="#023E88" />
      </div>
      <div style={{ fontSize:16, fontWeight:800, color:"#0C1A2B", marginBottom:6 }}>Entre com sua conta UNIDAVI</div>
      <div style={{ fontSize:13.5, color:"#5B6B7E", lineHeight:1.5, maxWidth:360, margin:"0 auto 20px" }}>
        {alvo === "docente" ? "A apreciação da banca é identificada pela sua conta institucional" : "Sua apreciação como aluno é identificada pela sua conta institucional"} <strong style={{ color:"#023E88" }}>@{AP_HD_DOMINIO}</strong>. O e-mail não é publicado.
      </div>
      <ApBotaoGoogle onCredential={onCredential} />
      {erro && <div style={{ fontSize:12.5, color:"#C0392B", marginTop:14, fontWeight:600, lineHeight:1.4 }}>{erro}</div>}
    </div>
  );
}

/* ---------- Faixa de identidade logada (docente / aluno) ---------- */
function ApIdentidade({ auth }) {
  if (!auth || !auth.email) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, background:"#F7F9FB", border:"1px solid #E3EAF2", borderRadius:12, padding:"11px 13px", marginBottom:6 }}>
      <div style={{ width:34, height:34, borderRadius:"50%", background:"#1F8A5B", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Check size={17} color="#fff" />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#1F8A5B", textTransform:"uppercase", letterSpacing:0.4 }}>Conta verificada</div>
        <div style={{ fontSize:13.5, fontWeight:600, color:"#0C1A2B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{auth.email}</div>
      </div>
    </div>
  );
}

/* ---------- Formulário do docente ---------- */
function FormDocente(p) {
  const { flat, blocos, auth, respD, setRespD, globalD, setGlobalD, recD, setRecD, pf, setPf, pm, setPm, sug, setSug, erro } = p;
  const setN = (n, op) => setRespD((r) => ({ ...r, [n]: op }));
  let contador = 0;
  return (
    <div>
      <ApIdentidade auth={auth} />

      {blocos.map((b) => (
        <div key={b.titulo}>
          <ApBloco titulo={b.titulo} />
          {b.itens.map((texto) => {
            contador++;
            const n = contador;
            return <ApItem key={n} n={n} texto={texto} escala={b.escala} modo="seq" valor={respD[n] && respD[n].v} onChange={(op) => setN(n, op)} />;
          })}
        </div>
      ))}

      <ApBloco titulo="Campos abertos (opcionais)" />
      <ApTexto rotulo="Pontos fortes" valor={pf} onChange={setPf} placeholder="O que o trabalho tem de melhor…" />
      <ApTexto rotulo="Pontos a melhorar" valor={pm} onChange={setPm} placeholder="O que poderia evoluir…" />
      <ApTexto rotulo="Sugestões e comentários" valor={sug} onChange={setSug} placeholder="Observações livres…" />

      <ApBloco titulo="Avaliação global" />
      <ApItem texto="Avaliação global do trabalho" escala={AP_GLOBAL} modo="seq" valor={globalD && globalD.v} onChange={setGlobalD} />
      <ApItem texto="Recomendaria este trabalho para premiação/destaque?" escala={AP_REC} modo="seq" valor={recD && recD.v} onChange={setRecD} />
    </div>
  );
}

/* ---------- Formulário do público (enxuto) ---------- */
function FormPublico(p) {
  const { tipo, setTipo, auth, nome, setNome, respP, setRespP, globalP, setGlobalP, comentP, setComentP, erro } = p;
  const setQ = (k, op) => setRespP((r) => ({ ...r, [k]: op }));
  const ehAluno = tipo === "aluno";
  return (
    <div>
      <div style={{ fontSize:13.5, color:"#5B6B7E", lineHeight:1.5, marginBottom:16, background:"#E5F6FE", borderRadius:11, padding:"12px 14px" }}>
        Sua opinião conta muito. São <strong style={{ color:"#023E88" }}>5 perguntas rápidas</strong>{ehAluno ? "." : " — sem login."}
      </div>
      {ehAluno ? (
        <ApIdentidade auth={auth} />
      ) : (
        <div style={{ marginBottom:18 }}>
          <label style={apLabel}>Seu nome <span style={{ color:"#5B6B7E", fontWeight:600, textTransform:"none", letterSpacing:0 }}>(opcional)</span></label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como quer ser identificado (opcional)" style={apCampo} />
        </div>
      )}

      <ApItem n={1} texto="A relevância do tema" escala={AP_INT} modo="div" valor={respP.q1 && respP.q1.v} onChange={(op) => setQ("q1", op)} />
      <ApItem n={2} texto="A apresentação foi clara e fácil de entender" escala={AP_AGR} modo="div" valor={respP.q2 && respP.q2.v} onChange={(op) => setQ("q2", op)} />
      <ApItem n={3} texto="Quanto seu entendimento sobre o tema aumentou" escala={AP_ENT} modo="div" valor={respP.q3 && respP.q3.v} onChange={(op) => setQ("q3", op)} />
      <ApItem n={4} texto="Avaliação global" escala={AP_GLOBAL} modo="div" valor={globalP && globalP.v} onChange={setGlobalP} />

      <div style={{ marginTop:4 }}>
        <div style={{ fontSize:14, color:"#0C1A2B", lineHeight:1.4, marginBottom:9 }}><span style={{ color:"#023E88", fontWeight:800 }}>5.</span> Comentário <span style={{ color:"#5B6B7E" }}>(opcional)</span></div>
        <textarea value={comentP} onChange={(e) => setComentP(e.target.value)} rows={3} placeholder="O que achou do trabalho…" style={{ ...apCampo, resize:"vertical", minHeight:70, lineHeight:1.5 }} />
      </div>
    </div>
  );
}

/* ---------- Etapa: confirmação ---------- */
function EtapaOk({ onClose }) {
  return (
    <div style={{ textAlign:"center", padding:"30px 10px 24px" }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"#1F8A5B", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
        <Check size={38} color="#fff" />
      </div>
      <div style={{ fontSize:19, fontWeight:800, color:"#0C1A2B", marginBottom:8 }}>Apreciação registrada. Obrigado!</div>
      <div style={{ fontSize:14, color:"#5B6B7E", lineHeight:1.5, maxWidth:340, margin:"0 auto 22px" }}>Sua avaliação foi enviada à comissão da SAM. Ela ajuda os autores e a banca.</div>
      <button onClick={onClose} style={{ background:"#023E88", color:"#fff", border:"none", borderRadius:11, padding:"12px 26px", fontSize:14.5, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>Fechar</button>
    </div>
  );
}

Object.assign(window, { FluxoApreciacao, ApEscala, ApItem });
