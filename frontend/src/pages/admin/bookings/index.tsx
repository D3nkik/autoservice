import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatDate, formatTime, BOOKING_STATUSES } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

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
    // Pre-select filter from query
    if (router.query.status) setFilter(String(router.query.status));
  }, [router]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    adminApi.getBookings(params)
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, [filter, search]);

  return (
    <>
      <Head><title>Заявки — АвтоДвиж Admin</title></Head>
      <AdminLayout title="Заявки">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Link href="/admin/bookings/new" className="btn-primary text-sm py-2 px-4 flex items-center gap-2 self-start sm:self-auto whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Новая заявка
          </Link>
          <div className="relative flex-1 max-w-sm">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              className="input-field pl-9 text-sm"
              placeholder="Поиск по имени, телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  filter === s
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-dark-100 border-dark-200 text-dark-300 hover:text-white hover:border-dark-300'
                }`}
              >
                {s === 'all' ? 'Все' : BOOKING_STATUSES[s as keyof typeof BOOKING_STATUSES]?.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card animate-pulse h-16" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-12 text-dark-300">
            Заявки не найдены
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-200/30">
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium">№</th>
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium">Клиент</th>
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium">Дата / Время</th>
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium">Услуга</th>
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium">Подъёмник</th>
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium">Статус</th>
                    <th className="px-4 py-3 text-left text-xs text-dark-300 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {bookings.map((b) => {
                    const status = BOOKING_STATUSES[b.status];
                    return (
                      <tr key={b.id} className="hover:bg-dark-200/20 transition-colors">
                        <td className="px-4 py-3 text-dark-300 text-xs">#{b.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{b.client_name}</p>
                          <p className="text-dark-300 text-xs">{b.client_phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white">{formatDate(b.date)}</p>
                          <p className="text-dark-300 text-xs">{formatTime(b.time_slot)}</p>
                        </td>
                        <td className="px-4 py-3 text-dark-300 text-sm">{b.service?.name || b.custom_service || '—'}</td>
                        <td className="px-4 py-3 text-dark-300 text-sm">{b.lift?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${status?.color}`}>{status?.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/bookings/${b.id}`} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                            Открыть →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-dark-200">
              {bookings.map((b) => {
                const status = BOOKING_STATUSES[b.status];
                return (
                  <Link key={b.id} href={`/admin/bookings/${b.id}`} className="block px-4 py-4 hover:bg-dark-200/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge text-xs ${status?.color}`}>{status?.label}</span>
                          <span className="text-dark-300 text-xs">#{b.id}</span>
                        </div>
                        <p className="font-semibold text-white">{b.client_name}</p>
                        <p className="text-dark-300 text-xs mt-0.5">{b.client_phone}</p>
                        <p className="text-dark-300 text-xs mt-1">{formatDate(b.date)} в {formatTime(b.time_slot)}</p>
                      </div>
                      <svg className="w-4 h-4 text-dark-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
