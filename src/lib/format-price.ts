export function formatPrice(price: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency.toUpperCase();
  return `${price}${symbol}`;
}

export function formatPriceFrom(price: number, currency: string): string {
  return `À partir de ${formatPrice(price, currency)}`;
}
