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
      <div className="flex flex-col gap-6">

        {/* ── Drop zone ── */}
        <DropZone
          onFiles={handleNewFiles}
          disabled={uploading}
          currentCount={files.length}
        />

        {/* ── Action bar ── */}
        {files.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">

            {/* Upload button */}
            {stagedCount > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={[
                  'flex items-center gap-2 rounded-xl px-5 py-2.5',
                  'text-sm font-bold text-white shadow-sm transition-all',
                  uploading
                    ? 'cursor-not-allowed bg-blue-300'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95',
                ].join(' ')}
              >
                {uploading ? (
                  <>
                    {/* Simple CSS spinner */}
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading…
                  </>
                ) : (
                  <>⬆️ Upload {stagedCount} file{stagedCount !== 1 ? 's' : ''}</>
                )}
              </button>
            )}

            {/* Discard staged */}
            {stagedCount > 0 && !uploading && (
              <button
                onClick={() => setFiles(prev => prev.filter(f => f.status !== 'staged'))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Discard Selection
              </button>
            )}

            {/* Clear all */}
            {uploadedCount > 0 && !uploading && stagedCount === 0 && (
              <button
                onClick={handleClearAll}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                🗑 Clear All
              </button>
            )}

            {/* Count summary */}
            <span className="ml-auto text-sm text-gray-400">
              {uploadedCount > 0 && `${uploadedCount} uploaded`}
              {uploadedCount > 0 && stagedCount > 0 && ' · '}
              {stagedCount > 0 && `${stagedCount} selected`}
            </span>
          </div>
        )}

        {/* ── File list ── */}
        <section>
          <h3 className="mb-3 text-sm font-bold text-gray-700">
            Uploaded Files
            {uploadedCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                {uploadedCount}
              </span>
            )}
          </h3>

          {loadingInitial ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
              Loading…
            </div>
          ) : files.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
              <span className="text-5xl">📂</span>
              <p className="font-semibold text-gray-500">No files yet</p>
              <p className="text-sm text-gray-400">Drop Excel files above or click to browse</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
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

      {/* Toast notifications — rendered in a portal-like fixed position */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
