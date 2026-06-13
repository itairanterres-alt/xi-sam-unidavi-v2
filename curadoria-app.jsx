/* ============================================================
   XI SAM 2026 — CURADORIA (gestão editorial, NÃO avaliação)
   A curadora confere completude e decide:
     • Liberar (publicar)   → status "publicado"
     • Devolver para ajuste → status "ajuste" (comentário obrigatório)
   Mesmo backend (Apps Script) e mesmo design system das demais telas.
   Contrato com o backend NÃO PODE MUDAR (campos, status, headers).
   ============================================================ */
const { useState, useMemo, useEffect } = React;
const PosterEditor = window.PosterEditor; /* editor de layout TV */

// e-mail e senha da curadora guardados entre recargas (login persistente)
const LS_CURADORIA_EMAIL = "sam_curadoria_email";
const LS_CURADORIA_SENHA = "sam_curadoria_senha";

// MESMA URL /exec usada em submissao.html e nas demais telas:
const API_URL = "https://script.google.com/macros/s/AKfycbzJqcGzdur-PqD6I1Ya5ZTwqui1_iNCHggSQx_ZOaewmDqc9yFV2T5DqhmpO4bqOOMQ7A/exec";

const C = {
  azul:"#023E88", azulEsc:"#01285A", ciano:"#00ADEF", cianoClaro:"#E5F6FE",
  tinta:"#0C1A2B", cinza:"#5B6B7E", cinzaClaro:"#EEF2F6", papel:"#F7F9FB",
  erro:"#C0392B", verde:"#1F8A5B", ambar:"#B07A18",
};
const AREA_COR = {
  "Educação Médica":"#5B6B7E","Neurologia":"#6A4C93","Neurocirurgia":"#5B3A82",
  "Geriatria":"#B07A18","Psiquiatria":"#7A4D9C","Medicina de Família e Comunidade":"#D38F00",
  "Ginecologia e Obstetrícia":"#B23A82","Oncologia":"#2A8A5C","Otorrinolaringologia":"#0080B7",
  "Endocrinologia":"#C4622D","Infectologia":"#3D6E1B","Pediatria":"#00ADEF",
  "Cardiologia":"#A23A1F","Cirurgia Vascular":"#7A2616",
};
// status do backend → rótulo + cor (NÃO alterar as chaves)
const STATUS = {
  enviado:   { label:"Aguardando", cor:C.ambar },
  publicado: { label:"Publicado",  cor:C.verde },
  ajuste:    { label:"Em ajuste",  cor:C.erro },
};

/* ---------- Ícones (stroke SVG inline) ---------- */
function SIco({ size = 20, color = "currentColor", sw = 2, children, fill = "none", className, style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, display:"block", ...style }}>{children}</svg>
  );
}
const Microscope  = (p) => <SIco {...p}><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h4v4a2 2 0 0 1-2 2ZM12 6V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3"/></SIco>;
const CalendarDays= (p) => <SIco {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></SIco>;
const ArrowLeft   = (p) => <SIco {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></SIco>;
const Search      = (p) => <SIco {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></SIco>;
const CheckCircle2= (p) => <SIco {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></SIco>;
const Undo2       = (p) => <SIco {...p}><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></SIco>;
const Star        = (p) => <SIco {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></SIco>;
const ImageIcon   = (p) => <SIco {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></SIco>;
const LogOut      = (p) => <SIco {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></SIco>;
const Loader2     = (p) => <SIco {...p}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></SIco>;
const AlertTriangle=(p) => <SIco {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></SIco>;
const X           = (p) => <SIco {...p}><path d="M18 6 6 18M6 6l12 12"/></SIco>;
const Lock        = (p) => <SIco {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></SIco>;
const MonitorIco  = (p) => <SIco {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></SIco>;

/* ---------- estilos base ---------- */
const campo = { width:"100%", padding:"10px 12px", border:"1px solid #D6DFE9", borderRadius:10, fontSize:14, color:C.tinta, fontFamily:"inherit", background:"#fff", boxSizing:"border-box" };
const Selo = ({ s }) => {
  const st = STATUS[s] || { label:s, cor:C.cinza };
  return <span style={{ fontSize:11.5, fontWeight:800, color:"#fff", background:st.cor, borderRadius:999, padding:"3px 11px", whiteSpace:"nowrap", letterSpacing:0.2 }}>{st.label}</span>;
};

/* ============================ DEMO (sem backend) ============================
   Modo demonstração: entra sem login e sem senha, com trabalhos de exemplo
   (figuras reais embutidas), para testar o editor de layout ponta-a-ponta.
   Nada aqui toca o backend — salvar/decidir são simulados localmente. */
const _demoImg = (w, h, c, txt) => "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='${c}'/><text x='50%' y='50%' font-size='${Math.round(h/6)}' fill='white' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'>${txt}</text></svg>`);
const DEMO_TRABALHOS = [
  { id:"DEMO-01", status:"enviado", fase:7, desenho:"Estudo transversal", area:"Ginecologia e Obstetrícia",
    email:"aluno.demo@unidavi.edu.br", token:"demo",
    titulo:"Adesão ao rastreamento de câncer de colo uterino em unidades de saúde da família",
    autores:["A. Discente Exemplo","B. Discente Exemplo"], orientador:"Orientadora Exemplo",
    palavras:["Neoplasias do colo do útero","Atenção primária","Rastreamento"],
    intro:"O câncer de colo uterino permanece como causa evitável de mortalidade feminina. O rastreamento citopatológico é a principal estratégia de detecção precoce na atenção primária.",
    objetivos:"Estimar a adesão ao rastreamento e identificar fatores associados à não realização do exame.",
    metodos:"Estudo transversal com 380 mulheres de 25–64 anos cadastradas em quatro ESF, por amostragem aleatória.",
    resultados:"Resultados esperados: estimativa de cobertura por faixa etária e identificação de barreiras de acesso ao exame na rede.",
    fig_principal:2,
    figuras:[
      { ordem:1, secao:"Métodos", legenda:"Fluxo de seleção das ESF participantes", principal:false, dataUrl:_demoImg(320,220,"#2A6FDB","Fig 1") },
      { ordem:2, secao:"Resultados", legenda:"Distribuição da amostra por faixa etária", principal:true, dataUrl:_demoImg(340,210,"#1F8A5B","Fig 2") },
    ] },
  { id:"DEMO-02", status:"enviado", fase:7, desenho:"Estudo de coorte", area:"Cardiologia",
    email:"aluno.demo2@unidavi.edu.br", token:"demo",
    titulo:"Fatores associados à reinternação em 30 dias após insuficiência cardíaca descompensada",
    autores:["H. Discente Exemplo"], orientador:"Orientador Exemplo",
    palavras:["Insuficiência cardíaca","Readmissão","Transição de cuidado"],
    intro:"A reinternação precoce por IC é marcador de qualidade assistencial e desfecho evitável, com impacto direto sobre custos e mortalidade.",
    objetivos:"Identificar fatores associados à reinternação em 30 dias após internação por IC descompensada.",
    metodos:"Coorte retrospectiva de pacientes internados por IC, com seguimento de 30 dias após a alta.",
    resultados:"Classe funcional avançada e ausência de conciliação medicamentosa associaram-se a maior risco de reinternação precoce.",
    fig_principal:1,
    /* este já vem com um ajuste de layout salvo, para demonstrar a persistência */
    ajuste_layout: JSON.stringify({ "s-Resultados esperados:0": { largura:0.7, coluna:"esquerda" } }),
    figuras:[
      { ordem:1, secao:"Resultados", legenda:"Curva de risco de reinternação em 30 dias", principal:true, dataUrl:_demoImg(340,200,"#A23A1F","Fig 1") },
    ] },
];

/* ============================ LOGIN ============================ */
function Login({ onOk, onDemo, emailInicial = "", senhaInicial = "", erroInicial = "" }) {
  const [email, setEmail] = useState(emailInicial);
  const [senha, setSenha] = useState(senhaInicial);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(erroInicial);

  const entrar = async () => {
    const e = email.trim();
    if (!e) { setErro("Informe seu e-mail institucional."); return; }
    setErro(""); setCarregando(true);
    try {
      const r = await fetch(API_URL + "?action=curadoria&email=" + encodeURIComponent(e) + "&senha=" + encodeURIComponent(senha));
      const res = await r.json();
      if (res.ok) onOk(e, senha, res.trabalhos || []);
      else setErro(res.erro || "E-mail não autorizado para a curadoria.");
    } catch (err) {
      setErro("Falha de conexão com o servidor. Tente novamente.");
    } finally { setCarregando(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:`radial-gradient(1200px 600px at 50% -10%, ${C.cianoClaro}, ${C.papel})` }}>
      <div style={{ width:"100%", maxWidth:400, background:"#fff", border:"1px solid #E3EAF2", borderRadius:18, padding:30, boxShadow:"0 18px 50px rgba(2,40,90,0.10)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:18 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:C.azul, display:"flex", alignItems:"center", justifyContent:"center" }}><Microscope size={22} color="#fff" /></div>
          <div style={{ lineHeight:1.1 }}>
            <div style={{ fontWeight:800, fontSize:18, color:C.azul }}>SAM <span style={{ color:C.ciano }}>2026</span></div>
            <div style={{ fontSize:11.5, color:C.cinza, marginTop:2 }}>Curadoria editorial</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color:C.cinza, background:C.cianoClaro, borderRadius:9, padding:"9px 11px", marginBottom:18 }}>
          <Lock size={15} color={C.azul} /> Acesso restrito à curadora autorizada.
        </div>
        <label style={{ fontSize:12, fontWeight:700, color:C.azul, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:0.4 }}>E-mail institucional</label>
        <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter") entrar(); }} placeholder="curadoria@unidavi.edu.br" style={campo} />
        <label style={{ fontSize:12, fontWeight:700, color:C.azul, margin:"14px 0 6px", display:"block", textTransform:"uppercase", letterSpacing:0.4 }}>Senha da curadoria</label>
        <input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} onKeyDown={(e)=>{ if(e.key==="Enter") entrar(); }} placeholder="••••••••" autoComplete="current-password" style={campo} />
        {erro && <div style={{ display:"flex", alignItems:"center", gap:7, color:C.erro, fontSize:12.5, marginTop:10 }}><AlertTriangle size={15} color={C.erro} /> {erro}</div>}
        <button onClick={entrar} disabled={carregando} style={{ width:"100%", marginTop:16, background:carregando?C.cinza:C.azul, color:"#fff", border:"none", borderRadius:10, padding:"12px", fontSize:14.5, fontWeight:700, cursor:carregando?"default":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {carregando ? <><Loader2 size={17} className="girando" /> Verificando…</> : "Entrar"}
        </button>
        <div style={{ textAlign:"center", marginTop:16 }}>
          <a href="index.html" style={{ fontSize:12, color:C.cinza, textDecoration:"none" }}>← voltar à exibição</a>
        </div>
        {onDemo && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:"1px dashed #D6DFE9", textAlign:"center" }}>
            <div style={{ fontSize:11.5, color:C.cinza, marginBottom:8 }}>Sem acesso? Teste o editor de layout sem login:</div>
            <button onClick={onDemo} style={{ width:"100%", background:"#fff", color:C.azul, border:`1.5px solid ${C.azul}`, borderRadius:10, padding:"10px", fontSize:13.5, fontWeight:700, cursor:"pointer" }}>
              Entrar em modo demonstração
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ FICHA ============================ */
function Ficha({ t, email, senha, demo, onVoltar, onAtualizar }) {
  const [comentario, setComentario] = useState(t.comentario_curadoria || "");
  const [enviando, setEnviando] = useState(null); // "publicado" | "ajuste" | null
  const [erro, setErro] = useState("");
  const [abaFicha, setAbaFicha] = useState('conteudo');
  const [ajustesLayout, setAjustesLayout] = useState(() => {
    try { return JSON.parse(t.ajuste_layout || '{}'); } catch(e) { return {}; }
  });
  const [salvandoAj, setSalvandoAj] = useState(false);
  const [ajSalvo, setAjSalvo] = useState(false);
  const cor = AREA_COR[t.area] || C.ciano;
  const fase7 = Number(t.fase) === 7;
  // 8ª fase = resumo de artigo (resumo_completo), não pôster estruturado (ver _ehResumo8 em posters.jsx)
  const ehResumo8 = Number(t.fase) === 8;

  const acao = async (status) => {
    if (status === "ajuste" && !comentario.trim()) { setErro("Para devolver, escreva o que precisa ser ajustado."); return; }
    if (demo) { setErro(""); onAtualizar({ ...t, status, comentario_curadoria:comentario.trim() }); return; }
    setErro(""); setEnviando(status);
    try {
      const r = await fetch(API_URL, {
        method:"POST",
        headers:{ "Content-Type":"text/plain;charset=utf-8" }, // OBRIGATÓRIO (evita preflight CORS)
        body: JSON.stringify({ tipo:"curadoria", email_curadora:email, senha_curadora:senha || "", id:t.id, status, comentario:comentario.trim() }),
      });
      const res = await r.json();
      if (res.ok) onAtualizar({ ...t, status, comentario_curadoria:comentario.trim() });
      else setErro(res.erro || "Não foi possível registrar a decisão.");
    } catch (err) {
      setErro("Falha de conexão com o servidor.");
    } finally { setEnviando(null); }
  };

  /* salva ajustes de layout no backend e notifica o aluno por e-mail (backend envia) */
  const salvarAjusteLayout = async (aj) => {
    if (demo) {
      setAjustesLayout(aj); setAjSalvo(true);
      onAtualizar({ ...t, ajuste_layout: JSON.stringify(aj) });
      setTimeout(() => setAjSalvo(false), 3000);
      return;
    }
    setSalvandoAj(true);
    try {
      const r = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ tipo:'ajuste_layout', email_curadora:email, senha_curadora:senha||'', id:t.id, ajuste_layout:JSON.stringify(aj) }),
      });
      const res = await r.json();
      setAjustesLayout(aj);
      setAjSalvo(true);
      onAtualizar({ ...t, ajuste_layout: JSON.stringify(aj) });
      setTimeout(() => setAjSalvo(false), 3000);
    } catch(e) { /* falha silenciosa — ajuste salvo localmente */ }
    setSalvandoAj(false);
  };
  const Badge = ({ children, bg }) => <span style={{ fontSize:12, fontWeight:700, padding:"5px 13px", borderRadius:999, background:bg||C.cinzaClaro, color:bg?"#fff":C.cinza, whiteSpace:"nowrap" }}>{children}</span>;
  // figuras atribuídas a cada seção (secao do formulário): para tratar "campo vazio mas com figura"
  const figsPorSec = useMemo(() => {
    const m = {};
    (Array.isArray(t.figuras) ? t.figuras : []).forEach((f) => { if (f && f.secao) m[f.secao] = (m[f.secao] || 0) + 1; });
    return m;
  }, [t.figuras]);
  const Campo = ({ titulo, texto, temFigura }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:12, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 }}>{titulo}</div>
      {texto && String(texto).trim()
        ? <div style={{ fontSize:14.5, lineHeight:1.5, color:C.tinta }}>{texto}</div>
        : temFigura
          ? <div style={{ fontSize:13, fontStyle:"italic", color:C.cinza }}>(seção apresentada em figura)</div>
          : <div style={{ fontSize:13, fontStyle:"italic", color:C.erro, display:"flex", alignItems:"center", gap:6 }}><AlertTriangle size={14} color={C.erro} /> Campo não preenchido</div>}
    </div>
  );
  const palavras = (t.palavras ? String(t.palavras).split(",").map(s=>s.trim()).filter(Boolean) : []);

  return (
    <div style={{ minHeight:"100vh", background:C.papel }}>
      {/* barra fina fixa */}
      <div style={{ position:"sticky", top:0, zIndex:20, background:C.azul, color:"#fff", boxShadow:"0 2px 10px rgba(2,40,90,0.22)" }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"0 8px", height:54, display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={onVoltar} aria-label="Voltar" style={{ flexShrink:0, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", border:"none", background:"transparent", color:"#fff", cursor:"pointer", borderRadius:9 }}><ArrowLeft size={22} color="#fff" /></button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14.5, fontWeight:700, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.titulo || "(sem título)"}</div>
            <div style={{ fontSize:11.5, marginTop:1, color:"rgba(255,255,255,0.82)" }}>{t.id} · {t.area}</div>
          </div>
          {!ehResumo8 && PosterEditor && (
            <button onClick={()=>setAbaFicha(a => a==='poster'?'conteudo':'poster')} style={{ border:'none', background:abaFicha==='poster'?'rgba(255,255,255,0.22)':'transparent', color:'#fff', cursor:'pointer', borderRadius:8, padding:'5px 10px', fontSize:12, fontWeight:700, display:'inline-flex', alignItems:'center', gap:5, fontFamily:'inherit', whiteSpace:'nowrap' }}>
              <MonitorIco size={14} color='#fff'/> Pôster TV
            </button>
          )}
          <Selo s={t.status} />
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"18px auto 40px", padding:"0 16px", display:abaFicha==='poster'?'none':undefined }}>
        <div style={{ background:"#fff", border:"1px solid #E3EAF2", borderRadius:16, overflow:"hidden" }}>
          {/* cabeçalho da ficha */}
          <div style={{ padding:"22px 24px", borderBottom:"1px solid #EEF2F6" }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              <Badge bg={C.azul}>{t.fase}ª fase</Badge>
              <Badge>{t.desenho || t.tipo}</Badge>
              <Badge bg={cor}>{t.area}</Badge>
              <Badge>{t.id}</Badge>
            </div>
            <div style={{ fontSize:23, fontWeight:800, lineHeight:1.18, letterSpacing:-0.3, color:C.tinta, marginBottom:10 }}>{t.titulo || <span style={{ color:C.erro, fontStyle:"italic" }}>Sem título</span>}</div>
            <div style={{ fontSize:14, color:C.cinza, lineHeight:1.4 }}>
              {t.autores ? t.autores : <span style={{ color:C.erro, fontStyle:"italic" }}>Autores não preenchidos</span>}
            </div>
          </div>

          {/* corpo */}
          <div style={{ padding:"22px 24px" }}>
            {ehResumo8 ? (
              /* 8ª fase: uma única seção "Resumo"; sem campos de pôster nem Figuras/Palavras-chave */
              <Campo titulo="Resumo" texto={t.resumo_completo} />
            ) : (<>
            <Campo titulo="Introdução" texto={t.introducao} temFigura={!!figsPorSec["Introdução"]} />
            <Campo titulo="Objetivos" texto={t.objetivos} />
            <Campo titulo="Métodos" texto={t.metodos} temFigura={!!figsPorSec["Métodos"]} />
            <Campo titulo={fase7 ? "Resultados esperados" : "Resultados"} texto={t.resultados} temFigura={!!figsPorSec["Resultados"]} />
            {!fase7 && <Campo titulo="Conclusão" texto={t.conclusao} temFigura={!!figsPorSec["Discussão"]} />}

            {/* figuras na ordem */}
            <div style={{ fontSize:12, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Figuras</div>
            {Array.isArray(t.figuras) && t.figuras.length > 0 ? (
              <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
                {t.figuras.map((fg, i) => (
                  <div key={i} style={{ border:`1px solid ${fg.principal?C.ciano:"#E3EAF2"}`, borderRadius:12, overflow:"hidden", background:C.papel }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderBottom:"1px solid #EEF2F6", background:fg.principal?C.cianoClaro:"#fff" }}>
                      <span style={{ fontSize:12, fontWeight:800, color:C.azul }}>Fig {fg.ordem || i+1}</span>
                      <span style={{ fontSize:11.5, color:C.cinza }}>{fg.secao}</span>
                      {fg.principal && <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color:C.ciano }}><Star size={12} fill={C.ciano} color={C.ciano} /> Principal</span>}
                    </div>
                    <div style={{ display:"flex", gap:12, padding:12, alignItems:"flex-start" }}>
                      <div style={{ width:120, height:90, flexShrink:0, borderRadius:8, overflow:"hidden", background:"#EEF2F6", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {fg.url ? <img src={(window._driveSrc ? window._driveSrc(fg.url) : fg.url)} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} /> : <ImageIcon size={26} color={C.cinza} />}
                      </div>
                      <div style={{ fontSize:13.5, color:C.tinta, lineHeight:1.4 }}>{fg.legenda || <span style={{ color:C.erro, fontStyle:"italic" }}>Legenda não preenchida</span>}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:13, fontStyle:"italic", color:C.erro, marginBottom:20, display:"flex", alignItems:"center", gap:6 }}><AlertTriangle size={14} color={C.erro} /> Nenhuma figura enviada</div>
            )}

            {/* palavras-chave */}
            <div style={{ fontSize:12, fontWeight:800, color:cor, textTransform:"uppercase", letterSpacing:0.5, marginBottom:8 }}>Palavras-chave</div>
            {palavras.length > 0 ? (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {palavras.map((p) => <span key={p} style={{ fontSize:12.5, background:C.cinzaClaro, color:C.cinza, borderRadius:999, padding:"5px 13px" }}>{p}</span>)}
              </div>
            ) : <div style={{ fontSize:13, fontStyle:"italic", color:C.erro, display:"flex", alignItems:"center", gap:6 }}><AlertTriangle size={14} color={C.erro} /> Não preenchidas</div>}
            </>)}
          </div>

          {/* AÇÕES DE CURADORIA */}
          <div style={{ borderTop:"1px solid #EEF2F6", background:"#FBFDFE", padding:"20px 24px" }}>
            <div style={{ fontSize:13, fontWeight:800, color:C.tinta, marginBottom:4 }}>Decisão editorial</div>
            <div style={{ fontSize:12.5, color:C.cinza, marginBottom:12 }}>Confira a completude. Comentário obrigatório ao devolver para ajuste.</div>
            <textarea rows={3} value={comentario} onChange={(e)=>setComentario(e.target.value)} placeholder="Comentário para a equipe (o que falta, o que corrigir)…" style={{ ...campo, resize:"vertical" }} />
            {erro && <div style={{ display:"flex", alignItems:"center", gap:7, color:C.erro, fontSize:12.5, marginTop:10 }}><AlertTriangle size={15} color={C.erro} /> {erro}</div>}
            <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
              <button onClick={()=>acao("publicado")} disabled={!!enviando} style={{ flex:"1 1 200px", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, background:C.verde, color:"#fff", border:"none", borderRadius:10, padding:"12px 16px", fontSize:14, fontWeight:700, cursor:enviando?"default":"pointer", opacity:enviando?0.7:1 }}>
                {enviando==="publicado" ? <Loader2 size={17} className="girando" /> : <CheckCircle2 size={17} color="#fff" />} Liberar (publicar)
              </button>
              <button onClick={()=>acao("ajuste")} disabled={!!enviando || !comentario.trim()} title={!comentario.trim() ? "Escreva um comentário para devolver" : ""} style={{ flex:"1 1 200px", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, background:"#fff", color:(!comentario.trim()||enviando)?"#C5A0A0":C.erro, border:`1px solid ${(!comentario.trim()||enviando)?"#E3C9C9":C.erro}`, borderRadius:10, padding:"12px 16px", fontSize:14, fontWeight:700, cursor:(enviando||!comentario.trim())?"default":"pointer" }}>
                {enviando==="ajuste" ? <Loader2 size={17} className="girando" /> : <Undo2 size={17} />} Devolver para ajuste
              </button>
            </div>
          </div>
        </div>
      </div>
      {abaFicha === 'poster' && PosterEditor && !ehResumo8 && (
        <div style={{ position:'fixed', inset:0, zIndex:50, background:'#08131E', display:'flex', flexDirection:'column' }}>
          <div style={{ flexShrink:0, background:C.azulEsc, color:'#fff', padding:'0 16px', height:50, display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:5 }}>
            <button onClick={()=>setAbaFicha('conteudo')} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, fontFamily:'inherit' }}><ArrowLeft size={16} color='#fff'/> Conteúdo</button>
            <span style={{ flex:1, fontSize:13, color:'rgba(255,255,255,0.6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.titulo}</span>
            {ajSalvo && <span style={{ fontSize:12, color:C.ciano, fontWeight:700 }}>✓ Ajustes salvos</span>}
          </div>
          <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
            <PosterEditor
              t={{ ...t, figuras:(Array.isArray(t.figuras)?t.figuras:[]).map((fg,i)=>({...fg,ordem:fg.ordem||i+1,principal:fg.principal||(Number(t.fig_principal)===i+1)})) }}
              initialAjustes={ajustesLayout}
              onSave={salvarAjusteLayout}
              onCancel={()=>setAbaFicha('conteudo')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ PAINEL ============================ */
function Painel({ email, trabalhos, onSair, onAbrir, onAtualizar }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");

  const cont = useMemo(() => {
    const c = { enviado:0, publicado:0, ajuste:0 };
    trabalhos.forEach((t) => { if (c[t.status] != null) c[t.status]++; });
    return c;
  }, [trabalhos]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return trabalhos.filter((t) => {
      if (filtro !== "todos" && t.status !== filtro) return false;
      if (!q) return true;
      return (t.titulo || "").toLowerCase().includes(q) || (t.autores || "").toLowerCase().includes(q);
    });
  }, [trabalhos, filtro, busca]);

  const stat = (label, valor, cor) => (
    <div style={{ background:"#fff", border:"1px solid #E3EAF2", borderRadius:14, padding:"16px 18px", flex:"1 1 130px" }}>
      <div style={{ fontSize:30, fontWeight:800, color:cor, lineHeight:1 }}>{valor}</div>
      <div style={{ fontSize:12.5, color:C.cinza, marginTop:6, fontWeight:600 }}>{label}</div>
    </div>
  );
  const chip = (val, label, cor) => (
    <button onClick={()=>setFiltro(val)} style={{ border:"none", borderRadius:999, padding:"7px 14px", fontSize:13, fontWeight:700, cursor:"pointer", background:filtro===val?(cor||C.azul):"#fff", color:filtro===val?"#fff":C.cinza, boxShadow:filtro===val?"none":"inset 0 0 0 1px #E3EAF2", whiteSpace:"nowrap" }}>{label}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.papel }}>
      <header style={{ background:"#fff", borderBottom:"1px solid #E3EAF2", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ background:C.azulEsc }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"9px 16px" }}>
            <div style={{ height:40, backgroundImage:`url(${(window.__resources && window.__resources.logoStrip) || "assets/logo-strip.jpeg"})`, backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"left center" }} role="img" aria-label="Medicina UNIDAVI · NPCMed · SAM 2026" />
          </div>
        </div>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 16px", display:"flex", alignItems:"center", gap:10, height:54 }}>
          <div style={{ fontWeight:800, fontSize:15.5, color:C.azul }}>Curadoria <span style={{ color:C.cinza, fontWeight:600 }}>· gestão editorial</span></div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:12.5, color:C.cinza, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} className="cur-email">{email}</span>
            <button onClick={onSair} style={{ display:"inline-flex", alignItems:"center", gap:7, border:"1px solid #E3EAF2", background:"#fff", color:C.cinza, fontSize:13, fontWeight:700, padding:"8px 13px", borderRadius:10, cursor:"pointer" }}><LogOut size={15} color={C.cinza} /><span className="lbl-sair">Sair</span></button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px 60px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:12.5, color:C.cinza, background:C.cianoClaro, borderRadius:10, padding:"9px 13px", marginBottom:18 }}>
          <Lock size={15} color={C.azul} /> Curadoria é <strong style={{ color:C.azulEsc }}>gestão editorial</strong> — conferência de completude. O mérito já foi avaliado pela banca de TC.
        </div>

        {/* contadores */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
          {stat("Aguardando", cont.enviado, C.ambar)}
          {stat("Publicados", cont.publicado, C.verde)}
          {stat("Em ajuste", cont.ajuste, C.erro)}
          {stat("Total", trabalhos.length, C.azul)}
        </div>

        {/* filtros + busca */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:18 }}>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {chip("todos","Todos",C.azul)}
            {chip("enviado","Aguardando",C.ambar)}
            {chip("publicado","Publicados",C.verde)}
            {chip("ajuste","Em ajuste",C.erro)}
          </div>
          <div style={{ marginLeft:"auto", position:"relative", flex:"1 1 240px", maxWidth:340 }}>
            <Search size={16} color={C.cinza} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
            <input value={busca} onChange={(e)=>setBusca(e.target.value)} placeholder="Buscar por título ou autor…" style={{ ...campo, paddingLeft:36 }} />
          </div>
        </div>

        {/* lista */}
        {lista.length === 0 ? (
          <div style={{ textAlign:"center", color:C.cinza, padding:"50px 20px", fontSize:14 }}>Nenhum trabalho neste filtro.</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(330px, 1fr))", gap:12 }}>
            {lista.map((t) => {
              const cor = AREA_COR[t.area] || C.cinza;
              return (
                <button key={t.id} onClick={()=>onAbrir(t.id)} style={{ textAlign:"left", background:"#fff", border:"1px solid #E3EAF2", borderLeft:`4px solid ${cor}`, borderRadius:12, padding:16, cursor:"pointer", display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11.5, fontWeight:800, color:C.azul }}>{t.id}</span>
                    <span style={{ fontSize:11.5, color:C.cinza }}>· {t.fase}ª fase</span>
                    <span style={{ marginLeft:"auto" }}><Selo s={t.status} /></span>
                  </div>
                  <div style={{ fontSize:14.5, fontWeight:700, color:C.tinta, lineHeight:1.3 }}>{t.titulo || <span style={{ color:C.erro, fontStyle:"italic" }}>Sem título</span>}</div>
                  <div style={{ fontSize:12.5, color:C.cinza, lineHeight:1.35 }}>{t.autores || <span style={{ color:C.erro, fontStyle:"italic" }}>Autores não preenchidos</span>}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ APP ============================ */
/* Tela de espera enquanto revalida a sessão guardada (não pisca o login) */
function Revalidando() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:`radial-gradient(1200px 600px at 50% -10%, ${C.cianoClaro}, ${C.papel})` }}>
      <div style={{ width:"100%", maxWidth:400, background:"#fff", border:"1px solid #E3EAF2", borderRadius:18, padding:30, boxShadow:"0 18px 50px rgba(2,40,90,0.10)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:18 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:C.azul, display:"flex", alignItems:"center", justifyContent:"center" }}><Microscope size={22} color="#fff" /></div>
          <div style={{ lineHeight:1.1 }}>
            <div style={{ fontWeight:800, fontSize:18, color:C.azul }}>SAM <span style={{ color:C.ciano }}>2026</span></div>
            <div style={{ fontSize:11.5, color:C.cinza, marginTop:2 }}>Curadoria editorial</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:13.5, color:C.cinza }}>
          <Loader2 size={18} className="girando" /> Reconectando à sua sessão…
        </div>
      </div>
    </div>
  );
}

function CuradoriaApp() {
  const [sessao, setSessao] = useState(null);        // { email, trabalhos }
  const [abertoId, setAbertoId] = useState(null);
  // fase de bootstrap: se há e-mail guardado, revalida antes de mostrar qualquer tela
  const [fase, setFase] = useState(() => {
    try { return localStorage.getItem(LS_CURADORIA_EMAIL) ? "revalidando" : "login"; }
    catch (e) { return "login"; }
  });
  const [emailInicial, setEmailInicial] = useState("");
  const [senhaInicial, setSenhaInicial] = useState("");
  const [erroInicial, setErroInicial] = useState("");

  // Revalidação automática do e-mail guardado (mesma chamada do login).
  useEffect(() => {
    if (fase !== "revalidando") return;
    let vivo = true;
    let armazenado = "";
    let senhaArmazenada = "";
    try { armazenado = (localStorage.getItem(LS_CURADORIA_EMAIL) || "").trim(); } catch (e) {}
    try { senhaArmazenada = localStorage.getItem(LS_CURADORIA_SENHA) || ""; } catch (e) {}
    if (!armazenado) { setFase("login"); return; }
    (async () => {
      try {
        const r = await fetch(API_URL + "?action=curadoria&email=" + encodeURIComponent(armazenado) + "&senha=" + encodeURIComponent(senhaArmazenada));
        const res = await r.json();
        if (!vivo) return;
        if (res.ok) {
          setSessao({ email: armazenado, senha: senhaArmazenada, trabalhos: res.trabalhos || [] });
          setFase("ok");
        } else {
          // e-mail/senha inválidos ou removidos → limpa e cai no login com a mensagem do backend
          try { localStorage.removeItem(LS_CURADORIA_EMAIL); localStorage.removeItem(LS_CURADORIA_SENHA); } catch (e) {}
          setEmailInicial(""); setSenhaInicial("");
          setErroInicial(res.erro || "E-mail não autorizado para a curadoria.");
          setFase("login");
        }
      } catch (err) {
        if (!vivo) return;
        // falha de rede → cai no login com erro padrão (e-mail/senha pré-preenchidos p/ tentar de novo)
        setEmailInicial(armazenado); setSenhaInicial(senhaArmazenada);
        setErroInicial("Falha de conexão com o servidor. Tente novamente.");
        setFase("login");
      }
    })();
    return () => { vivo = false; };
  }, [fase]);

  if (fase === "revalidando") return <Revalidando />;

  if (!sessao) return <Login emailInicial={emailInicial} senhaInicial={senhaInicial} erroInicial={erroInicial} onDemo={() => {
    setEmailInicial(""); setSenhaInicial(""); setErroInicial("");
    setSessao({ email: "Modo demonstração", senha: "", demo: true, trabalhos: DEMO_TRABALHOS.map((x) => ({ ...x })) });
    setFase("ok");
  }} onOk={(email, senha, trabalhos) => {
    try { localStorage.setItem(LS_CURADORIA_EMAIL, email); localStorage.setItem(LS_CURADORIA_SENHA, senha || ""); } catch (e) {}
    setEmailInicial(""); setSenhaInicial(""); setErroInicial("");
    setSessao({ email, senha, trabalhos });
    setFase("ok");
  }} />;

  const atualizar = (t) => {
    setSessao((s) => ({ ...s, trabalhos: s.trabalhos.map((x) => x.id === t.id ? t : x) }));
  };
  const aberto = abertoId != null ? sessao.trabalhos.find((t) => t.id === abertoId) : null;

  const sair = () => {
    try { localStorage.removeItem(LS_CURADORIA_EMAIL); localStorage.removeItem(LS_CURADORIA_SENHA); } catch (e) {}
    setSessao(null); setAbertoId(null);
    setEmailInicial(""); setSenhaInicial(""); setErroInicial("");
    setFase("login");
  };

  if (aberto) return <Ficha t={aberto} email={sessao.email} senha={sessao.senha} demo={sessao.demo} onVoltar={()=>setAbertoId(null)} onAtualizar={(t)=>{ atualizar(t); setAbertoId(null); }} />;

  return <Painel email={sessao.email} trabalhos={sessao.trabalhos} demo={sessao.demo} onSair={sair} onAbrir={setAbertoId} onAtualizar={atualizar} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<CuradoriaApp />);
