export type ClassValue = string | null | undefined | false;

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(
  amountCents: number,
  currency = "AUD",
  locale = "en-AU"
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  });

  return formatter.format(amountCents / 100);
}

export function parseCurrency(value: string) {
  const sanitized = value.replace(/[^0-9.-]/g, "");
  if (!sanitized) return 0;
  return Math.round(parseFloat(sanitized) * 100);
}

export function formatDate(date: Date | string) {
  const dt = typeof date === "string" ? new Date(date) : date;
  return dt.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
