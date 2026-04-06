import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';

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
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    adminApi.getClients(params)
      .then((r) => setClients(r.data))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <Head><title>Клиенты — АвтоСервис Admin</title></Head>
      <AdminLayout title="Клиенты">
        <div className="relative max-w-sm mb-6">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            className="input-field pl-9 text-sm"
            placeholder="Поиск по имени, телефону, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : clients.length === 0 ? (
          <div className="card text-center py-12 text-dark-300">Клиенты не найдены</div>
        ) : (
          <div className="card p-0 overflow-hidden">
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-200 bg-dark-200/30">
                    {['Имя', 'Телефон', 'Email', 'Автомобиль', 'Записей', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-dark-300 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-dark-200/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                      <td className="px-4 py-3 text-dark-300">
                        <a href={`tel:${c.phone}`} className="hover:text-primary-400 transition-colors">{c.phone}</a>
                      </td>
                      <td className="px-4 py-3 text-dark-300 text-xs">{c.email}</td>
                      <td className="px-4 py-3 text-dark-300 text-sm">
                        {c.car_brand ? `${c.car_brand} ${c.car_model || ''}` : '—'}
                        {c.car_plate && <span className="ml-1 text-xs text-dark-200">{c.car_plate}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="badge bg-dark-200 text-dark-300 text-xs">{c._count?.bookings ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/clients/${c.id}`} className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                          Открыть →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden divide-y divide-dark-200">
              {clients.map((c) => (
                <Link key={c.id} href={`/admin/clients/${c.id}`} className="flex items-center justify-between px-4 py-4 hover:bg-dark-200/20 transition-colors">
                  <div>
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-dark-300 text-xs mt-0.5">{c.phone}</p>
                    {c.car_brand && <p className="text-dark-300 text-xs">{c.car_brand} {c.car_model}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-dark-200 text-dark-300 text-xs">{c._count?.bookings ?? 0}</span>
                    <svg className="w-4 h-4 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}
