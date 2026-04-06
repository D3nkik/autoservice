import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import AdminLayout from '@/components/layout/AdminLayout';

interface DashboardData {
  todayBookings: number;
  newBookings: number;
  liftsLoad: { lift_id: number; name: string; used: number; total: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    adminApi.getDashboard().then((res) => setData(res.data)).catch(console.error);
  }, [router]);

  return (
    <>
      <Head><title>Дашборд — АвтоСервис Admin</title></Head>
      <AdminLayout title="Дашборд">
        {!data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="card text-center">
                <p className="text-4xl font-black text-primary-400">{data.todayBookings}</p>
                <p className="text-dark-300 text-sm mt-2">Записей сегодня</p>
              </div>
              <div className="card text-center">
                <p className="text-4xl font-black text-yellow-400">{data.newBookings}</p>
                <p className="text-dark-300 text-sm mt-2">Необработанных</p>
                {data.newBookings > 0 && (
                  <Link href="/admin/bookings?status=new" className="text-xs text-primary-400 hover:underline mt-1 inline-block">
                    Посмотреть →
                  </Link>
                )}
              </div>
              <div className="card text-center">
                <p className="text-4xl font-black text-green-400">4</p>
                <p className="text-dark-300 text-sm mt-2">Подъёмника</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Загрузка подъёмников сегодня</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {data.liftsLoad.map((l) => {
                const pct = l.total > 0 ? Math.round((l.used / l.total) * 100) : 0;
                return (
                  <div key={l.lift_id} className="card text-center">
                    <p className="font-semibold text-sm mb-3">{l.name}</p>
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke="#f97316" strokeWidth="3"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
                    </div>
                    <p className="text-xs text-dark-300">{l.used}/{l.total} слотов</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { href: '/admin/bookings', label: 'Все заявки', icon: '📋', desc: 'Просмотр и управление' },
                { href: '/admin/schedule', label: 'Расписание', icon: '📅', desc: 'Сетка по подъёмникам' },
                { href: '/admin/clients', label: 'Клиенты', icon: '👥', desc: 'База клиентов' },
                { href: '/admin/services', label: 'Услуги', icon: '🔧', desc: 'Управление прайсом' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="card-hover flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-dark-300 text-xs">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
}
