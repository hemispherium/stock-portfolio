import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPortfolios, createPortfolio, deletePortfolio, addHolding, deleteHolding } from '../api/portfolio';

export function usePortfolios() {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: getPortfolios,
  });
}

export function useCreatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}

export function useDeletePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePortfolio,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ portfolioId, data }: { portfolioId: number; data: { symbol: string; quantity: number; avg_cost: number } }) =>
      addHolding(portfolioId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ portfolioId, holdingId }: { portfolioId: number; holdingId: number }) =>
      deleteHolding(portfolioId, holdingId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolios'] }),
  });
}
