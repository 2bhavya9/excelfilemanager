import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));   // brief UX delay
    const result = login(email, password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
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
        {/* Background blob decoration */}
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
            Manage your<br/>Excel files<br/>with ease.
          </h1>
          <p style={{ color:'rgba(255,255,255,0.72)', fontSize:'15px', lineHeight:1.65, marginBottom:'36px' }}>
            Upload, organise, and access your spreadsheets<br/>from a single, elegant workspace.
          </p>

          {/* Feature pills */}
          {[
            { icon:'⚡', text:'Instant drag-and-drop uploads' },
            { icon:'🔒', text:'Secure per-user file storage' },
            { icon:'📋', text:'Sheet preview & metadata' },
          ].map(f => (
            <div key={f.text} style={{
              display:'flex', alignItems:'center', gap:'12px',
              marginBottom:'14px',
            }}>
              <span style={{
                fontSize:'18px', width:'36px', height:'36px',
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.15)', borderRadius:'10px',
                flexShrink:0,
              }}>{f.icon}</span>
              <span style={{ color:'rgba(255,255,255,0.85)', fontSize:'14px', fontWeight:500 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* Version tag */}
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px' }}>v1.0 · Desktop Edition</p>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        background:'#f8fafc', padding:'48px 32px',
      }}>
        <div className="anim-scaleIn" style={{ width:'100%', maxWidth:'400px' }}>

          {/* Heading */}
          <h2 style={{
            color:'#0f172a', fontSize:'30px', fontWeight:800,
            letterSpacing:'-0.5px', marginBottom:'6px',
          }}>
            Welcome back
          </h2>
          <p style={{ color:'#64748b', fontSize:'14px', marginBottom:'36px' }}>
            Sign in to your account to continue
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
              style={{ marginBottom:'18px' }}
            />

            {/* Password */}
            <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#334155', marginBottom:'6px' }}>
              Password
            </label>
            <input
              className="field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ marginBottom: error ? '10px' : '24px' }}
            />

            {/* Error */}
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
              ) : 'Sign In'}
            </button>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
              <span style={{ color:'#94a3b8', fontSize:'12px', fontWeight:500 }}>or</span>
              <div style={{ flex:1, height:'1px', background:'#e2e8f0' }}/>
            </div>

            {/* Register link */}
            <p style={{ textAlign:'center', color:'#64748b', fontSize:'14px', marginBottom:'12px' }}>
              Don&apos;t have an account?
            </p>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="btn btn-ghost btn-full"
              style={{ height:'48px', fontSize:'14px', borderRadius:'12px' }}
            >
              Create a free account
            </button>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
