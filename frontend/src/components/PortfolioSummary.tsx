import { useQueries, useQuery } from '@tanstack/react-query';
import { getStockPrice } from '../api/stocks';
import { formatPrice } from '../utils/currency';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
  displayCurrency: 'USD' | 'JPY';
  onToggleCurrency: () => void;
}

export default function PortfolioSummary({ holdings, displayCurrency, onToggleCurrency }: Props) {
  const priceResults = useQueries({
    queries: holdings.map((h) => ({
      queryKey: ['stock', h.symbol],
      queryFn: () => getStockPrice(h.symbol),
      refetchInterval: 60_000,
      staleTime: 30_000,
    })),
  });

  const { data: rateData } = useQuery({
    queryKey: ['stock', 'USDJPY=X'],
    queryFn: () => getStockPrice('USDJPY=X'),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: displayCurrency === 'JPY',
  });

  if (holdings.length === 0) return null;

  let totalGainLossUSD = 0;
  for (let i = 0; i < holdings.length; i++) {
    const price = priceResults[i].data?.price;
    if (price === undefined) return null;
    totalGainLossUSD += (price - holdings[i].avg_cost) * holdings[i].quantity;
  }

  const usdJpyRate = rateData?.price ?? null;
  let displayValue: number;
  let displayCurrencyStr: string;

  if (displayCurrency === 'JPY') {
    if (usdJpyRate === null) return null;
    displayValue = totalGainLossUSD * usdJpyRate;
    displayCurrencyStr = 'JPY';
  } else {
    displayValue = totalGainLossUSD;
    displayCurrencyStr = 'USD';
  }

  const isPositive = displayValue >= 0;

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
      <span
        onClick={onToggleCurrency}
        style={{ fontSize: 13, color: '#64748b', cursor: 'pointer', userSelect: 'none', textDecoration: 'underline dotted' }}
        title="クリックで通貨切替"
      >
        損益合計 ({displayCurrency})
      </span>
      <span
        onClick={onToggleCurrency}
        style={{ fontSize: 16, fontWeight: 700, color: isPositive ? '#16a34a' : '#dc2626', cursor: 'pointer', userSelect: 'none' }}
        title="クリックで通貨切替"
      >
        {isPositive ? '+' : ''}{formatPrice(displayValue, displayCurrencyStr)}
      </span>
    </div>
  );
}
