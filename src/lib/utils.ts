import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const createDownloadLink = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// API amounts are in thousandths (denominator 1000): 50400 -> "50.4 EGP"
export const formatAmount = (value: number) =>
  `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format((value ?? 0) / 1000)} EGP`


  // The receipts API returns a full data URI (data:image/png;base64,...).
// Fall back to prefixing raw base64 if a plain string is ever returned.
export const toImageSrc = (value: string) =>
  value.startsWith('data:') ? value : `data:image/png;base64,${value}`