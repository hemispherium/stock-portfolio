import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch {
      setError('登録に失敗しました。入力内容をご確認ください。');
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>アカウント登録</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={label}>名前</label>
            <input style={input} value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={label}>メールアドレス</label>
            <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={label}>パスワード (8文字以上)</label>
            <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
          <button type="submit" style={btn}>登録</button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          すでにアカウントをお持ちの方は <Link to="/login" style={{ color: '#2563eb' }}>ログイン</Link>
        </p>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' };
const card: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 32, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' };
const title: React.CSSProperties = { fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center', color: '#1e293b' };
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 };
const input: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const btn: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 };
