/**
 * ExcelUpload.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Self-contained Excel multi-file upload component.
 *
 * Features
 *   • Drag-and-drop + click-to-browse
 *   • .xlsx / .xls only, max 10 MB / file, max 10 files
 *   • Duplicate prevention
 *   • Per-file progress bar placeholder
 *   • Sheet-name preview via xlsx package
 *   • Success / error toast notifications
 *   • Mocked API upload — swap uploadFiles() for a real fetch/axios call
 *
 * ── HOW TO CONNECT A REAL BACKEND ────────────────────────────────────────
 * Open  src/api/fileApi.js  and replace the body of  uploadFiles()  with:
 *
 *   const form = new FormData();
 *   files.forEach(f => form.append('files', f));
 *   const res = await fetch('/api/files/upload', { method: 'POST', body: form });
 *   if (!res.ok) return { data: null, error: 'Server error' };
 *   return { data: await res.json(), error: null };
 *
 * No changes needed in this component.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

// Sub-components
import DropZone from './DropZone';
import FileCard from './FileCard';
import { ToastContainer, useToasts } from './Toast';

// API layer (swap internals for real endpoints — interface stays the same)
import { clearAllFiles, deleteFile, getFiles, uploadFiles } from '../../api/fileApi';

// Utilities
import {
  MAX_FILES,
  applyFileLimit,
  validateFiles,
} from '../../utils/fileUtils';

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export default function ExcelUpload() {
  /**
   * Each entry in `files`:
   * {
   *   id         : string          – unique key
   *   file       : File            – original File object (null after upload)
   *   name       : string
   *   size       : number
   *   status     : 'staged' | 'uploading' | 'done' | 'error'
   *   progress   : number          – 0-100 (UI placeholder)
   *   sheetNames : string[]        – populated by xlsx parsing
   *   uploadedAt : string | null   – ISO string set after upload
   * }
   */
  const [files, setFiles] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [uploading, setUploading] = useState(false);          // any upload in flight
  const progressTimers = useRef({});                          // fake-progress interval refs

  const { toasts, addToast, removeToast } = useToasts();

  /* ── Load previously uploaded files on mount ────────────────────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await getFiles();
      if (error) {
        addToast(error, 'error');
      } else {
        // Rehydrate as 'done' records (no File object needed)
        setFiles(data.map(rec => ({
          id: rec.id,
          file: null,
          name: rec.name,
          size: rec.size,
          status: 'done',
          progress: 100,
          sheetNames: [],
          uploadedAt: rec.uploadedAt,
        })));
      }
      setLoadingInitial(false);
    })();
    // Clear any lingering timers on unmount
    return () => Object.values(progressTimers.current).forEach(clearInterval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Parse sheet names in the background via xlsx ───────────────────── */
  function parseSheetNames(id, file) {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        setFiles(prev =>
          prev.map(f => f.id === id ? { ...f, sheetNames: wb.SheetNames } : f)
        );
      } catch { /* silently ignore parse errors */ }
    };
    reader.readAsArrayBuffer(file);
  }

  /* ── Handle new files from DropZone ─────────────────────────────────── */
  function handleNewFiles(incoming) {
    const stagedAndDone = files.map(f => ({ name: f.name }));
    const { valid, rejected } = validateFiles(incoming, stagedAndDone);

    // Notify about rejected files
    rejected.forEach(({ file, reason }) =>
      addToast(`"${file.name}" skipped — ${reason}`, 'warning', 5000)
    );

    if (!valid.length) return;

    // Enforce total file limit
    const currentCount = files.length;
    const { allowed, overflow } = applyFileLimit(valid, currentCount);
    if (overflow > 0) {
      addToast(
        `Only ${MAX_FILES} files allowed. ${overflow} file${overflow !== 1 ? 's' : ''} ignored.`,
        'warning'
      );
    }

    if (!allowed.length) return;

    // Stage accepted files
    const newEntries = allowed.map(file => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      parseSheetNames(id, file);      // async — updates sheetNames when ready
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        status: 'staged',
        progress: 0,
        sheetNames: [],
        uploadedAt: null,
      };
    });

    setFiles(prev => [...prev, ...newEntries]);
  }

  /* ── Fake upload progress ticker ─────────────────────────────────────── */
  function startFakeProgress(id) {
    progressTimers.current[id] = setInterval(() => {
      setFiles(prev =>
        prev.map(f => {
          if (f.id !== id || f.progress >= 90) return f;
          return { ...f, progress: Math.min(f.progress + Math.random() * 15, 90) };
        })
      );
    }, 200);
  }

  function stopFakeProgress(id) {
    clearInterval(progressTimers.current[id]);
    delete progressTimers.current[id];
  }

  /* ── Upload all staged files ─────────────────────────────────────────── */
  async function handleUpload() {
    const staged = files.filter(f => f.status === 'staged');
    if (!staged.length) return;

    setUploading(true);

    // Mark all staged as 'uploading' and start fake progress
    setFiles(prev =>
      prev.map(f =>
        f.status === 'staged' ? { ...f, status: 'uploading', progress: 0 } : f
      )
    );
    staged.forEach(f => startFakeProgress(f.id));

    // ── API CALL ──────────────────────────────────────────────────────────
    // To connect a real backend: replace uploadFiles() in src/api/fileApi.js
    const { data, error } = await uploadFiles(staged.map(f => f.file));
    // ─────────────────────────────────────────────────────────────────────

    staged.forEach(f => stopFakeProgress(f.id));

    if (error) {
      // Mark all as failed
      setFiles(prev =>
        prev.map(f =>
          f.status === 'uploading' ? { ...f, status: 'error', progress: 0 } : f
        )
      );
      addToast(error, 'error');
    } else {
      // Merge server records back (they now have a server-assigned id & uploadedAt)
      const serverMap = Object.fromEntries(data.map(r => [r.name, r]));
      setFiles(prev =>
        prev.map(f => {
          if (f.status !== 'uploading') return f;
          const rec = serverMap[f.name];
          return rec
            ? { ...f, id: rec.id, status: 'done', progress: 100, uploadedAt: rec.uploadedAt }
            : { ...f, status: 'error', progress: 0 };
        })
      );
      addToast(
        `${data.length} file${data.length !== 1 ? 's' : ''} uploaded successfully!`,
        'success'
      );
    }

    setUploading(false);
  }

  /* ── Remove a single file ────────────────────────────────────────────── */
  async function handleRemove(id) {
    const entry = files.find(f => f.id === id);
    if (!entry) return;

    if (entry.status === 'done') {
      // ── API CALL ────────────────────────────────────────────────────────
      const { error } = await deleteFile(id);
      if (error) { addToast(error, 'error'); return; }
    }

    setFiles(prev => prev.filter(f => f.id !== id));
  }

  /* ── Clear everything ────────────────────────────────────────────────── */
  async function handleClearAll() {
    // ── API CALL ──────────────────────────────────────────────────────────
    const { error } = await clearAllFiles();
    if (error) { addToast(error, 'error'); return; }
    setFiles([]);
    addToast('All files cleared.', 'info');
  }

  /* ── Derived counts ──────────────────────────────────────────────────── */
  const stagedCount   = files.filter(f => f.status === 'staged').length;
  const uploadedCount = files.filter(f => f.status === 'done').length;

  /* ═══════════════════════════════════════════════════════════════════════
     Render
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

        {/* ── Drop zone ── */}
        <DropZone
          onFiles={handleNewFiles}
          disabled={uploading}
          currentCount={files.length}
        />

        {/* ── Action bar ── */}
        {files.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'10px' }}>

            {/* Upload button */}
            {stagedCount > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  display:'flex', alignItems:'center', gap:'8px',
                  height:'40px', padding:'0 20px', borderRadius:'10px',
                  border:'none', cursor: uploading ? 'not-allowed' : 'pointer',
                  background: uploading
                    ? '#93c5fd'
                    : 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                  color:'#fff', fontWeight:700, fontSize:'14px',
                  boxShadow: uploading ? 'none' : '0 2px 10px rgba(37,99,235,0.4)',
                  transition:'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; }}
              >
                {uploading ? (
                  <>
                    <span style={{
                      display:'inline-block', width:'16px', height:'16px',
                      border:'2.5px solid rgba(255,255,255,0.4)',
                      borderTopColor:'#fff', borderRadius:'50%',
                      animation:'spin 0.7s linear infinite', flexShrink:0,
                    }}/>
                    Uploading…
                  </>
                ) : (
                  <>⬆ Upload {stagedCount} file{stagedCount !== 1 ? 's' : ''}</>
                )}
              </button>
            )}

            {/* Discard staged */}
            {stagedCount > 0 && !uploading && (
              <button
                onClick={() => setFiles(prev => prev.filter(f => f.status !== 'staged'))}
                style={{
                  height:'40px', padding:'0 16px', borderRadius:'10px',
                  border:'1.5px solid #e2e8f0', background:'#fff',
                  color:'#64748b', fontWeight:600, fontSize:'13px',
                  cursor:'pointer', transition:'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff'; }}
              >
                Discard Selection
              </button>
            )}

            {/* Clear all */}
            {uploadedCount > 0 && !uploading && stagedCount === 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  height:'40px', padding:'0 16px', borderRadius:'10px',
                  border:'1.5px solid #fecaca', background:'#fff1f2',
                  color:'#dc2626', fontWeight:600, fontSize:'13px',
                  cursor:'pointer', transition:'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='#fee2e2'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff1f2'; }}
              >
                🗑 Clear All
              </button>
            )}

            {/* Count summary */}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px' }}>
              {uploadedCount > 0 && (
                <span style={{
                  background:'#f0fdf4', border:'1px solid #bbf7d0',
                  color:'#15803d', fontSize:'12px', fontWeight:700,
                  borderRadius:'20px', padding:'4px 12px',
                }}>
                  ✓ {uploadedCount} uploaded
                </span>
              )}
              {stagedCount > 0 && (
                <span style={{
                  background:'#fffbeb', border:'1px solid #fde68a',
                  color:'#b45309', fontSize:'12px', fontWeight:700,
                  borderRadius:'20px', padding:'4px 12px',
                }}>
                  ⏸ {stagedCount} ready
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── File list ── */}
        <section>

          {/* Section header */}
          {files.length > 0 && (
            <div style={{
              display:'flex', alignItems:'center', gap:'10px',
              marginBottom:'12px', paddingBottom:'10px',
              borderBottom:'1px solid #f1f5f9',
            }}>
              <h3 style={{ color:'#334155', fontSize:'13px', fontWeight:700, letterSpacing:'0.3px' }}>
                FILES
              </h3>
              {uploadedCount > 0 && (
                <span style={{
                  background:'#eff6ff', color:'#2563eb',
                  fontSize:'11px', fontWeight:700,
                  borderRadius:'20px', padding:'2px 9px',
                  border:'1px solid #bfdbfe',
                }}>
                  {uploadedCount}
                </span>
              )}
            </div>
          )}

          {loadingInitial ? (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              gap:'10px', padding:'48px 0', color:'#94a3b8',
            }}>
              <span style={{
                display:'inline-block', width:'20px', height:'20px',
                border:'2.5px solid #e2e8f0', borderTopColor:'#2563eb',
                borderRadius:'50%', animation:'spin 0.7s linear infinite',
              }}/>
              <span style={{ fontSize:'14px' }}>Loading your files…</span>
            </div>
          ) : files.length === 0 ? (
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:'10px',
              border:'2px dashed #e2e8f0', borderRadius:'14px',
              padding:'48px 24px', textAlign:'center',
              background:'#fafafa',
            }}>
              <div style={{
                width:'60px', height:'60px', borderRadius:'16px',
                background:'linear-gradient(135deg,#eff6ff,#dbeafe)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'28px', marginBottom:'4px',
              }}>
                📂
              </div>
              <p style={{ color:'#334155', fontWeight:700, fontSize:'15px' }}>No files yet</p>
              <p style={{ color:'#94a3b8', fontSize:'13px', lineHeight:1.5 }}>
                Drop your Excel files above or click to browse
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'360px', overflowY:'auto', paddingRight:'2px' }}>
              {files.map(f => (
                <FileCard
                  key={f.id}
                  file={f}
                  onRemove={() => handleRemove(f.id)}
                  uploading={uploading}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
