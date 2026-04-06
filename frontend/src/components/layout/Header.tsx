import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, getStoredUser, clearTokens, clearUser } from '@/lib/auth';

export default function Header() {
  const router = useRouter();
  const [auth, setAuth] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
    setUserName(getStoredUser()?.name || '');
  }, []);

  const handleLogout = () => {
    clearTokens(); clearUser();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/services', label: 'Услуги и цены' },
    { href: '/booking', label: 'Запись' },
    { href: '/contacts', label: 'Контакты' },
  ];

  return (
    <header className="bg-dark-100/95 backdrop-blur-md border-b border-dark-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow-orange">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <span className="text-xl font-bold">
            Авто<span className="text-primary-500">Сервис</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === href
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-300 hover:text-white hover:bg-dark-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+79782154898" className="text-sm text-dark-300 hover:text-white transition-colors">
            +7 (978) 215-48-98
          </a>
          {auth ? (
            <>
              <Link
                href="/cabinet"
                className="flex items-center gap-2 text-sm font-medium text-white bg-dark-200 hover:bg-dark-300 px-4 py-2 rounded-xl transition"
              >
                <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {userName || 'Кабинет'}
              </Link>
              <button onClick={handleLogout} className="text-sm text-dark-300 hover:text-red-400 transition-colors">
                Выйти
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="btn-primary text-sm py-2 px-5">
              Войти
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 text-dark-300 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-200 bg-dark-100 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                router.pathname === href
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-300 hover:text-white hover:bg-dark-200'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-dark-200 mt-3 space-y-2">
            <a href="tel:+79782154898" className="block text-sm text-dark-300 px-4 py-2">
              +7 (978) 215-48-98
            </a>
            {auth ? (
              <>
                <Link href="/cabinet" onClick={() => setMobileOpen(false)} className="block px-4 py-3 bg-dark-200 rounded-xl text-sm font-medium text-white">
                  {userName || 'Личный кабинет'}
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-sm text-red-400">
                  Выйти
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block btn-primary text-sm text-center">
                Войти
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
