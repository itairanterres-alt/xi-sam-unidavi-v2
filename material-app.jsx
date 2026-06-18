/* ============================================================
   XI SAM 2026 — ADICIONAR MATERIAL (página /material?t=TOKEN)
   O aluno anexa podcast (.mp3), quiz (.txt) e/ou flashcards (.csv)
   a uma submissão JÁ FEITA, sem ressubmeter o resumo.
   · GET  ?tipo=material&token=...  → { titulo, autor, material|null }
   · POST tipo:"material" (base64) → grava no Drive, retorna { ok:true }
   POST em text/plain;charset=utf-8 (evita preflight CORS).
   Página autossuficiente (sem imports de módulo).
   ============================================================ */
const { useState, useEffect, useMemo, useRef } = React;

// URL do "App da Web" do Apps Script (implantação ativa) — NÃO alterar.
const API_URL = "https://script.google.com/macros/s/AKfycbw8GrSUw3Ck8Pt4qolDD44xy_4Y0vXv9KaUfEUZKFUk7qKUWyE8kJRpTqSX9AtdNRCrOg/exec";

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

/* ---------- helpers ---------- */
function getToken() {
  try {
    const t = new URLSearchParams(window.location.search).get("t");
    if (t) return t;
    // tolera o token no hash (#?t=... ou #/material?t=...) em hospedagens sem clean-URL
    const h = window.location.hash || "";
    const i = h.indexOf("?");
    if (i >= 0) return new URLSearchParams(h.slice(i + 1)).get("t");
  } catch (e) {}
  return null;
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
/* POST com progresso de upload (XHR; text/plain evita preflight CORS) */
function postMaterial(payload, onProgress) {
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
const MAX_MB = 20;

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

/* ============================ APP ============================ */
function MaterialApp() {
  const token = useMemo(getToken, []);
  const [estado, setEstado] = useState(token ? "carregando" : "semToken"); // semToken | carregando | erro | pronto
  const [erroMsg, setErroMsg] = useState("");
  const [trabalho, setTrabalho] = useState(null);     // { titulo, autor, material }
  const [arq, setArq] = useState({ podcast:null, quiz:null, flashcards:null });
  const [declaracao, setDeclaracao] = useState(false);
  const [envio, setEnvio] = useState(null);           // null | {estado:"enviando",progresso} | {estado:"sucesso"} | {estado:"erro",msg}

  const carregar = async () => {
    setEstado("carregando"); setErroMsg("");
    try {
      const r = await fetch(`${API_URL}?tipo=material&token=${encodeURIComponent(token)}`);
      const res = await r.json();
      if (!res || res.ok === false || res.erro) throw new Error((res && res.erro) || "Link inválido. Confira se o endereço do e-mail está completo.");
      setTrabalho({ titulo: res.titulo || "", autor: res.autor || "", material: res.material || null });
      setEstado("pronto");
    } catch (e) {
      setErroMsg(String(e && e.message || e));
      setEstado("erro");
    }
  };
  useEffect(() => { if (token) carregar(); }, []);

  const temAlgum = !!(arq.podcast || arq.quiz || arq.flashcards);
  const algumGrande = [arq.podcast, arq.quiz, arq.flashcards].some((f) => f && f.size > MAX_MB * 1024 * 1024);
  const podeEnviar = declaracao && temAlgum && !algumGrande;

  const enviar = async () => {
    if (!podeEnviar) return;
    setEnvio({ estado:"enviando", progresso:0 });
    try {
      const payload = { tipo:"material", token, declaracao:true, podcast:null, quiz:null, flashcards:null };
      if (arq.podcast)    payload.podcast    = { nome: arq.podcast.name,    base64: await readBase64(arq.podcast) };
      if (arq.quiz)       payload.quiz       = { nome: arq.quiz.name,       base64: await readBase64(arq.quiz) };
      if (arq.flashcards) payload.flashcards = { nome: arq.flashcards.name, base64: await readBase64(arq.flashcards) };
      const res = await postMaterial(payload, (p) => setEnvio({ estado:"enviando", progresso:p }));
      if (res && res.ok) setEnvio({ estado:"sucesso" });
      else setEnvio({ estado:"erro", msg: (res && res.erro) || "Não foi possível anexar o material." });
    } catch (e) {
      setEnvio({ estado:"erro", msg: String(e && e.message || e) });
    }
  };

  const Cabecalho = () => (
    <header style={{ background:C.azulEsc }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"9px 16px" }}>
        <div style={{ height:42, backgroundImage:`url(${(window.__resources && window.__resources.logoStrip) || "assets/logo-strip.jpeg"})`, backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"center" }} role="img" aria-label="Medicina UNIDAVI · NPCMed · SAM 2026" />
      </div>
    </header>
  );
  const card = { background:"#fff", border:"1px solid #E3EAF2", borderRadius:16, padding:"22px 22px 24px", boxShadow:"0 8px 30px rgba(2,40,90,0.06)" };

  return (
    <div style={{ minHeight:"100vh", background:C.papel, color:C.tinta }}>
      <Cabecalho />
      <div style={{ maxWidth:680, margin:"0 auto", padding:"22px 16px 60px" }}>

        {estado === "semToken" && (
          <div style={card}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", color:C.tinta }}>
              <AlertCircle size={20} color={C.erro} style={{ marginTop:2, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>Link sem identificação</div>
                <div style={{ fontSize:14, lineHeight:1.55, color:C.cinza }}>Acesse esta página pelo <strong>link pessoal</strong> enviado por e-mail após a sua submissão — ele inclui o seu código de acesso.</div>
              </div>
            </div>
          </div>
        )}

        {estado === "carregando" && (
          <div style={{ ...card, display:"flex", alignItems:"center", gap:10, color:C.azulEsc }}>
            <Loader2 size={18} color={C.ciano} className="girando" /> Carregando o seu trabalho…
          </div>
        )}

        {estado === "erro" && (
          <div style={card}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <AlertCircle size={20} color={C.erro} style={{ marginTop:2, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>Não foi possível abrir</div>
                <div style={{ fontSize:14, lineHeight:1.55, color:C.cinza }}>{erroMsg}</div>
                <button onClick={carregar} style={{ marginTop:12, border:"1px solid #E3EAF2", background:"#fff", color:C.azul, borderRadius:9, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Tentar de novo</button>
              </div>
            </div>
          </div>
        )}

        {estado === "pronto" && trabalho && (
          <>
            {/* confirmação do trabalho (somente leitura) */}
            <div style={{ ...card, marginBottom:16 }}>
              <div style={{ fontSize:11, letterSpacing:1.4, fontWeight:800, color:C.ciano, textTransform:"uppercase", marginBottom:8 }}>Seu trabalho</div>
              <div style={{ fontSize:18, fontWeight:800, color:C.tinta, lineHeight:1.3 }}>{trabalho.titulo || "—"}</div>
              {trabalho.autor && <div style={{ fontSize:14, color:C.cinza, marginTop:6 }}>{trabalho.autor}</div>}
              {trabalho.material && (
                <div style={{ marginTop:14, background:C.cianoClaro, border:`1px solid ${C.ciano}44`, borderRadius:10, padding:"10px 13px", fontSize:13, color:C.azulEsc, display:"flex", gap:8, alignItems:"center" }}>
                  <CheckCircle2 size={16} color={C.ciano} /><span>Você já anexou material a este trabalho. Enviar novamente <strong>substitui</strong> o anterior.</span>
                </div>
              )}
            </div>

            <h1 style={{ fontSize:22, fontWeight:800, color:C.azul, letterSpacing:-0.3, margin:"0 0 6px" }}>Adicionar material</h1>
            <p style={{ fontSize:14.5, color:C.cinza, lineHeight:1.55, margin:"0 0 18px" }}>Anexe o que tiver — cada item é opcional, e você pode voltar depois para incluir o restante.</p>

            <LinhaUpload ico={Headphones} titulo="Podcast" descricao="arquivo .mp3"
              accept="audio/mpeg,.mp3" arquivo={arq.podcast} jaTem={trabalho.material && !!trabalho.material.audioUrl}
              onPick={(f) => setArq((a) => ({ ...a, podcast:f }))} onClear={() => setArq((a) => ({ ...a, podcast:null }))} />
            <LinhaUpload ico={ListChecks} titulo="Quiz" descricao="arquivo .txt"
              accept="text/plain,.txt" arquivo={arq.quiz} jaTem={trabalho.material && !!trabalho.material.quizText}
              onPick={(f) => setArq((a) => ({ ...a, quiz:f }))} onClear={() => setArq((a) => ({ ...a, quiz:null }))} />
            <LinhaUpload ico={Layers} titulo="Flashcards" descricao="arquivo .csv"
              accept="text/csv,.csv" arquivo={arq.flashcards} jaTem={trabalho.material && !!trabalho.material.flashcardsText}
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
              <div style={{ fontWeight:800, fontSize:17, marginBottom:12 }}>Enviando material…</div>
              <div style={{ height:10, borderRadius:999, background:C.cinzaClaro, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.round((envio.progresso || 0) * 100)}%`, background:C.ciano, borderRadius:999, transition:"width .2s ease" }} />
              </div>
              <div style={{ fontSize:12.5, color:C.cinza, marginTop:8 }}>{Math.round((envio.progresso || 0) * 100)}%</div>
            </>)}
            {envio.estado === "sucesso" && (<>
              <div style={{ width:56, height:56, borderRadius:"50%", background:`${C.ok}1A`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><CheckCircle2 size={32} color={C.ok} /></div>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:8 }}>Material anexado!</div>
              <div style={{ fontSize:14, color:C.cinza, lineHeight:1.5 }}>O material foi anexado ao seu trabalho. Você pode fechar esta página ou voltar depois para incluir mais.</div>
              <button onClick={() => { setEnvio(null); setArq({ podcast:null, quiz:null, flashcards:null }); setDeclaracao(false); carregar(); }} style={{ background:C.azul, color:"#fff", border:"none", borderRadius:10, padding:"11px 22px", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:16 }}>Concluir</button>
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
