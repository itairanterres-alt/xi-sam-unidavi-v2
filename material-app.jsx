/* ============================================================
   XI SAM 2026 — ADICIONAR MATERIAL (página /material)
   Acesso por LOGIN GOOGLE (Google Identity Services), restrito ao
   domínio UNIDAVI (parâmetro hd). Sem token na URL.
   Fluxo:
     1. "Entrar com Google" → recebe o ID token (JWT).
     2. POST { tipo:"material_trabalhos", idToken } → trabalhos do e-mail.
        · 0 trabalhos → aviso · 1 → abre direto · 2+ → lista para escolher.
     3. Anexa podcast (.mp3) / flashcards (.csv) e cola o texto do quiz
        (pré-visualizado no backend → questões estruturadas), todos opcionais.
     4. Declaração obrigatória + POST { tipo:"material", idToken, id, ... }.
   POST em text/plain;charset=utf-8 (evita preflight CORS); arquivos em base64.
   Página autossuficiente (sem imports de módulo).
   ============================================================ */
const { useState, useEffect, useMemo, useRef } = React;

// URL do "App da Web" do Apps Script (implantação ativa) — NÃO alterar.
const API_URL = "https://script.google.com/macros/s/AKfycbw8GrSUw3Ck8Pt4qolDD44xy_4Y0vXv9KaUfEUZKFUk7qKUWyE8kJRpTqSX9AtdNRCrOg/exec";

// >>> Client ID OAuth do Google (Web) <<<
const GOOGLE_CLIENT_ID = "403359576266-0darbt2j0b0ggmprmjafmr7lg72akp3d.apps.googleusercontent.com";
// Domínio institucional aceito no login (parâmetro hd do Google).
const HD_DOMINIO = "unidavi.edu.br";
const CLIENT_OK = /\.apps\.googleusercontent\.com$/.test(GOOGLE_CLIENT_ID) && !/^COLE_AQUI/.test(GOOGLE_CLIENT_ID);

const C = {
  azul:"#023E88", azulEsc:"#01285A", ciano:"#00ADEF", cianoClaro:"#E5F6FE",
  tinta:"#0C1A2B", cinza:"#5B6B7E", cinzaClaro:"#EEF2F6", papel:"#F7F9FB", erro:"#C0392B", ok:"#1F8A5B",
};

/* ---------- Ícones (stroke SVG inline) ---------- */
function MIco({ size = 20, color = "currentColor", sw = 2, children, fill = "none", className, style }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, display:"block", ...style }}>{children}</svg>
  );
}
const Headphones  = (p) => <MIco {...p}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-9a9 9 0 0 1 18 0v9a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></MIco>;
const ListChecks  = (p) => <MIco {...p}><path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/></MIco>;
const Layers      = (p) => <MIco {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m6.08 9.5-3.48 1.59a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83L17.92 9.5"/></MIco>;
const Upload      = (p) => <MIco {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></MIco>;
const CheckCircle2= (p) => <MIco {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></MIco>;
const Check       = (p) => <MIco {...p}><path d="M20 6 9 17l-5-5"/></MIco>;
const X           = (p) => <MIco {...p}><path d="M18 6 6 18M6 6l12 12"/></MIco>;
const Trash2      = (p) => <MIco {...p}><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></MIco>;
const Loader2     = (p) => <MIco {...p}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></MIco>;
const AlertCircle = (p) => <MIco {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></MIco>;
const FileText    = (p) => <MIco {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></MIco>;
const LogOut      = (p) => <MIco {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></MIco>;
const ChevronRight= (p) => <MIco {...p}><path d="m9 18 6-6-6-6"/></MIco>;

/* ---------- helpers ---------- */
/* decodifica o payload do JWT (ID token) sem validar — só p/ exibir e-mail/nome */
function decodeJwt(tok) {
  try {
    const b = tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(atob(b).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
    return JSON.parse(json);
  } catch (e) { return {}; }
}
/* lê o arquivo como base64 puro (sem o prefixo data:...;base64,) */
function readBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const s = String(r.result); const i = s.indexOf(","); res(i >= 0 ? s.slice(i + 1) : s); };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
/* ====== MODO DEMO (apenas para teste no preview) ======
   Ativado por window.SAM_DEMO. Simula o backend do Apps Script: gera o login,
   um trabalho fictício, interpreta o quiz colado e confirma o envio. NÃO afeta
   a produção — com a flag desligada, todas as chamadas vão para a API_URL real. */
function demoQuizParse(texto) {
  // aceita o formato "colado do NotebookLM": blocos separados por --- ou linha em branco
  const blocos = String(texto || "").split(/\n\s*(?:---+|\n)\s*\n?/).map((b) => b.trim()).filter(Boolean);
  const questoes = [];
  blocos.forEach((bloco) => {
    const linhas = bloco.split(/\n/).map((l) => l.trim()).filter(Boolean);
    let pergunta = "", correta = 0, explicacao = ""; const alternativas = [];
    linhas.forEach((l) => {
      let m;
      if (m = l.match(/^(?:P|Pergunta|Q)\s*[:\.\)]\s*(.+)$/i)) pergunta = m[1].trim();
      else if (m = l.match(/^([A-Da-d])\s*[\)\.\-]\s*(.+)$/)) alternativas.push(m[2].trim());
      else if (m = l.match(/^(?:Correta|Resposta|Gabarito)\s*[:\.]\s*([A-Da-d])/i)) correta = m[1].toUpperCase().charCodeAt(0) - 65;
      else if (m = l.match(/^(?:Explica[çc][ãa]o|Justificativa)\s*[:\.]\s*(.+)$/i)) explicacao = m[1].trim();
      else if (!pergunta) pergunta = l.trim();
    });
    if (pergunta && alternativas.length >= 2) questoes.push({ pergunta, alternativas, correta: Math.max(0, Math.min(correta, alternativas.length - 1)), explicacao });
  });
  // fallback didático se nada foi reconhecido, para o teste sempre mostrar algo
  if (!questoes.length) {
    questoes.push(
      { pergunta:"(demo) Qual exame é padrão-ouro para avaliar disfunção diastólica?", alternativas:["Ecocardiografia com Doppler","Radiografia de tórax","Eletrocardiograma de repouso","Hemograma"], correta:0, explicacao:"A ecocardiografia com Doppler avalia o relaxamento e enchimento ventricular." },
      { pergunta:"(demo) O texto colado não seguiu o formato esperado — esta é uma questão de exemplo.", alternativas:["Entendi","Vou revisar o texto","Tanto faz","Não sei"], correta:1, explicacao:"No envio real, o backend (Gemini) estrutura o quiz a partir do texto do NotebookLM." }
    );
  }
  return questoes;
}
async function demoBackend(payload) {
  await new Promise((r) => setTimeout(r, 480)); // simula latência de rede
  switch (payload && payload.tipo) {
    case "material_trabalhos":
      return { ok:true, trabalhos:[ { id:"DEMO-001", titulo:"Avaliação ecocardiográfica da disfunção diastólica induzida por quimioterapia", autor:"Marcel Felipe Alves", material:null } ] };
    case "quiz_preview":
      return { ok:true, questoes: demoQuizParse(payload.texto) };
    case "material":
      return { ok:true };
    default:
      return { ok:false, erro:"(demo) tipo não reconhecido: " + (payload && payload.tipo) };
  }
}

/* POST JSON simples (text/plain evita preflight CORS) */
async function postJSON(payload) {
  if (window.SAM_DEMO) return demoBackend(payload);
  const r = await fetch(API_URL, { method:"POST", headers:{ "Content-Type":"text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
  return r.json();
}
/* POST com progresso de upload (XHR; text/plain evita preflight CORS) */
function postComProgresso(payload, onProgress) {
  if (window.SAM_DEMO) {
    return new Promise((resolve) => {
      let p = 0;
      const it = setInterval(() => { p += 0.18; if (onProgress) onProgress(Math.min(p, 1)); if (p >= 1) { clearInterval(it); setTimeout(() => resolve({ ok:true }), 250); } }, 160);
    });
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", API_URL);
    xhr.setRequestHeader("Content-Type", "text/plain;charset=utf-8");
    if (xhr.upload) xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total); };
    xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error("Resposta inválida do servidor.")); } };
    xhr.onerror = () => reject(new Error("Falha de rede ao enviar."));
    xhr.send(JSON.stringify(payload));
  });
}
const fmtTamanho = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(0) + " KB" : (b / 1024 / 1024).toFixed(1) + " MB";
const MAX_MB = 35;

/* ---------- botão "Entrar com Google" (GIS) ---------- */
function BotaoGoogle({ onCredential }) {
  const ref = useRef(null);
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    if (!CLIENT_OK) return;
    let cancelado = false;
    const tentar = () => {
      if (cancelado) return;
      const g = window.google && window.google.accounts && window.google.accounts.id;
      if (!g) { setTimeout(tentar, 150); return; }
      try {
        g.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onCredential, hd: HD_DOMINIO, auto_select:false, ux_mode:"popup" });
        if (ref.current) g.renderButton(ref.current, { type:"standard", theme:"filled_blue", size:"large", text:"signin_with", shape:"pill", logo_alignment:"left", width:280 });
        setPronto(true);
      } catch (e) {}
    };
    tentar();
    return () => { cancelado = true; };
  }, []);
  if (!CLIENT_OK) {
    return (
      <div style={{ background:"#FFF7E6", border:"1px solid #F0D9A0", borderRadius:12, padding:"13px 14px", fontSize:13, color:"#7A5A12", lineHeight:1.5, textAlign:"left" }}>
        <strong>Configuração pendente.</strong> Defina o <code>GOOGLE_CLIENT_ID</code> em <code>material-app.jsx</code> com o Client ID OAuth do Google (termina em <code>.apps.googleusercontent.com</code>) para habilitar o login.
      </div>
    );
  }
  return (
    <div>
      <div ref={ref} style={{ display:"flex", justifyContent:"center", minHeight:44 }} />
      {!pronto && <div style={{ fontSize:13, color:C.cinza, textAlign:"center", marginTop:8 }}>Carregando o login…</div>}
    </div>
  );
}

/* ---------- linha de upload (um por tipo) ---------- */
function LinhaUpload({ ico:Ico, titulo, descricao, accept, arquivo, jaTem, onPick, onClear }) {
  const inputRef = useRef(null);
  const grande = arquivo && arquivo.size > MAX_MB * 1024 * 1024;
  return (
    <div style={{ border:`1px solid ${arquivo ? C.ciano : "#E3EAF2"}`, borderRadius:12, padding:14, background: arquivo ? C.cianoClaro : "#fff", marginBottom:12 }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ width:42, height:42, borderRadius:10, background: arquivo ? "#fff" : C.cianoClaro, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Ico size={20} color={C.azul} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:14.5, fontWeight:700, color:C.tinta }}>{titulo}</span>
            <span style={{ fontSize:12, color:C.cinza, whiteSpace:"nowrap" }}>{descricao}</span>
            {jaTem && !arquivo && <span style={{ fontSize:11, fontWeight:700, color:C.ok, display:"inline-flex", alignItems:"center", gap:3 }}><Check size={12} color={C.ok} /> já anexado</span>}
          </div>
          {arquivo ? (
            <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:13, color:C.tinta, fontWeight:600, wordBreak:"break-all" }}>{arquivo.name}</span>
              <span style={{ fontSize:12, color: grande ? C.erro : C.cinza }}>{fmtTamanho(arquivo.size)}{grande ? ` · acima de ${MAX_MB} MB` : ""}</span>
              <button onClick={onClear} style={{ display:"inline-flex", alignItems:"center", gap:5, border:"1px solid #E3EAF2", background:"#fff", color:C.erro, borderRadius:7, padding:"4px 9px", fontSize:12, fontWeight:700, cursor:"pointer" }}><Trash2 size={12} /> Remover</button>
            </div>
          ) : (
            <button onClick={() => inputRef.current && inputRef.current.click()} style={{ marginTop:9, display:"inline-flex", alignItems:"center", gap:6, border:`1px dashed ${C.azul}`, background:"#fff", color:C.azul, borderRadius:8, padding:"7px 13px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
              <Upload size={14} /> Escolher arquivo
            </button>
          )}
          <input ref={inputRef} type="file" accept={accept} style={{ display:"none" }} onChange={(e) => { const f = e.target.files[0]; if (f) onPick(f); e.target.value = ""; }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- entrada do quiz: cola o texto do NotebookLM → backend devolve
   questões estruturadas (POST tipo:"quiz_preview"). O array confirmado na
   pré-visualização sobe no envio como quiz:{ questoes:[...] }. ---------- */
function QuizEntrada({ idToken, questoes, setQuestoes, jaTem }) {
  const [texto, setTexto] = useState("");
  const [status, setStatus] = useState("idle"); // idle | carregando | erro
  const [erro, setErro] = useState("");
  const temQuiz = Array.isArray(questoes) && questoes.length > 0;

  const previsualizar = async () => {
    const t = texto.trim();
    if (!t) { setErro("Cole o texto do quiz gerado no NotebookLM antes de pré-visualizar."); setStatus("erro"); return; }
    setStatus("carregando"); setErro("");
    try {
      const res = await postJSON({ tipo:"quiz_preview", idToken, texto: t });
      if (!res || res.ok === false || res.erro) throw new Error((res && res.erro) || "Não foi possível interpretar o quiz. Revise o texto colado e tente de novo.");
      const qs = (res.questoes || []).filter((q) => q && q.pergunta && Array.isArray(q.alternativas) && q.alternativas.length >= 2);
      if (!qs.length) throw new Error("Nenhuma questão foi reconhecida no texto. Confira o conteúdo colado e tente de novo.");
      setQuestoes(qs); setStatus("idle");
    } catch (e) {
      setStatus("erro"); setErro(String(e && e.message || e));
    }
  };
  const refazer = () => { setQuestoes(null); setStatus("idle"); setErro(""); };

  const ativo = temQuiz;
  return (
    <div style={{ border:`1px solid ${ativo ? C.ciano : "#E3EAF2"}`, borderRadius:12, padding:14, background: ativo ? C.cianoClaro : "#fff", marginBottom:12 }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ width:42, height:42, borderRadius:10, background: ativo ? "#fff" : C.cianoClaro, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <ListChecks size={20} color={C.azul} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:14.5, fontWeight:700, color:C.tinta }}>Quiz</span>
            <span style={{ fontSize:12, color:C.cinza }}>texto do NotebookLM</span>
            {jaTem && !temQuiz && <span style={{ fontSize:11, fontWeight:700, color:C.ok, display:"inline-flex", alignItems:"center", gap:3 }}><Check size={12} color={C.ok} /> já anexado</span>}
          </div>

          {!temQuiz ? (
            <div style={{ marginTop:10 }}>
              <textarea value={texto} onChange={(e) => { setTexto(e.target.value); if (status === "erro") setStatus("idle"); }}
                placeholder="Cole aqui o texto do quiz gerado no NotebookLM" rows={6}
                style={{ width:"100%", boxSizing:"border-box", border:"1px solid #E3EAF2", borderRadius:10, padding:"11px 12px", fontSize:14, lineHeight:1.5, color:C.tinta, resize:"vertical", background:"#fff" }} />
              {status === "erro" && (
                <div style={{ marginTop:8, background:"#FBEAE8", border:"1px solid #E8C5C0", borderRadius:9, padding:"9px 12px", fontSize:13, color:"#7A2616", display:"flex", gap:8, alignItems:"flex-start", lineHeight:1.45 }}>
                  <AlertCircle size={15} color={C.erro} style={{ marginTop:1, flexShrink:0 }} /><span>{erro}</span>
                </div>
              )}
              <button onClick={previsualizar} disabled={status === "carregando"}
                style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:7, border:"none", background: status === "carregando" ? C.cinza : C.azul, color:"#fff", borderRadius:9, padding:"9px 15px", fontSize:13.5, fontWeight:700, cursor: status === "carregando" ? "default" : "pointer" }}>
                {status === "carregando" ? <><Loader2 size={15} color="#fff" className="girando" /> Gerando pré-visualização…</> : <><ListChecks size={15} color="#fff" /> Pré-visualizar quiz</>}
              </button>
            </div>
          ) : (
            <div style={{ marginTop:10 }}>
              <div style={{ fontSize:13, color:C.azulEsc, fontWeight:600, display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <CheckCircle2 size={15} color={C.ok} /> {questoes.length} {questoes.length === 1 ? "questão reconhecida" : "questões reconhecidas"} — confira antes de enviar
              </div>
              <QuizPreview questoes={questoes} />
              <button onClick={refazer} style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:6, border:"1px solid #E3EAF2", background:"#fff", color:C.azul, borderRadius:8, padding:"7px 13px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                <Trash2 size={13} /> Refazer / editar texto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* pré-visualização read-only das questões estruturadas */
function QuizPreview({ questoes }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {questoes.map((q, qi) => (
        <div key={qi} style={{ background:"#fff", border:"1px solid #E3EAF2", borderRadius:11, padding:"13px 14px" }}>
          <div style={{ fontSize:11, fontWeight:800, color:C.cinza, letterSpacing:0.6, textTransform:"uppercase", marginBottom:6 }}>Questão {qi + 1}</div>
          <div style={{ fontSize:14.5, fontWeight:700, color:C.tinta, lineHeight:1.4, marginBottom:10 }}>{q.pergunta}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {q.alternativas.map((alt, ai) => {
              const correta = ai === q.correta;
              return (
                <div key={ai} style={{ display:"flex", gap:9, alignItems:"flex-start", border:`1.5px solid ${correta ? "#1F8A5B" : "#E3EAF2"}`, background: correta ? "#EAF7EF" : "#fff", color: correta ? "#15663F" : C.tinta, borderRadius:9, padding:"9px 11px", fontSize:13.5, lineHeight:1.4 }}>
                  <span style={{ fontWeight:800 }}>{String.fromCharCode(65 + ai)}</span>
                  <span style={{ flex:1 }}>{alt}</span>
                  {correta && <Check size={15} color="#1F8A5B" />}
                </div>
              );
            })}
          </div>
          {q.explicacao && (
            <div style={{ marginTop:10, background:C.papel, border:"1px solid #E3EAF2", borderRadius:9, padding:"9px 12px", fontSize:13, lineHeight:1.5, color:C.cinza }}>
              <strong style={{ color:C.azul }}>Explicação. </strong>{q.explicacao}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================ APP ============================ */
function MaterialApp() {
  // fase: login | carregando | erroAuth | lista | form
  const [fase, setFase] = useState("login");
  const [auth, setAuth] = useState(null);          // { idToken, email, nome }
  const [erroMsg, setErroMsg] = useState("");
  const [trabalhos, setTrabalhos] = useState([]);  // [{ id, titulo, autor, material }]
  const [sel, setSel] = useState(null);            // trabalho escolhido
  const [arq, setArq] = useState({ podcast:null, flashcards:null });
  const [quizQuestoes, setQuizQuestoes] = useState(null); // array confirmado na pré-visualização, ou null
  const [declaracao, setDeclaracao] = useState(false);
  const [envio, setEnvio] = useState(null);        // null | {estado:"enviando",progresso} | {estado:"sucesso"} | {estado:"erro",msg}

  /* modo demo: pula o login do Google e carrega um trabalho fictício */
  useEffect(() => {
    if (!window.SAM_DEMO) return;
    const idToken = "demo-token";
    setAuth({ idToken, email:"demo@unidavi.edu.br", nome:"Conta de teste" });
    buscarTrabalhos(idToken).then(() => {
      // p/ prints do manual: semeia o quiz já reconhecido (estado de pré-visualização)
      if (Array.isArray(window.SAM_DEMO_QUIZ) && window.SAM_DEMO_QUIZ.length) setQuizQuestoes(window.SAM_DEMO_QUIZ);
    });
  }, []);

  /* busca os trabalhos do e-mail logado; keepId mantém a seleção após reenvio */
  const buscarTrabalhos = async (idToken, keepId) => {
    setFase("carregando"); setErroMsg("");
    try {
      const res = await postJSON({ tipo:"material_trabalhos", idToken });
      if (!res || res.ok === false || res.erro) throw new Error((res && res.erro) || "Não foi possível verificar a sua conta. Tente novamente.");
      const lista = res.trabalhos || res.lista || [];
      setTrabalhos(lista);
      if (lista.length === 0) { setErroMsg("Não encontramos nenhum trabalho submetido com este e-mail. Use a mesma conta da submissão."); setFase("erroAuth"); return; }
      if (keepId) { const m = lista.find((t) => t.id === keepId); if (m) { setSel(m); setFase("form"); return; } }
      if (lista.length === 1) { setSel(lista[0]); setFase("form"); }
      else { setSel(null); setFase("lista"); }
    } catch (e) {
      setErroMsg(String(e && e.message || e)); setFase("erroAuth");
    }
  };

  const onCredential = (resp) => {
    const idToken = resp && resp.credential;
    if (!idToken) { setErroMsg("Login não concluído. Tente novamente."); setFase("erroAuth"); return; }
    const p = decodeJwt(idToken);
    const email = (p.email || "").toLowerCase();
    // garantia extra no cliente (o hd já restringe no Google; a validação real é no backend)
    if (HD_DOMINIO && p.hd !== HD_DOMINIO && !email.endsWith("@" + HD_DOMINIO)) {
      setAuth(null);
      setErroMsg(`Use a sua conta institucional @${HD_DOMINIO}. A conta "${email || "selecionada"}" não pertence ao domínio da UNIDAVI.`);
      setFase("erroAuth");
      try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
      return;
    }
    setAuth({ idToken, email, nome: p.name || "" });
    buscarTrabalhos(idToken);
  };

  const sair = () => {
    try { window.google.accounts.id.disableAutoSelect(); } catch (e) {}
    setAuth(null); setTrabalhos([]); setSel(null); setArq({ podcast:null, flashcards:null }); setQuizQuestoes(null); setDeclaracao(false); setErroMsg(""); setFase("login");
  };

  const temQuiz = Array.isArray(quizQuestoes) && quizQuestoes.length > 0;
  const temAlgum = !!(arq.podcast || arq.flashcards || temQuiz);
  const algumGrande = [arq.podcast, arq.flashcards].some((f) => f && f.size > MAX_MB * 1024 * 1024);
  const podeEnviar = declaracao && temAlgum && !algumGrande && sel && auth;

  const enviar = async () => {
    if (!podeEnviar) return;
    setEnvio({ estado:"enviando" });
    try {
      const payload = { tipo:"material", idToken: auth.idToken, id: sel.id, declaracao:true, podcast:null, quiz:null, flashcards:null };
      if (arq.podcast)    payload.podcast    = { nome: arq.podcast.name,    base64: await readBase64(arq.podcast) };
      if (temQuiz)        payload.quiz       = { questoes: quizQuestoes };
      if (arq.flashcards) payload.flashcards = { nome: arq.flashcards.name, base64: await readBase64(arq.flashcards) };
      const res = await postJSON(payload);
      if (res && res.ok) setEnvio({ estado:"sucesso" });
      else setEnvio({ estado:"erro", msg: (res && res.erro) || "Não foi possível anexar o material." });
    } catch (e) {
      setEnvio({ estado:"erro", msg: String(e && e.message || e) });
    }
  };

  const Cabecalho = () => (
    <header style={{ background:C.azulEsc }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"9px 16px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ flex:1, height:42, backgroundImage:`url(${(window.__resources && window.__resources.logoStrip) || "assets/logo-strip.jpeg"})`, backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"left center" }} role="img" aria-label="Medicina UNIDAVI · NPCMed · SAM 2026" />
        {auth && (
          <button onClick={sair} title="Sair" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff", borderRadius:9, padding:"6px 11px", fontSize:12.5, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            <LogOut size={14} color="#fff" /> Sair
          </button>
        )}
      </div>
    </header>
  );
  const card = { background:"#fff", border:"1px solid #E3EAF2", borderRadius:16, padding:"22px 22px 24px", boxShadow:"0 8px 30px rgba(2,40,90,0.06)" };

  return (
    <div style={{ minHeight:"100vh", background:C.papel, color:C.tinta }}>
      <Cabecalho />
      <div style={{ maxWidth:680, margin:"0 auto", padding:"22px 16px 60px" }}>

        {auth && (
          <div style={{ fontSize:13, color:C.cinza, marginBottom:16, display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
            <CheckCircle2 size={15} color={C.ok} /> Conectado como <strong style={{ color:C.tinta }}>{auth.email}</strong>
          </div>
        )}

        {/* ---------- LOGIN ---------- */}
        {fase === "login" && (
          <div style={card}>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.azul, letterSpacing:-0.3, margin:"0 0 8px" }}>Adicionar material</h1>
            <p style={{ fontSize:14.5, color:C.cinza, lineHeight:1.55, margin:"0 0 20px" }}>Anexe podcast, quiz e flashcards ao seu trabalho. Entre com a sua conta institucional <strong>@{HD_DOMINIO}</strong> — a mesma usada na submissão.</p>
            <BotaoGoogle onCredential={onCredential} />
          </div>
        )}

        {/* ---------- CARREGANDO ---------- */}
        {fase === "carregando" && (
          <div style={{ ...card, display:"flex", alignItems:"center", gap:10, color:C.azulEsc }}>
            <Loader2 size={18} color={C.ciano} className="girando" /> Verificando os seus trabalhos…
          </div>
        )}

        {/* ---------- ERRO DE AUTENTICAÇÃO / SEM TRABALHO ---------- */}
        {fase === "erroAuth" && (
          <div style={card}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <AlertCircle size={20} color={C.erro} style={{ marginTop:2, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>Não foi possível continuar</div>
                <div style={{ fontSize:14, lineHeight:1.55, color:C.cinza }}>{erroMsg}</div>
                <button onClick={sair} style={{ marginTop:14, border:"1px solid #E3EAF2", background:"#fff", color:C.azul, borderRadius:9, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Entrar com outra conta</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- LISTA (2+ trabalhos) ---------- */}
        {fase === "lista" && (
          <>
            <h1 style={{ fontSize:21, fontWeight:800, color:C.azul, letterSpacing:-0.3, margin:"0 0 6px" }}>Escolha o trabalho</h1>
            <p style={{ fontSize:14, color:C.cinza, lineHeight:1.5, margin:"0 0 16px" }}>Você tem mais de um trabalho. Selecione a qual deseja anexar material.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {trabalhos.map((t) => (
                <button key={t.id} onClick={() => { setSel(t); setArq({ podcast:null, flashcards:null }); setQuizQuestoes(null); setDeclaracao(false); setFase("form"); }}
                  style={{ ...card, padding:16, display:"flex", gap:12, alignItems:"center", textAlign:"left", cursor:"pointer", width:"100%" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:C.tinta, lineHeight:1.3 }}>{t.titulo || t.id}</div>
                    {t.autor && <div style={{ fontSize:13, color:C.cinza, marginTop:4 }}>{t.autor}</div>}
                    {t.material && <div style={{ fontSize:12, color:C.ok, marginTop:6, display:"inline-flex", alignItems:"center", gap:4 }}><Check size={12} color={C.ok} /> já tem material</div>}
                  </div>
                  <ChevronRight size={18} color={C.ciano} />
                </button>
              ))}
            </div>
          </>
        )}

        {/* ---------- FORMULÁRIO ---------- */}
        {fase === "form" && sel && (
          <>
            {trabalhos.length > 1 && (
              <button onClick={() => { setSel(null); setFase("lista"); }} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"transparent", border:"none", color:C.azul, fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:12 }}>
                <MIco size={15} color={C.azul}><path d="m15 18-6-6 6-6"/></MIco> Trocar de trabalho
              </button>
            )}

            {/* trabalho selecionado (somente leitura) */}
            <div style={{ ...card, marginBottom:16 }}>
              <div style={{ fontSize:11, letterSpacing:1.4, fontWeight:800, color:C.ciano, textTransform:"uppercase", marginBottom:8 }}>Seu trabalho</div>
              <div style={{ fontSize:18, fontWeight:800, color:C.tinta, lineHeight:1.3 }}>{sel.titulo || "—"}</div>
              {sel.autor && <div style={{ fontSize:14, color:C.cinza, marginTop:6 }}>{sel.autor}</div>}
              {sel.material && (
                <div style={{ marginTop:14, background:C.cianoClaro, border:`1px solid ${C.ciano}44`, borderRadius:10, padding:"10px 13px", fontSize:13, color:C.azulEsc, display:"flex", gap:8, alignItems:"center" }}>
                  <CheckCircle2 size={16} color={C.ciano} /><span>Você já anexou material a este trabalho. Enviar novamente <strong>substitui</strong> o anterior.</span>
                </div>
              )}
            </div>

            <h2 style={{ fontSize:20, fontWeight:800, color:C.azul, letterSpacing:-0.3, margin:"0 0 6px" }}>Adicionar material</h2>
            <p style={{ fontSize:14.5, color:C.cinza, lineHeight:1.55, margin:"0 0 18px" }}>Anexe o que tiver — cada item é opcional, e você pode voltar depois para incluir o restante.</p>

            <LinhaUpload ico={Headphones} titulo="Podcast" descricao="áudio (.mp3 ou .m4a)"
              accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,.mp3,.m4a,.mp4,.aac" arquivo={arq.podcast} jaTem={sel.material && !!sel.material.audioUrl}
              onPick={(f) => setArq((a) => ({ ...a, podcast:f }))} onClear={() => setArq((a) => ({ ...a, podcast:null }))} />
            <QuizEntrada key={sel.id} idToken={auth && auth.idToken} questoes={quizQuestoes} setQuestoes={setQuizQuestoes}
              jaTem={sel.material && Array.isArray(sel.material.quiz) && sel.material.quiz.length > 0} />
            <LinhaUpload ico={Layers} titulo="Flashcards" descricao="arquivo .csv"
              accept="text/csv,.csv" arquivo={arq.flashcards} jaTem={sel.material && !!sel.material.flashcardsText}
              onPick={(f) => setArq((a) => ({ ...a, flashcards:f }))} onClear={() => setArq((a) => ({ ...a, flashcards:null }))} />

            {algumGrande && (
              <div style={{ background:"#FBEAE8", border:"1px solid #E8C5C0", borderRadius:10, padding:"10px 13px", margin:"4px 0 14px", fontSize:13, color:"#7A2616", display:"flex", gap:8, alignItems:"center" }}>
                <AlertCircle size={15} color={C.erro} /> Algum arquivo passa de {MAX_MB} MB. Reduza antes de enviar.
              </div>
            )}

            {/* declaração obrigatória */}
            <label style={{ display:"flex", gap:11, alignItems:"flex-start", cursor:"pointer", border:`1px solid ${declaracao ? C.ciano : "#E3EAF2"}`, borderRadius:12, padding:14, background: declaracao ? C.cianoClaro : "#fff", margin:"6px 0 16px" }}>
              <input type="checkbox" checked={declaracao} onChange={(e) => setDeclaracao(e.target.checked)} style={{ width:18, height:18, marginTop:1, flexShrink:0, accentColor:C.azul, cursor:"pointer" }} />
              <span style={{ fontSize:13.5, lineHeight:1.55, color:C.tinta }}>Confirmo que revisei o material gerado com IA e que ele representa fielmente o meu trabalho, sem conteúdo inventado.</span>
            </label>

            <button onClick={enviar} disabled={!podeEnviar} style={{ width:"100%", background: podeEnviar ? C.azul : C.cinza, color:"#fff", border:"none", borderRadius:11, padding:"13px", fontSize:14.5, fontWeight:700, cursor: podeEnviar ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Upload size={17} color="#fff" /> Enviar material
            </button>
            {!temAlgum && <div style={{ fontSize:12.5, color:C.cinza, textAlign:"center", marginTop:9 }}>Anexe pelo menos um arquivo para enviar.</div>}
          </>
        )}
      </div>

      {/* overlay de envio / resultado */}
      {envio && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, zIndex:50 }}
          onClick={() => { if (envio.estado !== "enviando") setEnvio(null); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:420, textAlign:"center" }}>
            {envio.estado === "enviando" && (<>
              <div style={{ width:56, height:56, borderRadius:"50%", background:C.cianoClaro, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><Loader2 size={28} color={C.ciano} className="girando" /></div>
              <div style={{ fontWeight:800, fontSize:17, marginBottom:6 }}>Enviando material…</div>
              <div style={{ fontSize:13, color:C.cinza, lineHeight:1.5 }}>Isso pode levar alguns segundos. Não feche esta janela.</div>
            </>)}
            {envio.estado === "sucesso" && (<>
              <div style={{ width:56, height:56, borderRadius:"50%", background:`${C.ok}1A`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><CheckCircle2 size={32} color={C.ok} /></div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Material anexado!</div>
              <div style={{ fontSize:14, color:C.cinza, lineHeight:1.5 }}>O material foi anexado ao seu trabalho. Você pode fechar esta página ou voltar depois para incluir mais.</div>
              <button onClick={() => { setEnvio(null); setArq({ podcast:null, flashcards:null }); setQuizQuestoes(null); setDeclaracao(false); if (auth) buscarTrabalhos(auth.idToken, sel && sel.id); }} style={{ background:C.azul, color:"#fff", border:"none", borderRadius:10, padding:"11px 22px", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:16 }}>Concluir</button>
            </>)}
            {envio.estado === "erro" && (<>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"#FBEAE8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><X size={30} color={C.erro} /></div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Não foi possível enviar</div>
              <div style={{ fontSize:13.5, color:C.cinza, lineHeight:1.5 }}>{envio.msg}</div>
              <button onClick={() => setEnvio(null)} style={{ background:C.azul, color:"#fff", border:"none", borderRadius:10, padding:"11px 22px", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:16 }}>Fechar</button>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MaterialApp />);
