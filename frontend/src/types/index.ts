export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Holding {
  id: number;
  portfolio_id: number;
  symbol: string;
  quantity: number;
  avg_cost: number;
  created_at: string;
  updated_at: string;
  // フロント計算
  current_price?: number;
  gain_loss?: number;
  gain_loss_pct?: number;
}

export interface Portfolio {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  change_pct: number;
  cached: boolean;
}

export interface StockSuggestion {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface AuthResponse {
  token: string;
}
