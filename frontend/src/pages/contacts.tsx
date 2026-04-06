import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function ContactsPage() {
  return (
    <>
      <Head>
        <title>Контакты — АвтоСервис Симферополь</title>
        <meta name="description" content="Контакты автосервиса АвтоСервис в Симферополе. Адреса, телефоны, режим работы." />
      </Head>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-14 px-4 bg-dark-100 border-b border-dark-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Контакты</h1>
            <p className="text-dark-300 text-lg">Два удобных расположения в Симферополе</p>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Location 1 */}
              <div className="card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-lg font-semibold">ул. Беспалова, 70</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-dark-300">г. Симферополь, ул. Беспалова, 70</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-dark-300">Пн–Сб: 09:00 – 18:00, Вс: выходной</span>
                  </div>
                </div>
              </div>

              {/* Location 2 */}
              <div className="card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-semibold">ул. Ярославская, 1</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-dark-300">г. Симферополь, ул. Ярославская, 1 (рядом с гостиницей «Таврия»)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-dark-300">Пн–Сб: 09:00 – 18:00, Вс: выходной</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phones and details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              <div className="card">
                <p className="text-dark-300 text-xs mb-2">Телефоны</p>
                <a href="tel:+79782154898" className="text-xl font-bold text-white hover:text-primary-400 transition-colors block">+7 (978) 215-48-98</a>
                <a href="tel:+79782240095" className="text-xl font-bold text-white hover:text-primary-400 transition-colors block mt-1">+7 (978) 224-00-95</a>
              </div>
              <div className="card">
                <p className="text-dark-300 text-xs mb-2">Email</p>
                <a href="mailto:avtodvizh@mail.ru" className="text-xl font-bold text-white hover:text-primary-400 transition-colors">avtodvizh@mail.ru</a>
              </div>
              <div className="card">
                <p className="text-dark-300 text-xs mb-2">Режим работы</p>
                <p className="text-xl font-bold text-white">Пн–Сб</p>
                <p className="text-primary-400 font-semibold">09:00 – 18:00</p>
              </div>
            </div>

            {/* Feedback form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-6">Обратная связь</h2>
                <p className="text-dark-300 mb-6">Задайте вопрос или оставьте заявку — свяжемся в течение часа</p>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">Ваше имя</label>
                      <input className="input-field" placeholder="Иван" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1.5">Телефон</label>
                      <input className="input-field" type="tel" placeholder="+7 (978)..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                    <input className="input-field" type="email" placeholder="ivan@mail.ru" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Сообщение</label>
                    <textarea className="input-field" rows={4} placeholder="Опишите вашу проблему или вопрос..." />
                  </div>
                  <button type="submit" className="btn-primary w-full py-3 text-base">Отправить сообщение</button>
                </form>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">Карта</h2>
                <div className="bg-dark-100 border border-dark-200 rounded-2xl h-80 flex items-center justify-center text-dark-300">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-dark-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                    <p className="text-sm">Карта подгружается</p>
                    <p className="text-xs mt-1">ул. Беспалова, 70, Симферополь</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/booking" className="btn-primary w-full text-center block py-3">
                    Записаться онлайн
                  </Link>
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
