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
  success: { bar: 'bg-green-500',  icon: '✓', wrapper: 'border-green-200 bg-green-50 text-green-800' },
  error:   { bar: 'bg-red-500',    icon: '✕', wrapper: 'border-red-200 bg-red-50 text-red-800' },
  warning: { bar: 'bg-yellow-400', icon: '⚠', wrapper: 'border-yellow-200 bg-yellow-50 text-yellow-800' },
  info:    { bar: 'bg-blue-500',   icon: 'ℹ', wrapper: 'border-blue-200 bg-blue-50 text-blue-800' },
};

/* ── Individual Toast ────────────────────────────────────────────────────── */
function Toast({ toast, onDismiss }) {
  const s = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info;
  return (
    <div className={`relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-md ${s.wrapper}`}>
      {/* Coloured left bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} />

      {/* Icon */}
      <span className="mt-0.5 shrink-0 font-bold">{s.icon}</span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-0.5 opacity-50 hover:opacity-100 transition-opacity"
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
