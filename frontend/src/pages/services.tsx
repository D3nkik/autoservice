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
        <title>Услуги — АвтоСервис</title>
      </Head>
      <Header />
      <main className="max-w-5xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-10">Наши услуги</h1>
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="card flex flex-col gap-3">
                <h2 className="text-xl font-semibold">{service.name}</h2>
                {service.description && (
                  <p className="text-gray-600 text-sm">{service.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-primary-500 font-semibold">
                    {formatPrice(service.price_from, service.price_to)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ~{service.duration_hours} ч.
                  </span>
                </div>
                <Link
                  href={`/booking?service=${service.id}`}
                  className="btn-primary text-center text-sm"
                >
                  Записаться
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
