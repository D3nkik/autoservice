import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-DEFAULT text-gray-400 py-10 px-4 mt-auto">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="text-white font-bold text-lg mb-2">АвтоСервис</p>
          <p>Профессиональный ремонт и обслуживание автомобилей.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Навигация</p>
          <ul className="space-y-1">
            <li><Link href="/services" className="hover:text-white">Услуги</Link></li>
            <li><Link href="/booking" className="hover:text-white">Запись онлайн</Link></li>
            <li><Link href="/contacts" className="hover:text-white">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-2">Контакты</p>
          <p>г. Ваш город, ул. Примерная, 1</p>
          <p>+7 (000) 000-00-00</p>
          <p>08:00 – 20:00, ежедневно</p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-600 mt-8">
        © {new Date().getFullYear()} АвтоСервис. Все права защищены.
      </div>
    </footer>
  );
}
