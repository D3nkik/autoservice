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
}

export default function CabinetBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    meApi.getBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCancel = async (id: number) => {
    if (!confirm('Отменить запись?')) return;
    try {
      await meApi.cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success('Запись отменена');
    } catch {
      toast.error('Не удалось отменить запись');
    }
  };

  return (
    <>
      <Head><title>Мои записи — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Мои записи</h1>
            <Link href="/cabinet" className="text-sm text-gray-500 hover:underline">← Назад</Link>
          </div>
          {loading ? (
            <p className="text-gray-500">Загрузка...</p>
          ) : bookings.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">У вас пока нет активных записей</p>
              <Link href="/booking" className="btn-primary">Записаться</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.service?.name || b.custom_service || 'Другое'}</p>
                    <p className="text-gray-500 text-sm">{formatDate(b.date)}, {formatTime(b.time_slot)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUSES[b.status]?.color}`}>
                      {BOOKING_STATUSES[b.status]?.label}
                    </span>
                    {(b.status === 'new' || b.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
