import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi, UserProfile } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatDate, BOOKING_STATUSES } from '@/lib/utils';

interface ClientDetail extends UserProfile {
  bookings: Array<{
    id: number; date: string; time_slot: string;
    status: keyof typeof BOOKING_STATUSES;
    service?: { name: string }; custom_service?: string;
  }>;
  service_history: Array<{
    id: number; service_name: string; price?: number; completed_at: string; mileage?: number;
  }>;
}

export default function AdminClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [client, setClient] = useState<ClientDetail | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    if (!id) return;
    adminApi.getClient(Number(id)).then((r) => setClient(r.data));
  }, [id, router]);

  if (!client) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <>
      <Head><title>{client.name} — Клиент</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark text-white px-6 py-4">
          <Link href="/admin/clients" className="text-sm hover:underline">← Все клиенты</Link>
        </header>
        <main className="max-w-5xl mx-auto py-8 px-4 space-y-8">
          {/* Profile */}
          <div className="card">
            <h1 className="text-xl font-bold mb-4">{client.name}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-500">Телефон</p><p className="font-medium">{client.phone}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{client.email}</p></div>
              <div><p className="text-gray-500">Автомобиль</p><p className="font-medium">{client.car_brand} {client.car_model}</p></div>
              <div><p className="text-gray-500">Госномер</p><p className="font-medium">{client.car_plate || '—'}</p></div>
            </div>
          </div>

          {/* Active bookings */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Активные записи</h2>
            <div className="space-y-2">
              {client.bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').map((b) => (
                <div key={b.id} className="card flex items-center justify-between text-sm">
                  <span>{b.service?.name || b.custom_service} — {formatDate(b.date)}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${BOOKING_STATUSES[b.status]?.color}`}>
                      {BOOKING_STATUSES[b.status]?.label}
                    </span>
                    <Link href={`/admin/bookings/${b.id}`} className="text-primary-500 hover:underline">→</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div>
            <h2 className="font-semibold text-lg mb-3">История обслуживания</h2>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Услуга</th>
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Пробег</th>
                    <th className="px-4 py-2 text-left">Стоимость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {client.service_history.map((h) => (
                    <tr key={h.id}>
                      <td className="px-4 py-2">{h.service_name}</td>
                      <td className="px-4 py-2 text-gray-500">{formatDate(h.completed_at)}</td>
                      <td className="px-4 py-2 text-gray-500">{h.mileage ? `${h.mileage.toLocaleString()} км` : '—'}</td>
                      <td className="px-4 py-2 font-medium text-primary-500">{h.price ? `${h.price.toLocaleString()} ₽` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {client.service_history.length === 0 && <p className="text-center text-gray-400 py-6">История пуста</p>}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
