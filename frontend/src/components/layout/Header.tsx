import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAuthenticated, getStoredUser, clearTokens, clearUser } from '@/lib/auth';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setAuth(isAuthenticated());
    setUserName(getStoredUser()?.name || '');
  }, []);

  const handleLogout = () => {
    clearTokens(); clearUser();
    router.push('/');
  };

  return (
    <header className="bg-dark-DEFAULT text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Авто<span className="text-primary-500">Сервис</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary-400 transition-colors">Главная</Link>
          <Link href="/services" className="hover:text-primary-400 transition-colors">Услуги</Link>
          <Link href="/booking" className="hover:text-primary-400 transition-colors">Запись</Link>
          <Link href="/contacts" className="hover:text-primary-400 transition-colors">Контакты</Link>
        </nav>
        <div className="flex items-center gap-3">
          {auth ? (
            <>
              <Link href="/cabinet" className="text-sm hover:text-primary-400">{userName || 'Кабинет'}</Link>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400">Выйти</button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary text-sm">Войти</Link>
          )}
        </div>
      </div>
    </header>
  );
}
