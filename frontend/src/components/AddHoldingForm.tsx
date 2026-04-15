import { useState } from 'react';
import { useAddHolding } from '../hooks/usePortfolio';
import SymbolInput from './SymbolInput';

interface Props {
  portfolioId: number;
  onClose: () => void;
}

export default function AddHoldingForm({ portfolioId, onClose }: Props) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const addHolding = useAddHolding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addHolding.mutateAsync({
      portfolioId,
      data: { symbol: symbol.toUpperCase(), quantity: Number(quantity), avg_cost: Number(avgCost) },
    });
    onClose();
  };

  return (
    <div style={{ background: '#f1f5f9', borderRadius: 8, padding: 16, marginTop: 12 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={fieldWrap}>
          <label style={label}>銘柄コード</label>
          <SymbolInput value={symbol} onChange={setSymbol} />
        </div>
        <div style={fieldWrap}>
          <label style={label}>数量</label>
          <input style={input} type="number" placeholder="10" min="0.0001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div style={fieldWrap}>
          <label style={label}>平均取得単価 ($)</label>
          <input style={input} type="number" placeholder="150.00" min="0" step="any" value={avgCost} onChange={(e) => setAvgCost(e.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={addHolding.isPending} style={btnPrimary}>
            {addHolding.isPending ? '追加中...' : '追加'}
          </button>
          <button type="button" onClick={onClose} style={btnSecondary}>キャンセル</button>
        </div>
      </form>
      {addHolding.isError && <p style={{ color: '#dc2626', marginTop: 8, fontSize: 13 }}>追加に失敗しました</p>}
    </div>
  );
}

const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const label: React.CSSProperties = { fontSize: 12, color: '#64748b', fontWeight: 600 };
const input: React.CSSProperties = { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, width: 140 };
const btnPrimary: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 14 };
const btnSecondary: React.CSSProperties = { background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 14 };
