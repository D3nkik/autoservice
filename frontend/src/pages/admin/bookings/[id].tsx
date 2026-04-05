import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi, AdminBookingUpdate } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatDate, formatTime, BOOKING_STATUSES } from '@/lib/utils';

interface BookingDetail {
  id: number;
  client_name: string;
  client_phone: string;
  client_email?: string;
  date: string;
  time_slot: string;
  duration_hours: number;
  service?: { name: string };
  custom_service?: string;
  status: keyof typeof BOOKING_STATUSES;
  lift?: { id: number; name: string };
  admin_notes?: string;
  total_price?: number;
  user?: { id: number; name: string; email: string };
}

interface Lift { id: number; name: string; is_active: boolean; }

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<AdminBookingUpdate>();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    if (!id) return;
    Promise.all([
      adminApi.getBooking(Number(id)),
      adminApi.getSchedule(new Date().toISOString().split('T')[0]),
    ]).then(([bRes]) => {
      setBooking(bRes.data);
      reset({
        lift_id: bRes.data.lift?.id,
        admin_notes: bRes.data.admin_notes || '',
        total_price: bRes.data.total_price,
      });
    });
    // Fetch lifts list separately
    import('@/lib/api').then(({ servicesApi: _ }) => {
      adminApi.getSchedule(new Date().toISOString().split('T')[0]).then((r) => {
        const uniqueLifts: Lift[] = r.data.lifts || [];
        setLifts(uniqueLifts);
      });
    });
  }, [id, router, reset]);

  const onUpdate = async (data: AdminBookingUpdate) => {
    try {
      await adminApi.updateBooking(Number(id), data);
      toast.success('Заявка обновлена');
      const res = await adminApi.getBooking(Number(id));
      setBooking(res.data);
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  const setStatus = async (status: AdminBookingUpdate['status']) => {
    try {
      await adminApi.updateBooking(Number(id), { status });
      toast.success(`Статус изменён: ${BOOKING_STATUSES[status!]?.label}`);
      const res = await adminApi.getBooking(Number(id));
      setBooking(res.data);
    } catch {
      toast.error('Ошибка');
    }
  };

  if (!booking) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <>
      <Head><title>Заявка #{booking.id} — Админ</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark-DEFAULT text-white px-6 py-4">
          <Link href="/admin/bookings" className="text-sm hover:underline">← Все заявки</Link>
        </header>
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Заявка #{booking.id}</h1>
              <span className={`text-sm px-2 py-1 rounded-full font-medium mt-1 inline-block ${BOOKING_STATUSES[booking.status]?.color}`}>
                {BOOKING_STATUSES[booking.status]?.label}
              </span>
            </div>
            {/* Status action buttons */}
            <div className="flex gap-2 flex-wrap">
              {booking.status === 'new' && (
                <button onClick={() => setStatus('confirmed')} className="btn-primary text-sm">Подтвердить</button>
              )}
              {booking.status === 'confirmed' && (
                <button onClick={() => setStatus('in_progress')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">В работу</button>
              )}
              {booking.status === 'in_progress' && (
                <button onClick={() => setStatus('completed')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Завершить</button>
              )}
              {(booking.status === 'new' || booking.status === 'confirmed') && (
                <button onClick={() => setStatus('cancelled')} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Отменить</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client info */}
            <div className="card">
              <h2 className="font-semibold mb-3">Клиент</h2>
              <p><span className="text-gray-500">Имя:</span> {booking.client_name}</p>
              <p><span className="text-gray-500">Телефон:</span> {booking.client_phone}</p>
              {booking.client_email && <p><span className="text-gray-500">Email:</span> {booking.client_email}</p>}
              {booking.user && (
                <p className="mt-2">
                  <Link href={`/admin/clients/${booking.user.id}`} className="text-primary-500 hover:underline text-sm">
                    Профиль клиента →
                  </Link>
                </p>
              )}
            </div>

            {/* Booking info */}
            <div className="card">
              <h2 className="font-semibold mb-3">Запись</h2>
              <p><span className="text-gray-500">Дата:</span> {formatDate(booking.date)}</p>
              <p><span className="text-gray-500">Время:</span> {formatTime(booking.time_slot)}</p>
              <p><span className="text-gray-500">Длительность:</span> {booking.duration_hours} ч.</p>
              <p><span className="text-gray-500">Услуга:</span> {booking.service?.name || booking.custom_service || '—'}</p>
              <p><span className="text-gray-500">Подъёмник:</span> {booking.lift?.name || 'Не назначен'}</p>
            </div>
          </div>

          {/* Admin form */}
          <div className="card mt-6">
            <h2 className="font-semibold mb-4">Управление заявкой</h2>
            <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Подъёмник</label>
                <select {...register('lift_id', { valueAsNumber: true })} className="input-field">
                  <option value="">Не назначен</option>
                  {lifts.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Заметки администратора</label>
                <textarea {...register('admin_notes')} className="input-field" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Итоговая стоимость (₽)</label>
                <input {...register('total_price', { valueAsNumber: true })} type="number" className="input-field" />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
