import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
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

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
  confirmed: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  in_progress: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  completed: 'bg-green-500/20 border-green-500/50 text-green-300',
  cancelled: 'bg-dark-200 border-dark-200 text-dark-300 opacity-50',
};

export default function AdminSchedulePage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [lifts, setLifts] = useState<LiftSchedule[]>([]);
  const [unassigned, setUnassigned] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
  }, [router]);

  useEffect(() => {
    setLoading(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    adminApi.getSchedule(dateStr)
      .then((res) => {
        setLifts(res.data.lifts || []);
        setUnassigned(res.data.unassigned || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  const getBookingAtSlot = (lift: LiftSchedule, slot: string) =>
    lift.bookings.find((b) => b.time_slot.slice(0, 5) === slot);

  return (
    <>
      <Head><title>Расписание — АвтоДвиж Admin</title></Head>
      <AdminLayout title="Расписание подъёмников">
        {/* Date nav */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setDate((d) => subDays(d, 1))}
            className="w-9 h-9 rounded-xl bg-dark-100 border border-dark-200 flex items-center justify-center hover:border-primary-500/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-lg font-semibold capitalize min-w-[220px] text-center">
            {format(date, 'EEEE, d MMMM', { locale: ru })}
          </span>
          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            className="w-9 h-9 rounded-xl bg-dark-100 border border-dark-200 flex items-center justify-center hover:border-primary-500/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button onClick={() => setDate(new Date())} className="text-sm text-primary-400 hover:text-primary-300 transition-colors ml-1">
            Сегодня
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(BOOKING_STATUSES).map(([key, val]) => (
            <span key={key} className={`badge text-xs border ${STATUS_COLORS[key]}`}>{val.label}</span>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="card animate-pulse h-64" />
        ) : (
          <div className="card p-0 overflow-auto">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-200 bg-dark-200/30">
                  <th className="px-3 py-3 text-left text-xs text-dark-300 font-medium w-16 border-r border-dark-200">Время</th>
                  {lifts.map((l) => (
                    <th key={l.id} className="px-3 py-3 text-center text-sm font-semibold border-r border-dark-200">
                      {l.name}
                    </th>
                  ))}
                  {unassigned.length > 0 && (
                    <th className="px-3 py-3 text-center text-sm font-semibold text-dark-300">
                      Без подъёмника
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => {
                  const unassignedAtSlot = unassigned.filter((b) => b.time_slot.slice(0, 5) === slot);
                  return (
                    <tr key={slot} className="border-t border-dark-200">
                      <td className="px-3 py-2 text-dark-300 font-mono text-xs border-r border-dark-200">{slot}</td>
                      {lifts.map((lift) => {
                        const booking = getBookingAtSlot(lift, slot);
                        return (
                          <td key={lift.id} className="px-2 py-1 border-r border-dark-200 h-11">
                            {booking ? (
                              <Link
                                href={`/admin/bookings/${booking.id}`}
                                className={`block rounded-lg border px-2 py-1 text-xs leading-tight hover:opacity-80 transition ${STATUS_COLORS[booking.status]}`}
                              >
                                <p className="font-medium truncate">{booking.client_name}</p>
                                <p className="truncate opacity-80">{booking.service?.name || booking.custom_service}</p>
                              </Link>
                            ) : (
                              <div className="h-full w-full rounded-lg bg-green-500/5 border border-green-500/10" />
                            )}
                          </td>
                        );
                      })}
                      {unassigned.length > 0 && (
                        <td className="px-2 py-1 h-11 space-y-1">
                          {unassignedAtSlot.map((b) => (
                            <Link
                              key={b.id}
                              href={`/admin/bookings/${b.id}`}
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
    </>
  );
}
