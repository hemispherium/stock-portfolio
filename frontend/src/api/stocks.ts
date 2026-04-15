import client from './client';
import type { StockPrice, StockSuggestion } from '../types';

export const getStockPrice = (symbol: string) =>
  client.get<StockPrice>(`/api/stocks/${symbol}/price`).then((r) => r.data);

export const searchStocks = (q: string) =>
  client.get<StockSuggestion[]>('/api/stocks/search', { params: { q } }).then((r) => r.data);

export const getStockHistory = (symbol: string, range: string) =>
  client.get<{ date: string; close: number }[]>(`/api/stocks/${symbol}/history`, { params: { range } }).then((r) => r.data);
