import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { meApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { formatDate, formatTime, BOOKING_STATUSES } from '@/lib/utils';

interface Booking {
  id: number;
  date: string;
  time_slot: string;
  service?: { name: string };
  custom_service?: string;
  status: keyof typeof BOOKING_STATUSES;
  lift?: { name: string };
  total_price?: number;
}

const STATUS_ICONS: Record<string, string> = {
  new: '🕐',
  confirmed: '✅',
  in_progress: '🔧',
  completed: '🏁',
  cancelled: '❌',
};

export default function CabinetBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    meApi.getBookings()
      .then((res) => setBookings(res.data))
      .catch(() => toast.error('Ошибка загрузки записей'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCancel = async (id: number) => {
    if (!confirm('Отменить запись?')) return;
    try {
      await meApi.cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success('Запись отменена');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Не удалось отменить запись');
    }
  };

  return (
    <>
      <Head><title>Мои записи — АвтоДвиж</title></Head>
      <div className="min-h-screen bg-dark">
        <div className="bg-dark-100 border-b border-dark-200 px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link href="/cabinet" className="text-dark-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Мои записи</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-8 px-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-dark-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-dark-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-dark-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Нет активных записей</h3>
              <p className="text-dark-300 text-sm mb-6">Запишитесь на обслуживание прямо сейчас</p>
              <Link href="/booking" className="btn-primary">Записаться</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const status = BOOKING_STATUSES[b.status];
                return (
                  <div key={b.id} className="card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{STATUS_ICONS[b.status]}</span>
                          <span className={`badge text-xs ${status?.color || ''}`}>
                            {status?.label}
                          </span>
                          <span className="text-dark-300 text-xs">#{b.id}</span>
                        </div>
                        <p className="font-semibold text-white">{b.service?.name || b.custom_service || 'Другое'}</p>
                        <p className="text-dark-300 text-sm mt-1">
                          {formatDate(b.date)} в {formatTime(b.time_slot)}
                        </p>
                        {b.lift && (
                          <p className="text-dark-300 text-xs mt-0.5">{b.lift.name}</p>
                        )}
                        {b.total_price && b.status === 'completed' && (
                          <p className="text-primary-400 font-semibold mt-2">{b.total_price.toLocaleString('ru-RU')} ₽</p>
                        )}
                      </div>
                      {(b.status === 'new' || b.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="shrink-0 text-sm text-dark-300 hover:text-red-400 transition-colors border border-dark-200 hover:border-red-400/30 px-3 py-1.5 rounded-lg"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {bookings.length > 0 && (
            <div className="mt-6">
              <Link href="/booking" className="btn-outline text-sm">
                + Новая запись
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
