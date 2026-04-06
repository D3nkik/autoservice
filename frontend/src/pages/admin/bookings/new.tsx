import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi, AdminCreateBookingPayload } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { TIME_SLOTS } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

interface Service { id: number; name: string; duration_hours: number; }
interface Lift { id: number; name: string; }
interface FoundClient { id: number; name: string; email: string; phone: string; car_brand?: string; car_model?: string; }

interface FormData extends AdminCreateBookingPayload {
  duration_hours: number;
}

export default function AdminNewBookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [foundClient, setFoundClient] = useState<FoundClient | null>(null);
  const [phoneSearching, setPhoneSearching] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { duration_hours: 1 },
  });

  const watchPhone = watch('client_phone');
  const watchDate = watch('date');

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    adminApi.getServices().then((r) => setServices(r.data));
    // Load lifts via schedule (today's date just to get lift list)
    adminApi.getSchedule(new Date().toISOString().split('T')[0]).then((r) => setLifts(r.data.lifts || []));
  }, [router]);

  // Search client by phone after 10+ digits entered
  useEffect(() => {
    const phone = (watchPhone || '').replace(/\D/g, '');
    if (phone.length < 10) { setFoundClient(null); return; }
    setPhoneSearching(true);
    adminApi.getClients({ search: watchPhone })
      .then((r) => {
        const match = (r.data as FoundClient[]).find((c) =>
          c.phone.replace(/\D/g, '') === phone
        );
        if (match) {
          setFoundClient(match);
          setValue('client_name', match.name);
          setValue('client_email', match.email);
          setValue('car_brand', match.car_brand || '');
          setValue('car_model', match.car_model || '');
        } else {
          setFoundClient(null);
        }
      })
      .finally(() => setPhoneSearching(false));
  }, [watchPhone, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await adminApi.createBooking(data);
      toast.success('Заявка создана');
      router.push('/admin/bookings');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Ошибка создания заявки');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Head><title>Новая заявка — АвтоСервис Admin</title></Head>
      <AdminLayout>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/bookings" className="text-dark-300 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Новая заявка</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Client info */}
            <div className="card space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Клиент
              </h2>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Телефон *
                  {phoneSearching && <span className="ml-2 text-xs text-dark-300">поиск...</span>}
                </label>
                <input
                  {...register('client_phone', { required: true })}
                  type="tel"
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="input-field text-sm"
                />
                {foundClient && (
                  <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                    Клиент найден: {foundClient.name} — данные заполнены автоматически
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Имя *</label>
                <input {...register('client_name', { required: true })} type="text" placeholder="Иванов Иван" className="input-field text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                <input {...register('client_email')} type="email" placeholder="client@example.com" className="input-field text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Марка авто</label>
                  <input {...register('car_brand')} type="text" placeholder="Toyota" className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Модель</label>
                  <input {...register('car_model')} type="text" placeholder="Corolla" className="input-field text-sm" />
                </div>
              </div>
            </div>

            {/* Booking details */}
            <div className="card space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                </svg>
                Детали записи
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Дата *</label>
                  <input
                    {...register('date', { required: true })}
                    type="date"
                    min={today}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Время *</label>
                  <select {...register('time_slot', { required: true })} className="input-field text-sm">
                    <option value="">Выберите время</option>
                    {TIME_SLOTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Услуга</label>
                <select {...register('service_id', { valueAsNumber: true })} className="input-field text-sm">
                  <option value="">— Другое / своя услуга —</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Своя услуга (если не выбрана выше)</label>
                <input {...register('custom_service')} type="text" placeholder="Описание работ..." className="input-field text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Длительность</label>
                  <select {...register('duration_hours', { valueAsNumber: true })} className="input-field text-sm">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8].map((h) => (
                      <option key={h} value={h}>{h} ч.</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Подъёмник</label>
                  <select {...register('lift_id', { valueAsNumber: true })} className="input-field text-sm">
                    <option value="">Не назначен</option>
                    {lifts.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3 justify-end">
            <Link href="/admin/bookings" className="bg-dark-100 border border-dark-200 hover:border-dark-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm inline-block">
              Отмена
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary px-8 py-2.5 text-sm disabled:opacity-50">
              {isSubmitting ? 'Создание...' : 'Создать заявку'}
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
