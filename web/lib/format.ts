// Money is stored in kobo (integer). Format for display in naira.
export function koboToNaira(kobo: number): string {
  return "₦" + (kobo / 100).toLocaleString("en-NG");
}

export function orderNumber(sequence: number): string {
  return `#ADO${sequence}`;
}
