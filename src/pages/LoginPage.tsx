import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/workspace');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="xt-login-container" 
      style={{ 
        display: 'flex', 
        minHeight: '80vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%',
        padding: '24px'
      }}
    >
      <div 
        className="xt-login-card" 
        style={{ 
          width: '100%', 
          maxWidth: '448px', 
          backgroundColor: 'white', 
          borderRadius: '24px', 
          border: '1px solid #e2e8f0', 
          padding: '40px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ margin: '0 auto 16px', display: 'flex', height: '56px', width: '56px', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', borderRadius: '16px', backgroundColor: '#0058be', color: 'white' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>lock</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: '0' }}>Welcome Back</h1>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#4a5568' }}>Precision AI Marketplace</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', fontSize: '20px' }}>mail</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px' }}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', fontSize: '20px' }}>key</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              backgroundColor: '#0058be', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', backgroundColor: '#fff5f5', color: '#c53030', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            {error}
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#4a5568' }}>
            Don't have an account? <a href="#" style={{ color: '#0058be', fontWeight: '700', textDecoration: 'none' }}>Request Access</a>
          </p>
        </div>
      </div>
    </div>
  );
};
