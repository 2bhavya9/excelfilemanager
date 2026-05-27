import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExcelUpload from '../components/ExcelUpload/ExcelUpload';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    /* Dark outer background */
    <div className="flex flex-1 items-center justify-center bg-slate-800 p-6">

      {/* Large white container */}
      <div className="flex w-[88%] min-h-[75vh] flex-col rounded-3xl bg-white shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-10 py-7">
          <div>
            <p className="text-sm font-bold text-blue-500">Excel File Manager</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">Welcome, {user}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            Logout
          </button>
        </div>

        {/* ── Upload feature ── */}
        <div className="flex-1 px-10 py-8">
          <ExcelUpload />
        </div>

      </div>
    </div>
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Files already on the "server" (returned by API)
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Files the user has picked but NOT yet uploaded
  const [staged, setStaged] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Fetch uploaded files on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data, error: err } = await getFiles();
      if (err) setError(err);
      else setUploadedFiles(data);
      setLoadingList(false);
    })();
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // ── Browse: stage selected files ────────────────────────────────────────
  function handleBrowse() {
    inputRef.current.click();
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);
    e.target.value = '';
    setError('');
    setSuccess('');

    const invalid = selected.filter(f => !f.name.match(/\.(xlsx|xls)$/i));
    if (invalid.length) {
      setError(`Only .xlsx / .xls files allowed. Skipped: ${invalid.map(f => f.name).join(', ')}`);
    }

    const valid = selected.filter(f => f.name.match(/\.(xlsx|xls)$/i));
    // Avoid re-staging already staged or already uploaded names
    const existingNames = new Set([
      ...staged.map(f => f.name),
      ...uploadedFiles.map(f => f.name),
    ]);
    const fresh = valid.filter(f => !existingNames.has(f.name));
    if (fresh.length < valid.length) {
      setError(prev =>
        (prev ? prev + ' ' : '') + 'Duplicate files were skipped.'
      );
    }
    setStaged(prev => [...prev, ...fresh]);
  }

  function removeStagedFile(name) {
    setStaged(prev => prev.filter(f => f.name !== name));
  }

  // ── Upload staged files via API ─────────────────────────────────────────
  async function handleUpload() {
    if (!staged.length) return;
    setUploading(true);
    setError('');
    setSuccess('');

    // ↓↓ Replace uploadFiles() body with real fetch/axios call later ↓↓
    const { data, error: err } = await uploadFiles(staged);

    if (err) {
      setError(err);
    } else {
      setUploadedFiles(prev => [...prev, ...data]);
      setStaged([]);
      setSuccess(`${data.length} file${data.length !== 1 ? 's' : ''} uploaded successfully.`);
    }
    setUploading(false);
  }

  // ── Delete an uploaded file via API ─────────────────────────────────────
  async function handleDelete(id) {
    // ↓↓ Replace deleteFile() body with real fetch/axios call later ↓↓
    const { error: err } = await deleteFile(id);
    if (err) setError(err);
    else setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }

  // ── Clear all uploaded files via API ────────────────────────────────────
  async function handleClearAll() {
    // ↓↓ Replace clearAllFiles() body with real fetch/axios call later ↓↓
    const { error: err } = await clearAllFiles();
    if (err) setError(err);
    else {
      setUploadedFiles([]);
      setSuccess('All files cleared.');
    }
  }

  const totalFiles = uploadedFiles.length + staged.length;

  return (
    <div style={{
      flex: 1,
      background: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Large white container */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '88%',
        minHeight: '75vh',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        padding: '40px 48px',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
              Excel File Manager
            </p>
            <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: 800 }}>Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Welcome, {user}</p>
          </div>
          <button className="btn btn-logout" onClick={handleLogout} style={{ height: '40px' }}>
            Logout
          </button>
        </div>

        {/* ── Upload card ── */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
        }}>
          <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
            Upload Excel Files
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
            Browse to select files, then click <strong>Upload</strong> to send them.
          </p>

          {/* Action buttons row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Browse */}
            <button
              className="btn btn-primary"
              onClick={handleBrowse}
              disabled={uploading}
              style={{ height: '42px', fontSize: '14px', paddingInline: '20px' }}
            >
              📂 Browse Files
            </button>

            {/* Upload — only visible when files are staged */}
            {staged.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  height: '42px',
                  paddingInline: '20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: uploading ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {uploading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    Uploading…
                  </>
                ) : (
                  <>⬆️ Upload {staged.length} file{staged.length !== 1 ? 's' : ''}</>
                )}
              </button>
            )}

            {/* Clear staged */}
            {staged.length > 0 && !uploading && (
              <button
                onClick={() => setStaged([])}
                style={{
                  height: '42px',
                  paddingInline: '16px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Discard Selection
              </button>
            )}

            {/* Clear all uploaded */}
            {uploadedFiles.length > 0 && staged.length === 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  height: '42px',
                  paddingInline: '16px',
                  borderRadius: '8px',
                  border: '1.5px solid #fca5a5',
                  background: '#fff1f2',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                🗑 Clear All
              </button>
            )}

            {/* Count badge */}
            <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '4px' }}>
              {totalFiles === 0
                ? 'No files yet.'
                : `${uploadedFiles.length} uploaded${staged.length ? `, ${staged.length} selected` : ''}`}
            </span>
          </div>

          {/* Staged file pills */}
          {staged.length > 0 && (
            <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {staged.map(f => (
                <div key={f.name} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: '20px', padding: '4px 10px 4px 12px',
                  fontSize: '12px', color: '#1d4ed8', fontWeight: 600,
                }}>
                  📄 {f.name}
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}>({formatSize(f.size)})</span>
                  <button
                    onClick={() => removeStagedFile(f.name)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#93c5fd', fontWeight: 700, fontSize: '14px', lineHeight: 1,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', fontSize: '12px', marginTop: '10px' }}>✓ {success}</p>}
        </div>

        {/* ── Uploaded file list ── */}
        <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
          Uploaded Files
          {uploadedFiles.length > 0 && (
            <span style={{
              marginLeft: '10px', background: '#eff6ff', color: '#3b82f6',
              borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 700,
            }}>
              {uploadedFiles.length}
            </span>
          )}
        </p>

        {loadingList ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Loading…
          </div>
        ) : uploadedFiles.length === 0 ? (
          /* Empty state */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '48px',
          }}>
            <span style={{ fontSize: '48px' }}>📊</span>
            <p style={{ fontWeight: 600, color: '#64748b', fontSize: '15px' }}>No Excel files uploaded yet.</p>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Browse files, then click Upload to get started.</p>
          </div>
        ) : (
          /* Scrollable file cards */
          <div style={{
            flex: 1, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '10px',
            maxHeight: '340px', paddingRight: '4px',
          }}>
            {uploadedFiles.map(file => (
              <div key={file.id} style={{
                display: 'flex', alignItems: 'center',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '12px', padding: '14px 18px', gap: '14px',
              }}>
                <span style={{ fontSize: '26px', flexShrink: 0 }}>📊</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: 700, color: '#0f172a', fontSize: '14px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {file.name}
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                    {formatSize(file.size)}
                    <span style={{ marginLeft: '10px', color: '#cbd5e1' }}>
                      Uploaded {formatDate(file.uploadedAt)}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(file.id)}
                  title="Remove file"
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: 'none', background: '#fee2e2', color: '#dc2626',
                    fontWeight: 700, fontSize: '16px', cursor: 'pointer',
                    flexShrink: 0, lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
