import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BookingForm from '@/components/booking/BookingForm';

export default function BookingPage() {
  return (
    <>
      <Head>
        <title>Онлайн-запись — АвтоСервис</title>
        <meta name="description" content="Запишитесь в автосервис АвтоСервис онлайн. Быстро и удобно." />
      </Head>
      <Header />
      <main>
        <section className="py-14 px-4 bg-dark-100 border-b border-dark-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Онлайн-запись</h1>
            <p className="text-dark-300 text-lg">Заполните форму — перезвоним и подтвердим время в течение 15 минут</p>
          </div>
        </section>
        <div className="py-12 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BookingForm />
            </div>
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-white mb-4">Как это работает</h3>
                <div className="space-y-4">
                  {[
                    { n: '1', title: 'Заполните форму', desc: 'Укажите услугу, дату и удобное время' },
                    { n: '2', title: 'Подтверждение', desc: 'Мы перезвоним в течение 15 минут' },
                    { n: '3', title: 'Приезжайте', desc: 'Ваше время забронировано за вами' },
                  ].map((step) => (
                    <div key={step.n} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold flex items-center justify-center shrink-0">
                        {step.n}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{step.title}</p>
                        <p className="text-dark-300 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-semibold text-white mb-4">Контакты</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-dark-300 text-xs mb-1">Телефоны</p>
                    <a href="tel:+79782154898" className="text-white hover:text-primary-400 transition-colors block font-medium">+7 (978) 215-48-98</a>
                    <a href="tel:+79782240095" className="text-white hover:text-primary-400 transition-colors block font-medium">+7 (978) 224-00-95</a>
                  </div>
                  <div>
                    <p className="text-dark-300 text-xs mb-1">Адрес</p>
                    <p className="text-white">ул. Беспалова, 70, Симферополь</p>
                  </div>
                  <div>
                    <p className="text-dark-300 text-xs mb-1">Режим работы</p>
                    <p className="text-white">Пн–Сб: 09:00 – 18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
