const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(value: number): string {
  return currency.format(value);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}
