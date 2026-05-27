/**
 * Toast.jsx
 * Lightweight toast notification system.
 *
 * Usage:
 *   const { toasts, addToast } = useToasts();
 *   addToast('Upload complete!', 'success');
 *   <ToastContainer toasts={toasts} onDismiss={removeToast} />
 */
import { useCallback, useReducer } from 'react';

/* ── Reducer ─────────────────────────────────────────────────────────────── */
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

/* ── Hook ────────────────────────────────────────────────────────────────── */
export function useToasts() {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({ type: 'ADD', toast: { id, message, type } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  return { toasts, addToast, removeToast };
}

/* ── Styles per type ─────────────────────────────────────────────────────── */
const TOAST_STYLES = {
  success: { accent:'#22c55e',  icon:'✓', bg:'rgba(240,253,244,0.95)',  border:'#bbf7d0', text:'#15803d' },
  error:   { accent:'#ef4444',  icon:'✕', bg:'rgba(255,241,242,0.95)',  border:'#fecaca', text:'#dc2626' },
  warning: { accent:'#f59e0b',  icon:'⚠', bg:'rgba(255,251,235,0.95)',  border:'#fde68a', text:'#b45309' },
  info:    { accent:'#3b82f6',  icon:'ℹ', bg:'rgba(239,246,255,0.95)',  border:'#bfdbfe', text:'#1d4ed8' },
};

/* ── Individual Toast ────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }) {
  const s = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:'10px',
      background:s.bg, border:`1px solid ${s.border}`,
      borderRadius:'14px', padding:'12px 14px',
      boxShadow:'0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
      position:'relative', overflow:'hidden',
      animation:'slideToast 0.3s cubic-bezier(0.4,0,0.2,1) both',
    }}>
      {/* Accent bar */}
      <div style={{
        position:'absolute', left:0, top:0, bottom:0, width:'4px',
        background:s.accent, borderRadius:'14px 0 0 14px',
      }}/>

      {/* Icon */}
      <span style={{
        width:'24px', height:'24px', borderRadius:'8px', flexShrink:0,
        background:s.accent, color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'12px', fontWeight:800, marginLeft:'6px',
      }}>
        {s.icon}
      </span>

      {/* Message */}
      <p style={{
        flex:1, color:s.text, fontSize:'13px', fontWeight:600,
        lineHeight:1.5, paddingTop:'1px',
      }}>
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          flexShrink:0, width:'20px', height:'20px', borderRadius:'6px',
          border:'none', background:'transparent', cursor:'pointer',
          color:s.text, opacity:0.5, fontSize:'13px', fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity='1'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity='0.5'; }}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Container ───────────────────────────────────────────────────────────── */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <>
      <style>{`
        @keyframes slideToast {
          from { opacity:0; transform:translateX(20px) scale(0.96); }
          to   { opacity:1; transform:translateX(0)    scale(1);    }
        }
      `}</style>
      <div style={{
        position:'fixed', bottom:'24px', right:'24px',
        zIndex:9999, display:'flex', flexDirection:'column', gap:'8px',
        width:'320px',
      }}>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}
