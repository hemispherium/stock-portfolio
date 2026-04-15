import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStockPrice } from '../hooks/useStockPrice';
import { useDeleteHolding } from '../hooks/usePortfolio';
import ChartModal from './ChartModal';
import { formatPrice } from '../utils/currency';
import type { Holding } from '../types';

interface Props {
  holding: Holding;
  portfolioId: number;
}

export default function HoldingRow({ holding, portfolioId }: Props) {
  const { data: stock, isLoading } = useStockPrice(holding.symbol);
  const deleteHolding = useDeleteHolding();
  const [showChart, setShowChart] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: holding.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderBottom: '1px solid #e2e8f0',
  };

  const currency = stock?.currency ?? 'USD';
  const currentPrice = stock?.price ?? null;
  const gainLoss = currentPrice !== null ? (currentPrice - holding.avg_cost) * holding.quantity : null;
  const gainLossPct = currentPrice !== null ? ((currentPrice - holding.avg_cost) / holding.avg_cost) * 100 : null;
  const isPositive = gainLoss !== null && gainLoss >= 0;

  const fmtQty = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <>
      <tr ref={setNodeRef} style={style}>
        <td style={td}>
          <span
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', color: '#cbd5e1', fontSize: 16, padding: '0 4px', userSelect: 'none' }}
            title="ドラッグして並び替え"
          >
            ⠿
          </span>
        </td>
        <td style={td}>
          <button
            onClick={() => setShowChart(true)}
            style={{ fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
          >
            {holding.symbol}
          </button>
        </td>
        <td style={tdR}>{fmtQty(holding.quantity)}</td>
        <td style={tdR}>{formatPrice(holding.avg_cost, currency)}</td>
        <td style={tdR}>
          {isLoading ? '...' : currentPrice !== null ? formatPrice(currentPrice, currency) : '-'}
        </td>
        <td style={{ ...tdR, color: isPositive ? '#16a34a' : '#dc2626' }}>
          {gainLoss !== null ? `${isPositive ? '+' : ''}${formatPrice(gainLoss, currency)}` : '-'}
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
