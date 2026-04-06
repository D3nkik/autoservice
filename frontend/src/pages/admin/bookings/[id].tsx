import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi, AdminBookingUpdate } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatDate, formatTime, BOOKING_STATUSES } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

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
  car_brand?: string;
  car_model?: string;
  user?: { id: number; name: string; email: string };
}

interface Lift { id: number; name: string; is_active: boolean; }

const STATUS_ACTIONS: { status: AdminBookingUpdate['status']; label: string; cls: string; from: string[] }[] = [
  { status: 'confirmed', label: '✓ Подтвердить', cls: 'bg-blue-500 hover:bg-blue-600', from: ['new'] },
  { status: 'in_progress', label: '🔧 В работу', cls: 'bg-orange-500 hover:bg-orange-600', from: ['confirmed'] },
  { status: 'completed', label: '✅ Завершить', cls: 'bg-green-500 hover:bg-green-600', from: ['in_progress'] },
  { status: 'cancelled', label: '✕ Отменить', cls: 'bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30', from: ['new', 'confirmed'] },
];

export default function AdminBookingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const { register, handleSubmit, reset, getValues, formState: { isSubmitting } } = useForm<AdminBookingUpdate>();

  const load = async (bookingId: number) => {
    const [bRes, schedRes] = await Promise.all([
      adminApi.getBooking(bookingId),
      adminApi.getSchedule(new Date().toISOString().split('T')[0]),
    ]);
    setBooking(bRes.data);
    setLifts(schedRes.data.lifts || []);
    reset({
      lift_id: bRes.data.lift?.id,
      admin_notes: bRes.data.admin_notes || '',
      total_price: bRes.data.total_price,
      duration_hours: bRes.data.duration_hours || 1,
    });
  };

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    if (!id) return;
    load(Number(id));
  }, [id, router]);

  const onUpdate = async (data: AdminBookingUpdate) => {
    try {
      await adminApi.updateBooking(Number(id), data);
      toast.success('Заявка обновлена');
      await load(Number(id));
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  const setStatus = async (status: AdminBookingUpdate['status']) => {
    try {
      // Save current form values (lift, duration) together with status change
      const { lift_id, duration_hours } = getValues();
      await adminApi.updateBooking(Number(id), { status, lift_id, duration_hours });
      toast.success(`Статус: ${BOOKING_STATUSES[status!]?.label}`);
      await load(Number(id));
    } catch {
      toast.error('Ошибка');
    }
  };

  if (!booking) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const status = BOOKING_STATUSES[booking.status];

  return (
    <>
      <Head><title>Заявка #{booking.id} — АвтоСервис Admin</title></Head>
      <AdminLayout>
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/bookings" className="text-dark-300 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-xl font-bold">Заявка #{booking.id}</h1>
            <span className={`badge text-xs ${status?.color}`}>{status?.label}</span>
          </div>
          {/* Status buttons */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_ACTIONS.filter((a) => a.from.includes(booking.status)).map((action) => (
              <button
                key={action.status}
                onClick={() => setStatus(action.status)}
                className={`text-sm font-semibold py-2 px-4 rounded-xl transition-colors text-white ${action.cls}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Client */}
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Клиент
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-dark-300 text-xs mb-0.5">Имя</p>
                  <p className="text-white font-medium">{booking.client_name}</p>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-0.5">Телефон</p>
                  <a href={`tel:${booking.client_phone}`} className="text-primary-400 font-medium hover:text-primary-300">{booking.client_phone}</a>
                </div>
                {booking.client_email && (
                  <div className="col-span-2">
                    <p className="text-dark-300 text-xs mb-0.5">Email</p>
                    <a href={`mailto:${booking.client_email}`} className="text-primary-400 hover:text-primary-300">{booking.client_email}</a>
                  </div>
                )}
                {booking.user && (
                  <div className="col-span-2 pt-2 border-t border-dark-200">
                    <Link href={`/admin/clients/${booking.user.id}`} className="text-sm text-primary-400 hover:text-primary-300">
                      Профиль клиента в системе →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Booking info */}
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                </svg>
                Детали записи
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-dark-300 text-xs mb-0.5">Дата</p>
                  <p className="text-white font-medium">{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-0.5">Время</p>
                  <p className="text-white font-medium">{formatTime(booking.time_slot)}</p>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-0.5">Длительность</p>
                  <p className="text-white">{booking.duration_hours} ч.</p>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-0.5">Подъёмник</p>
                  <p className="text-white">{booking.lift?.name || 'Не назначен'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-dark-300 text-xs mb-0.5">Услуга</p>
                  <p className="text-white">{booking.service?.name || booking.custom_service || '—'}</p>
                </div>
                {(booking.car_brand || booking.car_model) && (
                  <div className="col-span-2">
                    <p className="text-dark-300 text-xs mb-0.5">Автомобиль</p>
                    <p className="text-white">{[booking.car_brand, booking.car_model].filter(Boolean).join(' ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: admin controls */}
          <div className="card">
            <h2 className="font-semibold mb-4">Управление</h2>
            <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Подъёмник</label>
                <select {...register('lift_id', { valueAsNumber: true })} className="input-field text-sm">
                  <option value="">Не назначен</option>
                  {lifts.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Длительность (ч.)</label>
                <select {...register('duration_hours', { valueAsNumber: true })} className="input-field text-sm">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>{h} ч.</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Итоговая стоимость (₽)</label>
                <input {...register('total_price', { valueAsNumber: true })} type="number" className="input-field text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Заметки</label>
                <textarea {...register('admin_notes')} className="input-field text-sm" rows={4} placeholder="Внутренние заметки..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-sm py-2.5 disabled:opacity-50">
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
