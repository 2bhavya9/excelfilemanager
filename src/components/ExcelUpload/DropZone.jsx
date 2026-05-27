/**
 * DropZone.jsx
 * Animated drag-and-drop upload area.
 * Accepts clicks (forwarded to a hidden <input>) or file drops.
 * Completely presentation-only — all logic lives in the parent.
 */
import { useRef, useState } from 'react';
import { MAX_FILES, MAX_FILE_SIZE_MB } from '../../utils/fileUtils';

export default function DropZone({ onFiles, disabled, currentCount }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  /* ── Drag events ─────────────────────────────────────────────────────── */
  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDragLeave(e) {
    // Only clear when leaving the zone itself, not a child element
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    onFiles(files);
  }

  /* ── Click to browse ─────────────────────────────────────────────────── */
  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleInputChange(e) {
    const files = Array.from(e.target.files);
    e.target.value = ''; // reset so the same file can be re-selected later
    onFiles(files);
  }

  const atLimit = currentCount >= MAX_FILES;

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'relative flex flex-col items-center justify-center gap-3',
        'rounded-2xl border-2 border-dashed px-8 py-12',
        'transition-all duration-200 select-none',
        disabled || atLimit
          ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
          : dragging
          ? 'cursor-copy border-blue-400 bg-blue-50 scale-[1.01]'
          : 'cursor-pointer border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40',
      ].join(' ')}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || atLimit}
      />

      {/* Excel icon */}
      <div className={[
        'flex h-16 w-16 items-center justify-center rounded-2xl text-3xl',
        'transition-colors duration-200',
        dragging ? 'bg-blue-100' : 'bg-gray-100',
      ].join(' ')}>
        📊
      </div>

      {/* Labels */}
      <div className="text-center">
        <p className={`text-base font-semibold ${dragging ? 'text-blue-600' : 'text-gray-700'}`}>
          {atLimit
            ? `File limit reached (${MAX_FILES} max)`
            : dragging
            ? 'Drop your Excel files here'
            : 'Drag & drop Excel files, or click to browse'}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          .xlsx and .xls only · max {MAX_FILE_SIZE_MB} MB per file · up to {MAX_FILES} files
        </p>
      </div>

      {/* Animated ring while dragging */}
      {dragging && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-blue-300 ring-opacity-60 animate-pulse" />
      )}
    </div>
  );
}
