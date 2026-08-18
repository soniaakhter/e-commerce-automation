export function parseCurrency(displayedValue: string): number {
  const numericText = displayedValue.match(/-?\d[\d,]*(?:\.\d+)?/)?.[0];
  const numericValue = Number(numericText?.replace(/,/g, ''));

  if (!numericText || !Number.isFinite(numericValue)) {
    throw new Error(`Unable to parse currency value: ${displayedValue}`);
  }

  return numericValue;
}
