import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatDate, formatTime, BOOKING_STATUSES } from '@/lib/utils';

interface Booking {
  id: number;
  client_name: string;
  client_phone: string;
  date: string;
  time_slot: string;
  service?: { name: string };
  custom_service?: string;
  status: keyof typeof BOOKING_STATUSES;
  lift?: { name: string };
}

const STATUS_FILTERS = ['all', 'new', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    const params: Record<string, string> = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    adminApi.getBookings(params)
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, [router, filter, search]);

  return (
    <>
      <Head><title>Заявки — Админ</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark-DEFAULT text-white px-6 py-4 flex gap-6 items-center">
          <Link href="/admin" className="text-xl font-bold text-primary-500">← Дашборд</Link>
          <h1 className="text-lg font-semibold">Управление заявками</h1>
        </header>
        <main className="max-w-6xl mx-auto py-8 px-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              className="input-field max-w-xs"
              placeholder="Поиск по имени, телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    filter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {s === 'all' ? 'Все' : BOOKING_STATUSES[s as keyof typeof BOOKING_STATUSES]?.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500">Загрузка...</p>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">№</th>
                    <th className="px-4 py-3 text-left">Клиент</th>
                    <th className="px-4 py-3 text-left">Дата / Время</th>
                    <th className="px-4 py-3 text-left">Услуга</th>
                    <th className="px-4 py-3 text-left">Подъёмник</th>
                    <th className="px-4 py-3 text-left">Статус</th>
                    <th className="px-4 py-3 text-left">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">#{b.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{b.client_name}</p>
                        <p className="text-gray-400">{b.client_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(b.date)}<br />
                        <span className="text-gray-400">{formatTime(b.time_slot)}</span>
                      </td>
                      <td className="px-4 py-3">{b.service?.name || b.custom_service || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{b.lift?.name || 'Не назначен'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUSES[b.status]?.color}`}>
                          {BOOKING_STATUSES[b.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/bookings/${b.id}`} className="text-primary-500 hover:underline text-sm">
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <p className="text-center text-gray-500 py-10">Заявки не найдены</p>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
