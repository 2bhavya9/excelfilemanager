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

  const initials = user ? user.split('@')[0].slice(0, 2).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: '#0f172a',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(37,99,235,0.2)', borderRadius: '12px',
            padding: '10px 14px', border: '1px solid rgba(37,99,235,0.3)',
          }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>
                Excel Manager
              </p>
              <p style={{ color: '#3b82f6', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>
                DESKTOP
              </p>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User + Logout */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)', marginBottom: '8px',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#2563eb,#0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '12px',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: '#e2e8f0', fontSize: '13px', fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user}
              </p>
              <p style={{ color: '#475569', fontSize: '11px' }}>Free plan</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-logout"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '9px 12px', borderRadius: '10px' }}
          >
            <span style={{ fontSize: '14px' }}>⎋</span>
            <span style={{ fontSize: '13px' }}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top header */}
        <header style={{
          height: '60px', flexShrink: 0,
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>
              File Upload
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '11px' }}>
              Upload .xlsx and .xls files · up to 10 files at once
            </p>
          </div>
        </header>

        {/* Upload panel */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <div className="anim-fadeUp" style={{
            background: '#fff', borderRadius: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '22px 26px' }}>
              <ExcelUpload />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
