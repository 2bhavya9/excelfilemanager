import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{
      background: '#0f172a',
      height: '60px',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.3px' }}>
        Excel File Manager
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{user}</span>
            <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
            >
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
