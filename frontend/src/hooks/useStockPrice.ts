import { useQuery } from '@tanstack/react-query';
import { getStockPrice } from '../api/stocks';

export function useStockPrice(symbol: string) {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => getStockPrice(symbol),
    refetchInterval: 60_000, // 60秒ごとに自動更新
    staleTime: 30_000,
  });
}
