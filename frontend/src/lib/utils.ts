import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: ru });
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5); // "08:00:00" → "08:00"
}

export function formatPrice(from: number, to?: number | null): string {
  if (!to) return `от ${from.toLocaleString('ru-RU')} ₽`;
  return `${from.toLocaleString('ru-RU')} – ${to.toLocaleString('ru-RU')} ₽`;
}

export const BOOKING_STATUSES = {
  new: { label: 'Новая', color: 'bg-yellow-500/20 text-yellow-300' },
  confirmed: { label: 'Подтверждена', color: 'bg-blue-500/20 text-blue-300' },
  in_progress: { label: 'В работе', color: 'bg-orange-500/20 text-orange-300' },
  completed: { label: 'Выполнена', color: 'bg-green-500/20 text-green-300' },
  cancelled: { label: 'Отменена', color: 'bg-dark-200 text-dark-300' },
} as const;

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00',
];
