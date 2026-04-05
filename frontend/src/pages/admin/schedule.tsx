import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { TIME_SLOTS, BOOKING_STATUSES } from '@/lib/utils';

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
  new: 'bg-yellow-200 border-yellow-400',
  confirmed: 'bg-blue-200 border-blue-400',
  in_progress: 'bg-orange-200 border-orange-400',
  completed: 'bg-green-200 border-green-400',
  cancelled: 'bg-gray-100 border-gray-300 opacity-50',
};

export default function AdminSchedulePage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [lifts, setLifts] = useState<LiftSchedule[]>([]);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
  }, [router]);

  useEffect(() => {
    const dateStr = format(date, 'yyyy-MM-dd');
    adminApi.getSchedule(dateStr)
      .then((res) => setLifts(res.data.lifts || []))
      .catch(console.error);
  }, [date]);

  const getBookingAtSlot = (lift: LiftSchedule, slot: string) => {
    return lift.bookings.find((b) => {
      const bTime = b.time_slot.slice(0, 5);
      return bTime === slot;
    });
  };

  return (
    <>
      <Head><title>Расписание — Админ</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark-DEFAULT text-white px-6 py-4 flex gap-6 items-center">
          <Link href="/admin" className="text-primary-500 font-bold">← Дашборд</Link>
          <h1 className="text-lg font-semibold">Расписание подъёмников</h1>
        </header>
        <main className="max-w-7xl mx-auto py-8 px-4">
          {/* Date nav */}
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setDate((d) => subDays(d, 1))} className="btn-outline px-3 py-1.5 text-sm">←</button>
            <span className="text-lg font-semibold">{format(date, 'EEEE, d MMMM yyyy', { locale: ru })}</span>
            <button onClick={() => setDate((d) => addDays(d, 1))} className="btn-outline px-3 py-1.5 text-sm">→</button>
            <button onClick={() => setDate(new Date())} className="text-sm text-primary-500 hover:underline ml-2">Сегодня</button>
          </div>

          {/* Legend */}
          <div className="flex gap-3 mb-4 flex-wrap text-xs">
            {Object.entries(BOOKING_STATUSES).map(([key, val]) => (
              <span key={key} className={`px-2 py-1 rounded border font-medium ${STATUS_COLORS[key]}`}>{val.label}</span>
            ))}
          </div>

          {/* Grid */}
          <div className="bg-white rounded-xl shadow overflow-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-gray-500 w-20 border-r">Время</th>
                  {lifts.map((l) => (
                    <th key={l.id} className="px-4 py-3 text-center font-semibold border-r last:border-r-0">{l.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="border-t">
                    <td className="px-4 py-2 text-gray-400 font-mono border-r">{slot}</td>
                    {lifts.map((lift) => {
                      const booking = getBookingAtSlot(lift, slot);
                      return (
                        <td key={lift.id} className="px-2 py-1 border-r last:border-r-0 h-12">
                          {booking ? (
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className={`block rounded border px-2 py-1 text-xs leading-tight hover:opacity-80 transition ${STATUS_COLORS[booking.status]}`}
                            >
                              <p className="font-medium truncate">{booking.client_name}</p>
                              <p className="text-gray-600 truncate">{booking.service?.name || booking.custom_service}</p>
                            </Link>
                          ) : (
                            <div className="h-full w-full rounded bg-green-50 border border-green-100" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
