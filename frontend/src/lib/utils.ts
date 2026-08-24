import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | string): string {
  if (!num && num !== 0) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
