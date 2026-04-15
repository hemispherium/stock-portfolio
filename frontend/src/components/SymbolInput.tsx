import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchStocks } from '../api/stocks';
import { useStockPrice } from '../hooks/useStockPrice';
import type { StockSuggestion } from '../types';

interface Props {
  value: string;
  onChange: (symbol: string) => void;
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SuggestionItem({ s, onSelect }: { s: StockSuggestion; onSelect: () => void }) {
  const { data: stock, isLoading } = useStockPrice(s.symbol);

  const isUp = stock ? stock.change >= 0 : null;
  const priceColor = isUp === null ? '#0f172a' : isUp ? '#16a34a' : '#dc2626';
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={item} onMouseDown={onSelect}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.symbol}</span>
        <span style={{ fontWeight: 600, color: priceColor }}>
          {isLoading ? '...' : stock ? `$${fmt(stock.price)}` : '-'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.type} · {s.exchange}</span>
        <span style={{ fontSize: 11, color: priceColor }}>
          {stock ? `${isUp ? '+' : ''}${fmt(stock.change)} (${isUp ? '+' : ''}${stock.change_pct.toFixed(2)}%)` : ''}
        </span>
      </div>
    </div>
  );
}

export default function SymbolInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(value, 300);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ['stockSearch', debounced],
    queryFn: () => searchStocks(debounced),
    enabled: debounced.length >= 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (s: StockSuggestion) => {
    onChange(s.symbol);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        style={inputStyle}
        placeholder="AAPL"
        value={value}
        onChange={(e) => { onChange(e.target.value.toUpperCase()); setOpen(true); }}
        onFocus={() => value.length >= 1 && setOpen(true)}
        autoComplete="off"
        required
      />
      {open && value.length >= 1 && (
        <div style={dropdown}>
          {isFetching && <div style={item}>検索中...</div>}
          {!isFetching && suggestions.length === 0 && (
            <div style={{ ...item, color: '#94a3b8' }}>候補が見つかりません</div>
          )}
          {suggestions.map((s) => (
            <SuggestionItem key={s.symbol} s={s} onSelect={() => handleSelect(s)} />
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: 14,
  width: 140,
};

const dropdown: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  zIndex: 50,
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  minWidth: 240,
  maxHeight: 320,
  overflowY: 'auto',
  marginTop: 4,
};

const item: React.CSSProperties = {
  padding: '8px 12px',
  cursor: 'pointer',
  borderBottom: '1px solid #f1f5f9',
};
