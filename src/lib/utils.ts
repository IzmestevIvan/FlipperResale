import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export const conditionLabels: Record<string, string> = {
  NEW: "Новый",
  LIKE_NEW: "Как новый",
  GOOD: "Хорошее",
  FAIR: "Удовлетворительное",
};

export const statusLabels: Record<string, string> = {
  ACTIVE: "Активно",
  SOLD: "Продано",
  ARCHIVED: "Архив",
};
