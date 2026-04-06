import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const services = [
  { icon: '🔧', name: 'Компьютерная диагностика', price: 'от 500 ₽', desc: 'Полная диагностика всех систем, проверка ошибок ЭБУ' },
  { icon: '🛢️', name: 'Техническое обслуживание', price: 'от 2 000 ₽', desc: 'Замена масла, фильтров, проверка всех систем' },
  { icon: '🚗', name: 'Ремонт ходовой части', price: 'от 500 ₽', desc: 'Амортизаторы, рычаги, шаровые опоры, рулевые тяги' },
  { icon: '🛞', name: 'Тормозная система', price: 'от 600 ₽', desc: 'Колодки, диски, суппорты, тормозная жидкость' },
  { icon: '⚙️', name: 'Ремонт двигателя', price: 'от 3 000 ₽', desc: 'Диагностика и ремонт любой сложности, ГРМ' },
  { icon: '🔩', name: 'Ремонт АКПП', price: 'от 5 000 ₽', desc: 'АКПП, DSG, вариаторы — гарантия 6 месяцев' },
];

const advantages = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Гарантия на работы',
    desc: 'Даём официальную гарантию на все выполненные работы. На ремонт АКПП — 6 месяцев.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: 'Современное оборудование',
    desc: '4 профессиональных подъёмника, компьютерная диагностика, 3D-развал-схождение.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Опытные мастера',
    desc: 'Квалифицированные специалисты с опытом 10+ лет. Подробно объясним каждый этап ремонта.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Честные цены',
    desc: 'Прозрачное ценообразование — цена озвучивается до начала работ. Без скрытых доплат.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Онлайн-запись 24/7',
    desc: 'Записывайтесь в удобное время через сайт. Подтверждение записи за 15 минут.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
      </svg>
    ),
    title: 'Зона ожидания с Wi-Fi',
    desc: 'Комфортная зона ожидания с бесплатным Wi-Fi, пока ваш автомобиль обслуживается.',
  },
];

const reviews = [
  { name: 'Наталья К.', text: 'Качественно и быстро! Делала диагностику и замену колодок — всё объяснили, показали, цена соответствует. Рекомендую!', rating: 5 },
  { name: 'Юрий М.', text: 'Отличный подход к клиентам, вежливые мастера. Ремонтировал подвеску — работают профессионально, всё сделали в срок.', rating: 5 },
  { name: 'Александр П.', text: 'Езжу сюда уже несколько лет. Ни разу не подвели. Честные цены и хорошее качество — что ещё нужно?', rating: 5 },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>АвтоСервис — Профессиональный автосервис в Симферополе</title>
        <meta name="description" content="Профессиональный ремонт автомобилей в Симферополе. Диагностика, ТО, ходовая, АКПП, двигатель. Онлайн-запись." />
      </Head>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-32 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark-200" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(8,145,178,0.1),transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                Симферополь — 2 точки обслуживания
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                Ваш автомобиль<br />
                в надёжных руках
              </h1>
              <p className="text-dark-300 text-xl mb-10 leading-relaxed max-w-2xl">
                Профессиональный ремонт и обслуживание автомобилей любых марок. Честные цены, гарантия на работы, опытные мастера.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking" className="btn-primary text-base px-8 py-4 text-center">
                  Записаться онлайн
                </Link>
                <Link href="/services" className="btn-outline text-base px-8 py-4 text-center">
                  Услуги и цены
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-dark-300">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  4 подъёмника
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Пн–Сб 09:00–18:00
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Гарантия на работы
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-dark-100 border-y border-dark-200 py-8 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10+', label: 'лет на рынке' },
              { value: '5000+', label: 'довольных клиентов' },
              { value: '4', label: 'подъёмника' },
              { value: '6 мес', label: 'гарантия на АКПП' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-primary-400">{s.value}</p>
                <p className="text-dark-300 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Наши услуги</h2>
              <p className="section-subtitle">Полный спектр ремонта и обслуживания автомобилей</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <div key={s.name} className="card-hover group">
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{s.name}</h3>
                  <p className="text-dark-300 text-sm mb-4 leading-relaxed">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-400 font-bold text-lg">{s.price}</span>
                    <Link href={`/booking`} className="text-sm text-dark-300 group-hover:text-primary-400 transition-colors flex items-center gap-1">
                      Записаться
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/services" className="btn-outline">Полный прайс-лист</Link>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-20 px-4 bg-dark-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Почему выбирают нас</h2>
              <p className="section-subtitle">Мы работаем так, чтобы вы возвращались и рекомендовали нас друзьям</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {advantages.map((a) => (
                <div key={a.title} className="card">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-4">
                    {a.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{a.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500/20 via-dark-100 to-brand-600/20 border border-dark-200 p-10 md:p-14 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1),transparent_70%)]" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Запишитесь прямо сейчас</h2>
                <p className="text-dark-300 text-lg mb-8">
                  Оставьте заявку онлайн — свяжемся и подтвердим время за 15 минут
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/booking" className="btn-primary text-base px-10 py-4 w-full sm:w-auto text-center">
                    Онлайн-запись
                  </Link>
                  <a href="tel:+79782154898" className="btn-outline text-base px-10 py-4 w-full sm:w-auto text-center">
                    Позвонить
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-20 px-4 bg-dark-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Отзывы клиентов</h2>
              <p className="section-subtitle">Нам доверяют сотни автовладельцев Симферополя</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <div key={r.name} className="card">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-dark-300 text-sm leading-relaxed mb-4">{r.text}</p>
                  <p className="text-white font-medium text-sm">{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contacts strip */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-1">Телефон</p>
                  <a href="tel:+79782154898" className="text-white font-semibold hover:text-primary-400 transition-colors">+7 (978) 215-48-98</a>
                  <br />
                  <a href="tel:+79782240095" className="text-white font-semibold hover:text-primary-400 transition-colors">+7 (978) 224-00-95</a>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-1">Адреса</p>
                  <p className="text-white font-semibold text-sm">ул. Беспалова, 70</p>
                  <p className="text-white font-semibold text-sm">ул. Ярославская, 1</p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-300 text-xs mb-1">Режим работы</p>
                  <p className="text-white font-semibold">Пн–Сб: 09:00 – 18:00</p>
                  <p className="text-dark-300 text-sm">Воскресенье — выходной</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
