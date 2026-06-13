/* ============================================================
   XI SAM 2026 — EDITOR DE LAYOUT DO PÔSTER (v2)
   PosterEditor: wraps PosterCompletoLandscape com EditCtx ativo,
   expõe handles nas figuras (redimensionar, alternar lado, auto).
   Dependências (carregadas antes via script tags):
     lib.jsx → window.QRCode, window.useScale …
     posters.jsx → window.PosterCompletoLandscape, window.EditCtx
   Exporta: window.PosterEditor
   ============================================================ */
const { useState } = React;

/* Referências às exportações de posters.jsx */
const PosterCtxProvider = window.EditCtx ? window.EditCtx.Provider : React.Fragment;
const PosterLandscape   = window.PosterCompletoLandscape;

function PosterEditor({ t, initialAjustes, onSave, onCancel }) {
  const [ajustes, setAjustes] = useState(initialAjustes || {});
  const hasAjustes = Object.keys(ajustes).length > 0;

  const setAjuste = (figKey, value) => {
    setAjustes(prev => ({ ...prev, [figKey]: { ...(prev[figKey] || {}), ...value } }));
  };
  const resetAjuste = (figKey) => {
    setAjustes(prev => { const n = { ...prev }; delete n[figKey]; return n; });
  };
  const resetAll = () => setAjustes({});

  const ghostBtn = {
    border: '1px solid rgba(255,255,255,0.28)', background: 'transparent',
    color: 'rgba(255,255,255,0.82)', borderRadius: 8, padding: '6px 12px',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  };
  const saveBtn = {
    border: 'none', background: '#00ADEF', color: '#fff',
    borderRadius: 8, padding: '7px 16px', fontSize: 13,
    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  };

  const ctxValue = { mode: true, ajustes, setAjuste, resetAjuste };

  if (!PosterLandscape || !window.EditCtx) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'rgba(255,255,255,0.5)', fontSize:14 }}>
        Componente do pôster não encontrado — verifique a ordem de carregamento dos scripts.
      </div>
    );
  }

  return (
    <PosterCtxProvider value={ctxValue}>
      <div style={{ width: '100%', height: '100%' }}>
        <PosterLandscape t={t} />
      </div>
      {/* Toolbar flutuante acima do overlay */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        justifyContent: 'center', background: 'rgba(8,19,30,0.93)',
        borderRadius: 999, padding: '9px 16px', zIndex: 200,
        boxShadow: '0 4px 28px rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        maxWidth: 'calc(100vw - 40px)',
      }}>
        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
          ✥ arraste para qualquer ponto · ⇄ esq/centro/dir · ◀▶ largura · ⟳ auto
        </span>
        {hasAjustes && <button onClick={resetAll} style={ghostBtn}>Resetar tudo</button>}
        {onCancel && <button onClick={onCancel} style={ghostBtn}>Cancelar</button>}
        <button onClick={() => onSave && onSave(ajustes)} style={saveBtn}>✓ Salvar ajustes</button>
      </div>
    </PosterCtxProvider>
  );
}

Object.assign(window, { PosterEditor });
