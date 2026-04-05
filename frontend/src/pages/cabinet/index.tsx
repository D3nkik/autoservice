import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { meApi, UserProfile } from '@/lib/api';
import { isAuthenticated, getStoredUser, clearTokens, clearUser } from '@/lib/auth';

export default function CabinetPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    meApi.getProfile()
      .then((res) => setUser(res.data))
      .catch(() => router.push('/auth/login'));
  }, [router]);

  const handleLogout = () => {
    clearTokens(); clearUser();
    router.push('/');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <>
      <Head><title>Личный кабинет — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary-500">АвтоСервис</Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Выйти</button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto py-10 px-4">
          <h1 className="text-2xl font-bold mb-8">Личный кабинет</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { href: '/cabinet/bookings', label: 'Мои записи', desc: 'Активные и предстоящие визиты' },
              { href: '/cabinet/history', label: 'История обслуживания', desc: 'Все выполненные работы' },
              { href: '/cabinet/car', label: 'Мой автомобиль', desc: 'Марка, модель, год, госномер' },
              { href: '/cabinet/settings', label: 'Настройки профиля', desc: 'Email, телефон, пароль' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="card hover:shadow-lg transition-shadow">
                <h2 className="text-lg font-semibold mb-1">{item.label}</h2>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/booking" className="btn-primary">Записаться на сервис</Link>
          </div>
        </main>
      </div>
    </>
  );
}
