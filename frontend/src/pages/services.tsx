import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { servicesApi, ServicePayload } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface Service extends ServicePayload {
  id: number;
}

const serviceIcons: Record<string, string> = {
  'Компьютерная диагностика': '🔍',
  'Техническое обслуживание': '🛢️',
  'Ремонт ходовой части': '🚗',
  'Тормозная система': '🛑',
  'Ремонт двигателя': '⚙️',
  'Шиномонтаж и балансировка': '🛞',
  'Ремонт АКПП': '🔩',
  'Кузовной ремонт': '🔨',
};

const pricelist = [
  {
    category: 'Тормозная система',
    items: [
      { name: 'Замена передних тормозных колодок', price: 'от 600 ₽' },
      { name: 'Замена задних тормозных колодок', price: 'от 800 ₽' },
      { name: 'Замена тормозного диска (за шт.)', price: 'от 350 ₽' },
      { name: 'Прокачка тормозной системы', price: '500 ₽' },
      { name: 'Замена тормозной жидкости', price: 'от 800 ₽' },
      { name: 'Обслуживание суппорта', price: 'от 800 ₽' },
      { name: 'Замена тормозного шланга', price: 'от 400 ₽' },
    ],
  },
  {
    category: 'Ходовая часть',
    items: [
      { name: 'Замена переднего рычага (за шт.)', price: 'от 850 ₽' },
      { name: 'Замена шаровой опоры (болтовая)', price: 'от 1 000 ₽' },
      { name: 'Замена шаровой опоры (прессовая)', price: 'от 500 ₽' },
      { name: 'Запрессовка сайлентблока', price: 'от 300 ₽' },
      { name: 'Замена рулевого наконечника', price: 'от 500 ₽' },
      { name: 'Замена рулевой тяги', price: 'от 800 ₽' },
      { name: 'Замена стойки стабилизатора', price: 'от 400 ₽' },
      { name: 'Замена переднего амортизатора', price: 'от 1 000 ₽' },
      { name: 'Замена заднего амортизатора', price: 'от 1 000 ₽' },
      { name: 'Замена ступичного подшипника', price: 'от 1 200 ₽' },
      { name: 'Снятие/установка рулевой рейки', price: '3 500 ₽' },
    ],
  },
  {
    category: 'Двигатель и трансмиссия',
    items: [
      { name: 'Замена ремня ГРМ (8-клапанный)', price: 'от 3 000 ₽' },
      { name: 'Замена ремня ГРМ (16-клапанный)', price: 'от 3 500 ₽' },
      { name: 'Замена водяного насоса', price: 'от 2 000 ₽' },
      { name: 'Замена прокладки ГБЦ (8-клапанный)', price: 'от 8 000 ₽' },
      { name: 'Снятие/установка двигателя', price: 'от 15 000 ₽' },
      { name: 'Замена сцепления', price: 'от 4 500 ₽' },
      { name: 'Замена масла МКПП', price: '800 ₽' },
      { name: 'Замена стартера/генератора', price: 'от 2 000 ₽' },
      { name: 'Замена свечей зажигания (комплект)', price: 'от 500 ₽' },
    ],
  },
  {
    category: 'Ремонт АКПП',
    items: [
      { name: 'Замена масла АКПП + фильтр', price: 'от 2 500 ₽' },
      { name: 'Восстановление гидроблока', price: 'от 5 000 ₽' },
      { name: 'Ремонт АКПП', price: 'от 20 000 ₽' },
      { name: 'Капитальный ремонт АКПП', price: 'от 60 000 ₽' },
      { name: 'Ремонт DSG / Powershift', price: 'по запросу' },
      { name: 'Ремонт вариатора', price: 'по запросу' },
    ],
  },
  {
    category: 'Диагностика и прочее',
    items: [
      { name: 'Компьютерная диагностика', price: '500 ₽' },
      { name: 'Комплексная проверка (100+ пунктов)', price: 'от 1 000 ₽' },
      { name: 'Развал-схождение 3D', price: 'от 1 200 ₽' },
      { name: 'Заправка кондиционера', price: 'от 1 200 ₽' },
      { name: 'Шиномонтаж и балансировка', price: 'от 800 ₽' },
    ],
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi.list()
      .then((res) => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Head>
        <title>Услуги и цены — АвтоДвиж Симферополь</title>
        <meta name="description" content="Полный прайс-лист автосервиса АвтоДвиж в Симферополе. Диагностика, ТО, ходовая, тормоза, двигатель, АКПП." />
      </Head>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-14 px-4 bg-dark-100 border-b border-dark-200">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Услуги и цены</h1>
            <p className="text-dark-300 text-lg max-w-2xl">
              Прозрачное ценообразование — стоимость озвучивается до начала работ. Цены указаны за работу, без стоимости запчастей.
            </p>
          </div>
        </section>

        {/* Service cards */}
        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Основные направления</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-8 w-8 bg-dark-200 rounded-lg mb-4" />
                    <div className="h-4 bg-dark-200 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-dark-200 rounded w-full mb-1" />
                    <div className="h-3 bg-dark-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="card-hover group flex flex-col">
                    <div className="text-3xl mb-3">{serviceIcons[service.name] || '🔧'}</div>
                    <h3 className="text-base font-semibold text-white mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-dark-300 text-sm mb-4 flex-1 leading-relaxed">{service.description}</p>
                    )}
                    <div className="mt-auto">
                      <p className="text-primary-400 font-bold mb-3">{formatPrice(service.price_from, service.price_to)}</p>
                      <p className="text-dark-300 text-xs mb-4">~{service.duration_hours} ч.</p>
                      <Link
                        href={`/booking?service=${service.id}`}
                        className="btn-primary text-sm py-2 px-4 w-full text-center block"
                      >
                        Записаться
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Full price list */}
        <section className="py-14 px-4 bg-dark-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-2">Полный прайс-лист</h2>
              <p className="text-dark-300">Цены на работу без учёта стоимости запчастей. Для премиальных авто — уточняйте у менеджера.</p>
            </div>
            <div className="space-y-6">
              {pricelist.map((cat) => (
                <div key={cat.category} className="card overflow-hidden p-0">
                  <div className="px-6 py-4 border-b border-dark-200 bg-dark-200/30">
                    <h3 className="font-semibold text-white">{cat.category}</h3>
                  </div>
                  <div className="divide-y divide-dark-200">
                    {cat.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-dark-200/20 transition-colors">
                        <span className="text-dark-300 text-sm">{item.name}</span>
                        <span className="text-primary-400 font-semibold text-sm shrink-0 ml-4">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Не нашли нужную услугу?</h2>
            <p className="text-dark-300 mb-8">Позвоните нам или оставьте заявку — сделаем расчёт для вашего конкретного случая</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-primary px-8 py-3 text-center">Онлайн-запись</Link>
              <a href="tel:+79782154898" className="btn-outline px-8 py-3 text-center">+7 (978) 215-48-98</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
