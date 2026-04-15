const SYMBOLS: Record<string, string> = {
  USD: '$',
  JPY: '¥',
  EUR: '€',
  GBP: '£',
  HKD: 'HK$',
  CNY: '¥',
  KRW: '₩',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF ',
  SGD: 'S$',
};

export function currencySymbol(currency: string): string {
  return SYMBOLS[currency] ?? currency + ' ';
}

export function formatPrice(price: number, currency: string): string {
  const symbol = currencySymbol(currency);
  const decimals = currency === 'JPY' || currency === 'KRW' ? 0 : 2;
  return symbol + price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
