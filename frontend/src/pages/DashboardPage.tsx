import { useState } from 'react';
import Layout from '../components/Layout';
import HoldingRow from '../components/HoldingRow';
import AddHoldingForm from '../components/AddHoldingForm';
import { usePortfolios, useCreatePortfolio, useDeletePortfolio } from '../hooks/usePortfolio';

export default function DashboardPage() {
  const { data: portfolios, isLoading } = usePortfolios();
  const createPortfolio = useCreatePortfolio();
  const deletePortfolio = useDeletePortfolio();
  const [newName, setNewName] = useState('');
  const [showAddForm, setShowAddForm] = useState<number | null>(null);

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createPortfolio.mutateAsync(newName.trim());
    setNewName('');
  };

  if (isLoading) return <Layout><p>読み込み中...</p></Layout>;

  return (
    <Layout>
      {/* ポートフォリオ作成フォーム */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={sectionTitle}>ポートフォリオ</h2>
        <form onSubmit={handleCreatePortfolio} style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, width: 240 }}
            placeholder="ポートフォリオ名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" style={btnPrimary}>作成</button>
        </form>
      </div>

      {/* ポートフォリオ一覧 */}
      {portfolios?.length === 0 && (
        <p style={{ color: '#64748b' }}>ポートフォリオがありません。上のフォームから作成してください。</p>
      )}

      {portfolios?.map((portfolio) => (
        <div key={portfolio.id} style={card}>
          {/* ヘッダー */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{portfolio.name}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAddForm(showAddForm === portfolio.id ? null : portfolio.id)} style={btnSecondary}>
                + 銘柄追加
              </button>
              <button onClick={() => deletePortfolio.mutate(portfolio.id)} style={btnDanger}>削除</button>
            </div>
          </div>

          {/* 銘柄追加フォーム */}
          {showAddForm === portfolio.id && (
            <AddHoldingForm portfolioId={portfolio.id} onClose={() => setShowAddForm(null)} />
          )}

          {/* 保有銘柄テーブル */}
          {portfolio.holdings.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>保有銘柄がありません</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    {['銘柄', '数量', '取得単価', '現在値', '損益', '損益率', ''].map((h) => (
                      <th key={h} style={{ ...th, textAlign: h === '銘柄' || h === '' ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => (
                    <HoldingRow key={holding.id} holding={holding} portfolioId={portfolio.id} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </Layout>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 12 };
const card: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' };
const btnPrimary: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14 };
const btnSecondary: React.CSSProperties = { background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 };
const btnDanger: React.CSSProperties = { background: 'none', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13 };
const th: React.CSSProperties = { padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' };
