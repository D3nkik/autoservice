import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactsPage() {
  return (
    <>
      <Head>
        <title>Контакты — АвтоСервис</title>
      </Head>
      <Header />
      <main className="max-w-5xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-10">Контакты</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-1">Адрес</h2>
              <p className="text-gray-600">г. Ваш город, ул. Примерная, д. 1</p>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Телефон</h2>
              <p className="text-gray-600">
                <a href="tel:+70000000000" className="text-primary-500 hover:underline">
                  +7 (000) 000-00-00
                </a>
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Email</h2>
              <p className="text-gray-600">
                <a href="mailto:info@autoservice.ru" className="text-primary-500 hover:underline">
                  info@autoservice.ru
                </a>
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Режим работы</h2>
              <p className="text-gray-600">Ежедневно, 08:00 – 20:00</p>
            </div>
          </div>
          {/* Map placeholder */}
          <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center text-gray-400">
            Карта (Яндекс.Карты / OpenStreetMap)
          </div>
        </div>

        {/* Feedback form */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Обратная связь</h2>
          <form className="space-y-4 max-w-lg">
            <input className="input-field" placeholder="Ваше имя" />
            <input className="input-field" type="tel" placeholder="Телефон" />
            <input className="input-field" type="email" placeholder="Email" />
            <textarea className="input-field" rows={4} placeholder="Ваш вопрос или сообщение" />
            <button type="submit" className="btn-primary w-full">Отправить</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
