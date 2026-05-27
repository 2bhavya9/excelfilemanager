import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  display: 'block',
  width: '100%',
  height: '50px',
  padding: '0 16px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  color: '#0f172a',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const result = register(email, password);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
    }
  }

  return (
    <div style={{
      flex: 1,
      background: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Large white container */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '88%',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        padding: '48px 24px',
      }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px' }}>

          {/* App label */}
          <p style={{ color: '#3b82f6', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
            Excel File Manager
          </p>

          {/* Heading */}
          <h1 style={{ color: '#0f172a', fontSize: '34px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.1 }}>
            Create Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
            Register a new account to get started
          </p>

          {/* Email */}
          <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          {/* Password */}
          <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '6px', marginTop: '18px' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {/* Confirm Password */}
          <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '6px', marginTop: '18px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />

          {/* Messages */}
          {error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', fontSize: '12px', marginTop: '8px' }}>{success}</p>}

          {/* Register button */}
          <button
            type="submit"
            className="btn btn-primary btn-full"
            style={{ marginTop: '20px', height: '52px', fontSize: '15px', borderRadius: '10px' }}
          >
            Register
          </button>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

          {/* Login link */}
          <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginBottom: '10px' }}>
            Already have an account?
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '10px',
              border: '2px solid #3b82f6',
              background: 'transparent',
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
