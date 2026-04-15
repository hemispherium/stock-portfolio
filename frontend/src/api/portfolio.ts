import client from './client';
import type { Portfolio, Holding } from '../types';

export const getPortfolios = () =>
  client.get<Portfolio[]>('/api/portfolios').then((r) => r.data);

export const createPortfolio = (name: string) =>
  client.post<Portfolio>('/api/portfolios', { name }).then((r) => r.data);

export const deletePortfolio = (id: number) =>
  client.delete(`/api/portfolios/${id}`);

export const addHolding = (portfolioId: number, data: { symbol: string; quantity: number; avg_cost: number }) =>
  client.post<Holding>(`/api/portfolios/${portfolioId}/holdings`, data).then((r) => r.data);

export const deleteHolding = (portfolioId: number, holdingId: number) =>
  client.delete(`/api/portfolios/${portfolioId}/holdings/${holdingId}`);
