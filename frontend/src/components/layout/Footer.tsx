import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-100 border-t border-dark-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <span className="text-lg font-bold">Авто<span className="text-primary-500">Движ</span></span>
            </Link>
            <p className="text-dark-300 text-sm leading-relaxed">
              Профессиональный автосервис в Симферополе. Качественный ремонт и обслуживание автомобилей любых марок.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="tel:+79782154898" className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center hover:bg-primary-500/20 transition-colors" aria-label="Позвонить">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </a>
              <a href="mailto:avtodvizh@mail.ru" className="w-10 h-10 rounded-xl bg-dark-200 flex items-center justify-center hover:bg-primary-500/20 transition-colors" aria-label="Email">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-white font-semibold mb-4">Услуги</p>
            <ul className="space-y-2.5 text-sm">
              {['Диагностика', 'ТО и замена масла', 'Ремонт ходовой', 'Тормозная система', 'Ремонт двигателя', 'Ремонт АКПП'].map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-dark-300 hover:text-primary-400 transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-white font-semibold mb-4">Навигация</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="text-dark-300 hover:text-white transition-colors">Главная</Link></li>
              <li><Link href="/services" className="text-dark-300 hover:text-white transition-colors">Услуги и цены</Link></li>
              <li><Link href="/booking" className="text-dark-300 hover:text-white transition-colors">Онлайн-запись</Link></li>
              <li><Link href="/contacts" className="text-dark-300 hover:text-white transition-colors">Контакты</Link></li>
              <li><Link href="/auth/login" className="text-dark-300 hover:text-white transition-colors">Личный кабинет</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-white font-semibold mb-4">Контакты</p>
            <div className="space-y-3 text-sm text-dark-300">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>ул. Беспалова, 70, Симферополь</span>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>ул. Ярославская, 1, Симферополь</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href="tel:+79782154898" className="hover:text-primary-400 transition-colors">+7 (978) 215-48-98</a>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href="tel:+79782240095" className="hover:text-primary-400 transition-colors">+7 (978) 224-00-95</a>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Пн–Сб: 09:00 – 18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-dark-200 py-5 px-4 text-center text-xs text-dark-300">
        © {new Date().getFullYear()} АвтоСервис. Все права защищены.
      </div>
    </footer>
  );
}
