import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { TIME_SLOTS, BOOKING_STATUSES } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

interface ScheduleBooking {
  id: number;
  client_name: string;
  time_slot: string;
  duration_hours: number;
  status: keyof typeof BOOKING_STATUSES;
  service?: { name: string };
  custom_service?: string;
}

interface LiftSchedule {
  id: number;
  name: string;
  bookings: ScheduleBooking[];
}

interface QuickForm {
  date: string;
  time_slot: string;
  lift_id: number | null;
  lift_name: string;
  client_phone: string;
  client_name: string;
  client_email: string;
  custom_service: string;
  duration_hours: number;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  confirmed: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  in_progress: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  completed: 'bg-green-500/20 border-green-500/50 text-green-300',
  cancelled: 'bg-dark-200 border-dark-200 text-dark-300 opacity-50',
};

const EMPTY_FORM: QuickForm = {
  date: '', time_slot: '', lift_id: null, lift_name: '',
  client_phone: '', client_name: '', client_email: '',
  custom_service: '', duration_hours: 1,
};

export default function AdminSchedulePage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [lifts, setLifts] = useState<LiftSchedule[]>([]);
  const [unassigned, setUnassigned] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [serviceId, setServiceId] = useState('');

  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState<QuickForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [phoneSearching, setPhoneSearching] = useState(false);
  const phoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    adminApi.getServices().then((r) => setServices(r.data)).catch(() => {});
  }, [router]);

  const reload = () => {
    setLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    adminApi.getSchedule(dateStr)
      .then((res) => {
        setLifts(res.data.lifts || []);
        setUnassigned(res.data.unassigned || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [date]);

  // Pre-compute which (liftId, slotIndex) cells are "continuation" of a multi-hour booking
  // Those cells must NOT render a <td> because a rowSpan above covers them
  const continuationSet = new Set<string>(); // "liftId:slotIndex"
  for (const lift of lifts) {
    for (const b of lift.bookings) {
      const startIdx = TIME_SLOTS.indexOf(b.time_slot.slice(0, 5));
      if (startIdx === -1) continue;
      const span = Math.ceil(b.duration_hours);
      for (let i = 1; i < span; i++) {
        if (startIdx + i < TIME_SLOTS.length) {
          continuationSet.add(`${lift.id}:${startIdx + i}`);
        }
      }
    }
  }

  const getBookingAtSlot = (lift: LiftSchedule, slotIdx: number) =>
    lift.bookings.find((b) => TIME_SLOTS.indexOf(b.time_slot.slice(0, 5)) === slotIdx);

  const openDrawer = (slot: string, lift: LiftSchedule) => {
    setForm({ ...EMPTY_FORM, date: format(date, 'yyyy-MM-dd'), time_slot: slot, lift_id: lift.id, lift_name: lift.name });
    setServiceId('');
    setDrawer(true);
  };

  const setF = (k: keyof QuickForm, v: string | number | null) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onPhoneChange = (phone: string) => {
    setF('client_phone', phone);
    if (phoneTimer.current) clearTimeout(phoneTimer.current);
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;
    phoneTimer.current = setTimeout(async () => {
      setPhoneSearching(true);
      try {
        const r = await adminApi.getClients({ search: phone });
        const match = r.data.find((c: { phone: string; name: string; email: string }) =>
          c.phone.replace(/\D/g, '') === digits
        );
        if (match) {
          setForm((f) => ({ ...f, client_name: match.name, client_email: match.email || '' }));
          toast.success(`Клиент найден: ${match.name}`);
        }
      } finally {
        setPhoneSearching(false);
      }
    }, 600);
  };

  const onSubmit = async () => {
    if (!form.client_phone || !form.client_name) {
      toast.error('Укажите телефон и имя клиента');
      return;
    }
    setSaving(true);
    try {
      await adminApi.createBooking({
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email || undefined,
        service_id: serviceId && serviceId !== 'other' ? parseInt(serviceId) : undefined,
        custom_service: form.custom_service || undefined,
        date: form.date,
        time_slot: form.time_slot,
        duration_hours: form.duration_hours,
        lift_id: form.lift_id || undefined,
      });
      toast.success('Заявка создана');
      setDrawer(false);
      reload();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  // Row height per slot in pixels (used to calculate rowSpan height label)
  const SLOT_H = 44; // matches h-11 = 44px

  return (
    <>
      <Head><title>Расписание — АвтоСервис Admin</title></Head>
      <AdminLayout title="Расписание подъёмников">
        {/* Date nav */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={() => setDate((d) => subDays(d, 1))} className="w-9 h-9 rounded-xl bg-dark-100 border border-dark-200 flex items-center justify-center hover:border-primary-500/50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <span className="text-lg font-semibold capitalize min-w-[220px] text-center">
            {format(date, 'EEEE, d MMMM', { locale: ru })}
          </span>
          <button onClick={() => setDate((d) => addDays(d, 1))} className="w-9 h-9 rounded-xl bg-dark-100 border border-dark-200 flex items-center justify-center hover:border-primary-500/50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
          <button onClick={() => setDate(new Date())} className="text-sm text-primary-400 hover:text-primary-300 transition-colors ml-1">Сегодня</button>
          <div className="flex-1" />
          <p className="text-xs text-dark-300 hidden sm:block">Нажмите на свободную ячейку чтобы записать клиента</p>
        </div>

        {/* Legend */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(BOOKING_STATUSES).map(([key, val]) => (
            <span key={key} className={`badge text-xs border ${STATUS_COLORS[key]}`}>{val.label}</span>
          ))}
        </div>

        {loading ? (
          <div className="card animate-pulse h-64" />
        ) : (
          <div className="card p-0 overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-200 bg-dark-200/30">
                  <th className="px-3 py-3 text-left text-xs text-dark-300 font-medium w-16 border-r border-dark-200">Время</th>
                  {lifts.map((l) => (
                    <th key={l.id} className="px-3 py-3 text-center text-sm font-semibold border-r border-dark-200 last:border-r-0">
                      {l.name}
                    </th>
                  ))}
                  {unassigned.length > 0 && (
                    <th className="px-3 py-3 text-center text-sm font-semibold text-dark-300">Без подъёмника</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, slotIdx) => {
                  const unassignedAtSlot = unassigned.filter((b) => b.time_slot.slice(0, 5) === slot);
                  return (
                    <tr key={slot} className="border-t border-dark-200">
                      <td className="px-3 py-2 text-dark-300 font-mono text-xs border-r border-dark-200 align-top pt-3">{slot}</td>

                      {lifts.map((lift) => {
                        // Skip cell if covered by a rowSpan above
                        if (continuationSet.has(`${lift.id}:${slotIdx}`)) return null;

                        const booking = getBookingAtSlot(lift, slotIdx);
                        const rowSpan = booking ? Math.max(1, Math.ceil(booking.duration_hours)) : 1;
                        const cellH = rowSpan > 1 ? `${rowSpan * SLOT_H - 4}px` : undefined;

                        return (
                          <td
                            key={lift.id}
                            rowSpan={rowSpan}
                            className="px-2 py-1 border-r border-dark-200 last:border-r-0 align-top"
                            style={{ height: rowSpan === 1 ? `${SLOT_H}px` : undefined }}
                          >
                            {booking ? (
                              <Link
                                href={`/admin/bookings/${booking.id}`}
                                style={{ minHeight: cellH }}
                                className={`flex flex-col rounded-lg border px-2 py-1.5 text-xs leading-tight hover:opacity-80 transition ${STATUS_COLORS[booking.status]}`}
                              >
                                <p className="font-semibold truncate">{booking.client_name}</p>
                                <p className="truncate opacity-80 mt-0.5">{booking.service?.name || booking.custom_service}</p>
                                {booking.duration_hours > 1 && (
                                  <p className="mt-auto pt-1 opacity-60 text-[10px]">{booking.duration_hours} ч.</p>
                                )}
                              </Link>
                            ) : (
                              <button
                                onClick={() => openDrawer(slot, lift)}
                                className="h-full w-full min-h-[36px] rounded-lg bg-green-500/5 border border-green-500/10 hover:bg-primary-500/10 hover:border-primary-500/30 transition-colors group flex items-center justify-center"
                              >
                                <svg className="w-3 h-3 text-dark-300 group-hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {unassigned.length > 0 && (
                        <td className="px-2 py-1 align-top space-y-1" style={{ height: `${SLOT_H}px` }}>
                          {unassignedAtSlot.map((b) => (
                            <Link key={b.id} href={`/admin/bookings/${b.id}`}
                              className={`block rounded-lg border px-2 py-1 text-xs leading-tight hover:opacity-80 transition ${STATUS_COLORS[b.status]}`}
                            >
                              <p className="font-medium truncate">{b.client_name}</p>
                              <p className="truncate opacity-80">{b.service?.name || b.custom_service}</p>
                            </Link>
                          ))}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminLayout>

      {/* Quick-create drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="relative w-full max-w-md bg-dark-100 border-l border-dark-200 h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-200">
              <div>
                <h2 className="font-bold text-white">Новая запись</h2>
                <p className="text-xs text-dark-300 mt-0.5">
                  {form.lift_name} · {form.time_slot} · {format(date, 'd MMMM', { locale: ru })}
                </p>
              </div>
              <button onClick={() => setDrawer(false)} className="w-8 h-8 rounded-lg hover:bg-dark-200 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Телефон *
                  {phoneSearching && <span className="ml-2 text-xs text-primary-400">поиск...</span>}
                </label>
                <input type="tel" value={form.client_phone} onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="+7 (XXX) XXX-XX-XX" className="input-field text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Имя *</label>
                <input type="text" value={form.client_name} onChange={(e) => setF('client_name', e.target.value)}
                  placeholder="Иванов Иван" className="input-field text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                <input type="email" value={form.client_email} onChange={(e) => setF('client_email', e.target.value)}
                  placeholder="client@mail.ru" className="input-field text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Услуга</label>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input-field text-sm">
                  <option value="">— Другое —</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="other">Своё описание</option>
                </select>
              </div>

              {(!serviceId || serviceId === 'other') && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Описание работ</label>
                  <input type="text" value={form.custom_service} onChange={(e) => setF('custom_service', e.target.value)}
                    placeholder="Что нужно сделать..." className="input-field text-sm" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Длительность</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8].map((h) => (
                    <button key={h} type="button" onClick={() => setF('duration_hours', h)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-colors ${
                        form.duration_hours === h
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-dark-200/50 border-dark-200 text-dark-300 hover:text-white hover:border-dark-300'
                      }`}
                    >
                      {h}ч
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-dark-200 flex gap-3">
              <button onClick={() => setDrawer(false)}
                className="flex-1 py-2.5 rounded-xl border border-dark-200 text-sm font-medium hover:bg-dark-200/50 transition-colors">
                Отмена
              </button>
              <button onClick={onSubmit} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50">
                {saving ? 'Создание...' : 'Записать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
