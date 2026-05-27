import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(email, password);
    setLoading(false);
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
    }
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f172a' }}>

      {/* ── Left panel ── */}
      <div style={{
        width:'42%', minWidth:'360px', flexShrink:0,
        background:'linear-gradient(145deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        padding:'48px 52px', position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', top:'-80px', right:'-80px',
          width:'340px', height:'340px', borderRadius:'50%',
          background:'rgba(255,255,255,0.07)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', bottom:'-60px', left:'-40px',
          width:'260px', height:'260px', borderRadius:'50%',
          background:'rgba(255,255,255,0.05)', pointerEvents:'none',
        }}/>

        {/* Logo */}
        <div className="anim-fadeIn">
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'12px',
            background:'rgba(255,255,255,0.12)', borderRadius:'14px',
            padding:'10px 18px', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.18)',
          }}>
            <span style={{ fontSize:'24px' }}>📊</span>
            <span style={{ color:'#fff', fontWeight:700, fontSize:'16px', letterSpacing:'-0.3px' }}>
              Excel File Manager
            </span>
          </div>
        </div>

        {/* Main text */}
        <div className="anim-fadeUp" style={{ animationDelay:'0.1s' }}>
          <h1 style={{
            color:'#fff', fontSize:'40px', fontWeight:800,
            lineHeight:1.15, letterSpacing:'-1px', marginBottom:'16px',
          }}>
            Get started<br/>in seconds.
          </h1>
          <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'15px', lineHeight:1.65, marginBottom:'36px' }}>
            Create your free account and start managing<br/>your Excel files right away.
          </p>

          {[
            { icon:'🚀', text:'No credit card required' },
            { icon:'📦', text:'Up to 10 files per session' },
            { icon:'🔄', text:'Upload, preview & delete anytime' },
          ].map(f => (
            <div key={f.text} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
              <span style={{
                fontSize:'18px', width:'36px', height:'36px',
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.15)', borderRadius:'10px', flexShrink:0,
              }}>{f.icon}</span>
              <span style={{ color:'rgba(255,255,255,0.85)', fontSize:'14px', fontWeight:500 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px' }}>v1.0 · Desktop Edition</p>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        background:'#f8fafc', padding:'48px 32px',
      }}>
        <div className="anim-scaleIn" style={{ width:'100%', maxWidth:'400px' }}>

          <h2 style={{
            color:'#0f172a', fontSize:'30px', fontWeight:800,
            letterSpacing:'-0.5px', marginBottom:'6px',
          }}>
            Create account
          </h2>
          <p style={{ color:'#64748b', fontSize:'14px', marginBottom:'32px' }}>
            Fill in the details below to get started
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#334155', marginBottom:'6px' }}>
              Email address
            </label>
            <input
              className="field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ marginBottom:'16px' }}
            />

            {/* Password */}
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#334155', marginBottom:'6px' }}>
              Password
            </label>
            <input
              className="field"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ marginBottom:'16px' }}
            />

            {/* Confirm Password */}
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#334155', marginBottom:'6px' }}>
              Confirm password
            </label>
            <input
              className="field"
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{ marginBottom: (error || success) ? '10px' : '24px' }}
            />

            {/* Error / Success */}
            {error && (
              <div style={{
                display:'flex', alignItems:'center', gap:'8px',
                background:'#fff1f2', border:'1px solid #fecaca',
                borderRadius:'10px', padding:'10px 14px', marginBottom:'20px',
              }}>
                <span style={{ fontSize:'14px' }}>⚠️</span>
                <p style={{ color:'#dc2626', fontSize:'13px', fontWeight:500 }}>{error}</p>
              </div>
            )}
            {success && (
              <div style={{
                display:'flex', alignItems:'center', gap:'8px',
                background:'#f0fdf4', border:'1px solid #bbf7d0',
                borderRadius:'10px', padding:'10px 14px', marginBottom:'20px',
              }}>
                <span style={{ fontSize:'14px' }}>✅</span>
                <p style={{ color:'#16a34a', fontSize:'13px', fontWeight:500 }}>{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ height:'48px', fontSize:'15px', borderRadius:'12px', marginBottom:'20px' }}
            >
              {loading ? (
                <span style={{
                  display:'inline-block', width:'18px', height:'18px',
                  border:'2.5px solid rgba(255,255,255,0.4)',
                  borderTopColor:'#fff', borderRadius:'50%',
                  animation:'spin 0.7s linear infinite',
                }}/>
              ) : 'Create Account'}
            </button>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
              <span style={{ color:'#94a3b8', fontSize:'12px', fontWeight:500 }}>or</span>
              <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
            </div>

            <p style={{ textAlign:'center', color:'#64748b', fontSize:'14px', marginBottom:'12px' }}>
              Already have an account?
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-ghost btn-full"
              style={{ height:'48px', fontSize:'14px', borderRadius:'12px' }}
            >
              Sign in instead
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
