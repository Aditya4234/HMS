import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'text-green-500 bg-green-500/10',
    OCCUPIED: 'text-blue-500 bg-blue-500/10',
    MAINTENANCE: 'text-yellow-500 bg-yellow-500/10',
    RESERVED: 'text-purple-500 bg-purple-500/10',
    PENDING: 'text-yellow-500 bg-yellow-500/10',
    CONFIRMED: 'text-blue-500 bg-blue-500/10',
    CHECKED_IN: 'text-green-500 bg-green-500/10',
    CHECKED_OUT: 'text-gray-500 bg-gray-500/10',
    CANCELLED: 'text-red-500 bg-red-500/10',
    NO_SHOW: 'text-red-500 bg-red-500/10',
    COMPLETED: 'text-green-500 bg-green-500/10',
    FAILED: 'text-red-500 bg-red-500/10',
    REFUNDED: 'text-purple-500 bg-purple-500/10',
    PARTIALLY_REFUNDED: 'text-orange-500 bg-orange-500/10',
  };
  return colors[status] || 'text-gray-500 bg-gray-500/10';
}

export function getStatusDot(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-500',
    OCCUPIED: 'bg-blue-500',
    MAINTENANCE: 'bg-yellow-500',
    RESERVED: 'bg-purple-500',
    PENDING: 'bg-yellow-500',
    CONFIRMED: 'bg-blue-500',
    CHECKED_IN: 'bg-green-500',
    CHECKED_OUT: 'bg-gray-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-red-500',
    COMPLETED: 'bg-green-500',
    FAILED: 'bg-red-500',
    REFUNDED: 'bg-purple-500',
  };
  return colors[status] || 'bg-gray-500';
}
