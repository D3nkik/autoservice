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
  new: { label: 'Новая', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Подтверждена', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'В работе', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Выполнена', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменена', color: 'bg-red-100 text-red-800' },
} as const;

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00',
];
