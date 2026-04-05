import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { servicesApi, slotsApi, bookingsApi, ServicePayload } from '@/lib/api';
import { TIME_SLOTS } from '@/lib/utils';
import { format, addDays } from 'date-fns';

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
  const isOther = selectedServiceId === 'other';

  // Pre-select service from query param
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

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  if (submitted) {
    return (
      <div className="card text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-3">Заявка принята!</h2>
        <p className="text-gray-600 mb-6">Мы свяжемся с вами для подтверждения записи.</p>
        <button onClick={() => setSubmitted(false)} className="btn-outline mr-3">Ещё одна запись</button>
        <a href="/" className="btn-primary">На главную</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Имя <span className="text-red-500">*</span></label>
        <input {...register('client_name')} className="input-field" placeholder="Иван Иванов" />
        {errors.client_name && <p className="text-red-500 text-sm mt-1">{errors.client_name.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">Телефон <span className="text-red-500">*</span></label>
        <input {...register('client_phone')} className="input-field" type="tel" placeholder="+7 (999) 999-99-99" />
        {errors.client_phone && <p className="text-red-500 text-sm mt-1">{errors.client_phone.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email <span className="text-gray-400 text-xs">(необязательно)</span></label>
        <input {...register('client_email')} className="input-field" type="email" placeholder="ivan@example.com" />
        {errors.client_email && <p className="text-red-500 text-sm mt-1">{errors.client_email.message}</p>}
      </div>

      {/* Service */}
      <div>
        <label className="block text-sm font-medium mb-1">Услуга <span className="text-red-500">*</span></label>
        <select {...register('service_id')} className="input-field">
          <option value="">Выберите услугу</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="other">Другое</option>
        </select>
      </div>

      {/* Custom service */}
      {isOther && (
        <div>
          <label className="block text-sm font-medium mb-1">Опишите задачу <span className="text-red-500">*</span></label>
          <textarea {...register('custom_service')} className="input-field" rows={3} placeholder="Опишите что нужно сделать" />
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium mb-1">Желаемая дата <span className="text-red-500">*</span></label>
        <input {...register('date')} type="date" className="input-field" min={minDate} />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium mb-2">Время <span className="text-red-500">*</span></label>
          {loadingSlots ? (
            <p className="text-gray-400 text-sm">Загрузка доступного времени...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-red-500 text-sm">К сожалению, на эту дату нет свободного времени</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const available = availableSlots.includes(slot);
                return (
                  <label key={slot} className={`text-center py-2 rounded-lg border text-sm cursor-pointer transition ${
                    available
                      ? 'border-gray-300 hover:border-primary-500 hover:bg-primary-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-500 has-[:checked]:text-white'
                      : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}>
                    <input {...register('time_slot')} type="radio" value={slot} disabled={!available} className="sr-only" />
                    {slot}
                  </label>
                );
              })}
            </div>
          )}
          {errors.time_slot && <p className="text-red-500 text-sm mt-1">{errors.time_slot.message}</p>}
        </div>
      )}

      {/* Car */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Марка авто</label>
          <input {...register('car_brand')} className="input-field" placeholder="Toyota" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Модель</label>
          <input {...register('car_model')} className="input-field" placeholder="Camry" />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
        {isSubmitting ? 'Отправка...' : 'Записаться'}
      </button>
    </form>
  );
}
