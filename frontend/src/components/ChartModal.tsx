import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { getStockHistory } from '../api/stocks';
import { useStockPrice } from '../hooks/useStockPrice';

const RANGES = [
  { label: '1D',  value: '1d'  },
  { label: '5D',  value: '5d'  },
  { label: '1M',  value: '1mo' },
  { label: '6M',  value: '6mo' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y',  value: '1y'  },
];

interface Props {
  symbol: string;
  onClose: () => void;
}

export default function ChartModal({ symbol, onClose }: Props) {
  const [range, setRange] = useState('1mo');
  const { data: price } = useStockPrice(symbol);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['stockHistory', symbol, range],
    queryFn: () => getStockHistory(symbol, range),
    staleTime: 60_000,
  });

  // ESCキーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isIntraday = range === '1d' || range === '5d';
  const isUp = price ? price.change >= 0 : true;
  const lineColor = isUp ? '#16a34a' : '#dc2626';
  const fillColor = isUp ? '#dcfce7' : '#fee2e2';

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{symbol}</h2>
            {price && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>${fmt(price.price)}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: lineColor }}>
                  {isUp ? '+' : ''}{fmt(price.change)} ({isUp ? '+' : ''}{price.change_pct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* 期間選択 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={range === r.value ? rangeActive : rangeBtn}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* チャート */}
        <div style={{ height: 300 }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
              読み込み中...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => isIntraday ? v : v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v) => `$${v}`}
                  width={60}
                />
                <Tooltip
                  formatter={(v) => [`$${fmt(Number(v))}`, '終値']}
                  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  strokeWidth={2}
                  fill="url(#colorFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: lineColor }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 28,
  width: '90%', maxWidth: 640, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const closeBtn: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer', padding: 4,
};
const rangeBtn: React.CSSProperties = {
  background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '4px 12px',
  fontSize: 13, color: '#64748b', cursor: 'pointer',
};
const rangeActive: React.CSSProperties = {
  ...rangeBtn, background: '#1e293b', color: '#fff', fontWeight: 600,
};
