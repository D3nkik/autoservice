import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  car_brand?: string;
  car_model?: string;
  car_plate?: string;
  _count?: { bookings: number };
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
  }, [router]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    adminApi.getClients(params)
      .then((r) => setClients(r.data))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <Head><title>Клиенты — Админ</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark-DEFAULT text-white px-6 py-4 flex gap-6 items-center">
          <Link href="/admin" className="text-primary-500 font-bold">← Дашборд</Link>
          <h1 className="text-lg font-semibold">Клиенты</h1>
        </header>
        <main className="max-w-5xl mx-auto py-8 px-4">
          <input
            className="input-field max-w-sm mb-6"
            placeholder="Поиск по имени, телефону, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading ? (
            <p className="text-gray-500">Загрузка...</p>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Имя</th>
                    <th className="px-4 py-3 text-left">Телефон</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Автомобиль</th>
                    <th className="px-4 py-3 text-left">Записей</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                      <td className="px-4 py-3 text-gray-500">{c.email}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.car_brand ? `${c.car_brand} ${c.car_model || ''}` : '—'}
                        {c.car_plate && <span className="ml-1 text-xs text-gray-400">{c.car_plate}</span>}
                      </td>
                      <td className="px-4 py-3">{c._count?.bookings ?? 0}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/clients/${c.id}`} className="text-primary-500 hover:underline text-sm">
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {clients.length === 0 && <p className="text-center text-gray-500 py-10">Клиенты не найдены</p>}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
