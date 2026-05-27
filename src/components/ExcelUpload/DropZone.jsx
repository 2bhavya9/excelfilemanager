import { useRef, useState } from 'react';
import { MAX_FILES, MAX_FILE_SIZE_MB } from '../../utils/fileUtils';

export default function DropZone({ onFiles, disabled, currentCount }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    onFiles(Array.from(e.dataTransfer.files));
  }

  function handleClick() {
    if (!disabled && !atLimit) inputRef.current?.click();
  }

  function handleInputChange(e) {
    onFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  const atLimit = currentCount >= MAX_FILES;
  const isBlocked = disabled || atLimit;

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position:'relative',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        gap:'12px',
        minHeight:'200px',
        borderRadius:'16px',
        border: dragging
          ? '2px solid #2563eb'
          : isBlocked
          ? '2px dashed #e2e8f0'
          : '2px dashed #cbd5e1',
        background: dragging
          ? 'linear-gradient(135deg,#eff6ff,#dbeafe)'
          : isBlocked
          ? '#fafafa'
          : 'linear-gradient(135deg,#f8fafc,#f1f5f9)',
        cursor: isBlocked ? 'not-allowed' : 'pointer',
        transition:'all 0.2s ease',
        transform: dragging ? 'scale(1.01)' : 'scale(1)',
        boxShadow: dragging ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
        opacity: isBlocked ? 0.65 : 1,
        userSelect:'none',
        overflow:'hidden',
      }}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        multiple
        style={{ display:'none' }}
        onChange={handleInputChange}
        disabled={isBlocked}
      />

      {/* Subtle grid background when dragging */}
      {dragging && (
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
          backgroundSize:'24px 24px', opacity:0.4,
        }}/>
      )}

      {/* Excel icon */}
      <div style={{
        width:'68px', height:'68px', borderRadius:'18px',
        background: dragging
          ? 'linear-gradient(135deg,#2563eb,#0ea5e9)'
          : 'linear-gradient(135deg,#e2e8f0,#f1f5f9)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'30px',
        boxShadow: dragging ? '0 8px 24px rgba(37,99,235,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition:'all 0.2s ease',
        transform: dragging ? 'scale(1.08)' : 'scale(1)',
      }}>
        {dragging ? '⬇️' : '📊'}
      </div>

      {/* Text */}
      <div style={{ textAlign:'center' }}>
        {atLimit ? (
          <p style={{ color:'#94a3b8', fontSize:'14px', fontWeight:600 }}>
            File limit reached ({MAX_FILES} max)
          </p>
        ) : dragging ? (
          <>
            <p style={{ color:'#2563eb', fontSize:'16px', fontWeight:700 }}>Drop files here</p>
            <p style={{ color:'#60a5fa', fontSize:'13px', marginTop:'4px' }}>Release to add</p>
          </>
        ) : (
          <>
            <p style={{ color:'#334155', fontSize:'15px', fontWeight:600 }}>
              Drag &amp; drop Excel files here
            </p>
            <p style={{ color:'#94a3b8', fontSize:'13px', marginTop:'5px', lineHeight:1.5 }}>
              or <span style={{ color:'#2563eb', fontWeight:600, textDecoration:'underline' }}>click to browse</span>
              {' '}· .xlsx and .xls only · max {MAX_FILE_SIZE_MB} MB each
            </p>
          </>
        )}
      </div>

      {/* File count badge */}
      {currentCount > 0 && (
        <div style={{
          position:'absolute', top:'14px', right:'14px',
          background:'#2563eb', color:'#fff',
          fontSize:'11px', fontWeight:700,
          borderRadius:'20px', padding:'3px 10px',
          letterSpacing:'0.3px',
        }}>
          {currentCount} / {MAX_FILES}
        </div>
      )}
    </div>
  );
}
