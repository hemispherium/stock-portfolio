import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <nav style={{ backgroundColor: '#1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <Link to="/" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
          Stock Portfolio
        </Link>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#94a3b8', fontSize: 14 }}>{user.email}</span>
            <button onClick={handleLogout} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              ログアウト
            </button>
          </div>
        )}
      </nav>
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
        {children}
      </main>
    </div>
  );
}
