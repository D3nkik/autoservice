import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { servicesApi, slotsApi, bookingsApi, ServicePayload } from '@/lib/api';
import { TIME_SLOTS } from '@/lib/utils';
import { format } from 'date-fns';

const schema = z.object({
  client_name: z.string().min(2, 'Введите имя'),
  client_phone: z.string().min(10, 'Введите телефон'),
  client_email: z.string().email('Некорректный email').optional().or(z.literal('')),
  service_id: z.string().optional(),
  custom_service: z.string().optional(),
  date: z.string().min(1, 'Выберите дату'),
  time_slot: z.string().min(1, 'Выберите время'),
  car_brand: z.string().optional(),
  car_model: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Service extends ServicePayload { id: number; }

export default function BookingForm() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service_id: '', time_slot: '' },
  });

  const selectedServiceId = watch('service_id');
  const selectedDate = watch('date');
  const selectedSlot = watch('time_slot');
  const isOther = selectedServiceId === 'other';

  useEffect(() => {
    if (router.query.service) setValue('service_id', String(router.query.service));
  }, [router.query.service, setValue]);

  useEffect(() => {
    servicesApi.list().then((r) => setServices(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setValue('time_slot', '');
    slotsApi.available(selectedDate)
      .then((r) => setAvailableSlots(r.data.available_slots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await bookingsApi.create({
        ...data,
        service_id: data.service_id && data.service_id !== 'other' ? parseInt(data.service_id) : undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error('Ошибка при отправке заявки. Попробуйте снова.');
    }
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');

  if (submitted) {
    return (
      <div className="card text-center py-14">
        <div className="w-16 h-16 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3">Заявка принята!</h2>
        <p className="text-dark-300 mb-8 max-w-sm mx-auto">Мы свяжемся с вами в течение 15 минут для подтверждения записи.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setSubmitted(false)} className="btn-outline">Ещё одна запись</button>
          <a href="/" className="btn-primary">На главную</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      <h2 className="text-xl font-bold mb-1">Заполните форму</h2>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Имя <span className="text-primary-400">*</span></label>
          <input {...register('client_name')} className="input-field" placeholder="Иван Иванов" />
          {errors.client_name && <p className="text-red-400 text-sm mt-1">{errors.client_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Телефон <span className="text-primary-400">*</span></label>
          <input {...register('client_phone')} className="input-field" type="tel" placeholder="+7 (999) 999-99-99" />
          {errors.client_phone && <p className="text-red-400 text-sm mt-1">{errors.client_phone.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1.5">
          Email <span className="text-dark-200 text-xs font-normal">(необязательно — для уведомлений)</span>
        </label>
        <input {...register('client_email')} className="input-field" type="email" placeholder="ivan@example.com" />
        {errors.client_email && <p className="text-red-400 text-sm mt-1">{errors.client_email.message}</p>}
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1.5">Услуга <span className="text-primary-400">*</span></label>
        <select {...register('service_id')} className="input-field">
          <option value="">Выберите услугу</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="other">Другое</option>
        </select>
      </div>

      {isOther && (
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Опишите задачу <span className="text-primary-400">*</span></label>
          <textarea {...register('custom_service')} className="input-field" rows={3} placeholder="Опишите что нужно сделать..." />
        </div>
      )}

      {/* Car */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Марка авто</label>
          <input {...register('car_brand')} className="input-field" placeholder="Toyota" />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Модель</label>
          <input {...register('car_model')} className="input-field" placeholder="Camry" />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1.5">Дата <span className="text-primary-400">*</span></label>
        <input {...register('date')} type="date" className="input-field" min={minDate} />
        {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-3">Время <span className="text-primary-400">*</span></label>
          {loadingSlots ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-dark-200 animate-pulse" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              На эту дату нет свободного времени — попробуйте другую дату
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const available = availableSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <label
                    key={slot}
                    className={`text-center py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                      !available
                        ? 'border-dark-200 bg-dark-200/30 text-dark-300 cursor-not-allowed opacity-40'
                        : isSelected
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-dark-200 hover:border-primary-500/50 hover:bg-primary-500/10 text-white'
                    }`}
                  >
                    <input {...register('time_slot')} type="radio" value={slot} disabled={!available} className="sr-only" />
                    {slot}
                  </label>
                );
              })}
            </div>
          )}
          {errors.time_slot && <p className="text-red-400 text-sm mt-2">{errors.time_slot.message}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Отправка...
          </span>
        ) : 'Отправить заявку'}
      </button>
    </form>
  );
}
