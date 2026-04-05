import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>АвтоСервис — Профессиональный ремонт автомобилей</title>
        <meta name="description" content="Онлайн-запись на обслуживание автомобиля. 4 подъёмника, работаем 08:00–20:00." />
      </Head>
      <Header />
      <main>
        {/* Hero Banner */}
        <section className="bg-dark-DEFAULT text-white py-24 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Профессиональный<br />
              <span className="text-primary-500">автосервис</span>
            </h1>
            <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
              Качественный ремонт и обслуживание вашего автомобиля. Онлайн-запись в любое удобное время.
            </p>
            <Link href="/booking" className="btn-primary text-lg px-10 py-4 rounded-xl">
              Записаться онлайн
            </Link>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Наши преимущества</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Опыт 15+ лет', desc: 'Квалифицированные мастера с большим опытом работы' },
                { title: 'Гарантия на работы', desc: 'Даём гарантию на все виды выполненных работ' },
                { title: 'Современное оборудование', desc: '4 профессиональных подъёмника, диагностика' },
              ].map((item) => (
                <div key={item.title} className="card text-center">
                  <h3 className="text-xl font-semibold mb-3 text-primary-500">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services preview */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Основные услуги</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Техническое обслуживание', price: 'от 2 000 ₽' },
                { name: 'Диагностика', price: 'от 500 ₽' },
                { name: 'Ремонт ходовой части', price: 'от 1 500 ₽' },
                { name: 'Шиномонтаж', price: 'от 800 ₽' },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between card hover:shadow-lg transition-shadow">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-primary-500 font-semibold">{s.price}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/services" className="btn-outline">Все услуги</Link>
            </div>
          </div>
        </section>

        {/* Contacts preview */}
        <section className="py-20 px-4 bg-dark-DEFAULT text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Контакты</h2>
            <p className="text-gray-300 text-lg">г. Ваш город, ул. Примерная, д. 1</p>
            <p className="text-gray-300 text-lg">Тел: +7 (000) 000-00-00</p>
            <p className="text-gray-300 text-lg">Режим работы: 08:00 – 20:00, без выходных</p>
            <Link href="/contacts" className="btn-primary mt-6 inline-block">Подробнее</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
