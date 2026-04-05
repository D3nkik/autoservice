import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { meApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

interface HistoryItem {
  id: number;
  service_name: string;
  description?: string;
  price?: number;
  mileage?: number;
  completed_at: string;
}

export default function CabinetHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    meApi.getHistory()
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Head><title>История обслуживания — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">История обслуживания</h1>
            <Link href="/cabinet" className="text-sm text-gray-500 hover:underline">← Назад</Link>
          </div>
          {loading ? (
            <p className="text-gray-500">Загрузка...</p>
          ) : history.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">История обслуживания пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{item.service_name}</p>
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      )}
                      {item.mileage && (
                        <p className="text-gray-400 text-xs mt-1">Пробег: {item.mileage.toLocaleString('ru-RU')} км</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {item.price && (
                        <p className="font-semibold text-primary-500">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">{formatDate(item.completed_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
