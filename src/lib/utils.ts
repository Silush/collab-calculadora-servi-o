import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Formata valores para o padrão de moeda brasileiro (BRL)
 */
export const formatCurrency = (value: number | undefined | null): string => {
  const amount = value ?? 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
/**
 * Formata números decimais com separadores de milhar/decimal do Brasil
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};
/**
 * Converte booleanos ou strings 'yes'/'no' para 'Sim'/'Não'
 */
export const formatBooleanBR = (value: boolean | string | undefined | null): string => {
  if (value === true || value === 'yes') return 'Sim';
  return 'Não';
};