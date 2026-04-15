import { useState } from 'react';
import { useStockPrice } from '../hooks/useStockPrice';
import { useDeleteHolding } from '../hooks/usePortfolio';
import ChartModal from './ChartModal';
import type { Holding } from '../types';

interface Props {
  holding: Holding;
  portfolioId: number;
}

export default function HoldingRow({ holding, portfolioId }: Props) {
  const { data: stock, isLoading } = useStockPrice(holding.symbol);
  const deleteHolding = useDeleteHolding();
  const [showChart, setShowChart] = useState(false);

  const currentPrice = stock?.price ?? null;
  const gainLoss = currentPrice !== null ? (currentPrice - holding.avg_cost) * holding.quantity : null;
  const gainLossPct = currentPrice !== null ? ((currentPrice - holding.avg_cost) / holding.avg_cost) * 100 : null;
  const isPositive = gainLoss !== null && gainLoss >= 0;

  const fmt = (n: number) => n.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
        <td style={td}>
          <button
            onClick={() => setShowChart(true)}
            style={{ fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            {holding.symbol}
          </button>
        </td>
        <td style={tdR}>{fmt(holding.quantity)}</td>
        <td style={tdR}>${fmt(holding.avg_cost)}</td>
        <td style={tdR}>
          {isLoading ? '...' : currentPrice !== null ? `$${fmt(currentPrice)}` : '-'}
        </td>
        <td style={{ ...tdR, color: isPositive ? '#16a34a' : '#dc2626' }}>
          {gainLoss !== null ? `${isPositive ? '+' : ''}$${fmt(gainLoss)}` : '-'}
        </td>
        <td style={{ ...tdR, color: isPositive ? '#16a34a' : '#dc2626' }}>
          {gainLossPct !== null ? `${isPositive ? '+' : ''}${gainLossPct.toFixed(2)}%` : '-'}
        </td>
        <td style={td}>
          <button
            onClick={() => deleteHolding.mutate({ portfolioId, holdingId: holding.id })}
            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
          >
            削除
          </button>
        </td>
      </tr>

      {showChart && (
        <ChartModal symbol={holding.symbol} onClose={() => setShowChart(false)} />
      )}
    </>
  );
}

const td: React.CSSProperties = { padding: '10px 12px', fontSize: 14 };
const tdR: React.CSSProperties = { ...td, textAlign: 'right' };
