import { formatSize } from '../../utils/fileUtils';

const STATUS_CONFIG = {
  staged:    { label:'Ready',      dot:'#f59e0b', bg:'#fffbeb', text:'#b45309', border:'#fde68a' },
  uploading: { label:'Uploading…', dot:'#3b82f6', bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe' },
  done:      { label:'Uploaded',   dot:'#22c55e', bg:'#f0fdf4', text:'#15803d', border:'#bbf7d0' },
  error:     { label:'Failed',     dot:'#ef4444', bg:'#fff1f2', text:'#dc2626', border:'#fecaca' },
};

export default function FileCard({ file, onRemove, uploading }) {
  const { name, size, status = 'staged', progress = 0, sheetNames, uploadedAt } = file;
  const isUploading = status === 'uploading';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.staged;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'14px',
      background:'#fff', border:'1px solid #f1f5f9',
      borderRadius:'12px', padding:'14px 16px',
      transition:'all 0.15s ease',
      boxShadow:'0 1px 2px rgba(0,0,0,0.04)',
      position:'relative', overflow:'hidden',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor='#e2e8f0'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor='#f1f5f9'; }}
    >

      {/* Progress stripe at bottom */}
      {isUploading && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:'3px',
          background:'#e0e7ff',
        }}>
          <div style={{
            height:'100%', width:`${progress}%`,
            background:'linear-gradient(90deg,#2563eb,#0ea5e9)',
            transition:'width 0.3s ease', borderRadius:'2px',
          }}/>
        </div>
      )}

      {/* File icon */}
      <div style={{
        width:'42px', height:'42px', borderRadius:'12px', flexShrink:0,
        background:'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'20px', boxShadow:'0 2px 6px rgba(5,150,105,0.15)',
      }}>
        📊
      </div>

      {/* File info */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{
          color:'#0f172a', fontSize:'14px', fontWeight:600,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          marginBottom:'3px',
        }} title={name}>
          {name}
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px' }}>
          <span style={{
            color:'#94a3b8', fontSize:'12px',
            background:'#f8fafc', border:'1px solid #f1f5f9',
            borderRadius:'6px', padding:'1px 7px', fontWeight:500,
          }}>
            {formatSize(size)}
          </span>
          {sheetNames?.length > 0 && (
            <span style={{
              color:'#7c3aed', fontSize:'11px', fontWeight:500,
              background:'#f5f3ff', border:'1px solid #ede9fe',
              borderRadius:'6px', padding:'1px 7px',
              maxWidth:'180px', whiteSpace:'nowrap',
              overflow:'hidden', textOverflow:'ellipsis',
            }} title={sheetNames.join(', ')}>
              {sheetNames.length} sheet{sheetNames.length !== 1 ? 's' : ''}
            </span>
          )}
          {uploadedAt && (
            <span style={{ color:'#cbd5e1', fontSize:'11px' }}>
              {new Date(uploadedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div style={{
        display:'flex', alignItems:'center', gap:'5px', flexShrink:0,
        background:cfg.bg, border:`1px solid ${cfg.border}`,
        borderRadius:'20px', padding:'4px 10px',
      }}>
        <span style={{
          width:'6px', height:'6px', borderRadius:'50%',
          background:cfg.dot, flexShrink:0,
          boxShadow: isUploading ? `0 0 0 3px ${cfg.border}` : 'none',
          animation: isUploading ? 'pulse-ring 1.4s ease-in-out infinite' : 'none',
        }}/>
        <span style={{ color:cfg.text, fontSize:'11px', fontWeight:700 }}>{cfg.label}</span>
      </div>

      {/* Action buttons */}
      {!isUploading && (
        <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
          {/* Delete */}
          <button
            onClick={onRemove}
            disabled={uploading}
            title="Delete file"
            style={{
              width:'32px', height:'32px', borderRadius:'8px',
              border:'1.5px solid #fecaca', background:'#fff1f2',
              color:'#dc2626', fontSize:'14px', fontWeight:700,
              cursor: uploading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.15s ease', flexShrink:0,
              opacity: uploading ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!uploading) { e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.borderColor='#fca5a5'; }}}
            onMouseLeave={e => { e.currentTarget.style.background='#fff1f2'; e.currentTarget.style.borderColor='#fecaca'; }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
