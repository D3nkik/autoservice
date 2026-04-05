import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';

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
      <Head><title>Дашборд — Админ</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark-DEFAULT text-white px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold">АвтоСервис <span className="text-primary-500">Admin</span></span>
          <nav className="flex gap-6 text-sm">
            <Link href="/admin" className="hover:text-primary-400">Дашборд</Link>
            <Link href="/admin/bookings" className="hover:text-primary-400">Заявки</Link>
            <Link href="/admin/schedule" className="hover:text-primary-400">Расписание</Link>
            <Link href="/admin/clients" className="hover:text-primary-400">Клиенты</Link>
            <Link href="/admin/services" className="hover:text-primary-400">Услуги</Link>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold mb-8">Дашборд</h1>
          {data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="card text-center">
                  <p className="text-4xl font-bold text-primary-500">{data.todayBookings}</p>
                  <p className="text-gray-500 mt-1">Записей сегодня</p>
                </div>
                <div className="card text-center">
                  <p className="text-4xl font-bold text-yellow-500">{data.newBookings}</p>
                  <p className="text-gray-500 mt-1">Необработанных</p>
                </div>
                <div className="card text-center">
                  <p className="text-4xl font-bold text-green-500">4</p>
                  <p className="text-gray-500 mt-1">Подъёмников</p>
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-4">Загрузка подъёмников сегодня</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.liftsLoad.map((l) => (
                  <div key={l.lift_id} className="card text-center">
                    <p className="font-medium text-sm mb-2">{l.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-primary-500 h-3 rounded-full"
                        style={{ width: `${(l.used / l.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{l.used}/{l.total} слотов</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Загрузка...</p>
          )}
        </main>
      </div>
    </>
  );
}
