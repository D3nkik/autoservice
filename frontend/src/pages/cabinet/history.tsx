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
      <div className="min-h-screen bg-dark">
        <div className="bg-dark-100 border-b border-dark-200 px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link href="/cabinet" className="text-dark-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">История обслуживания</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-8 px-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-dark-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-dark-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="card text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-dark-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">История пуста</h3>
              <p className="text-dark-300 text-sm">После выполнения работ здесь появится история обслуживания</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{item.service_name}</p>
                      {item.description && (
                        <p className="text-dark-300 text-sm mt-1 leading-relaxed">{item.description}</p>
                      )}
                      {item.mileage && (
                        <p className="text-dark-300 text-xs mt-2 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                          </svg>
                          Пробег: {item.mileage.toLocaleString('ru-RU')} км
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {item.price && (
                        <p className="font-bold text-primary-400">{Number(item.price).toLocaleString('ru-RU')} ₽</p>
                      )}
                      <p className="text-dark-300 text-sm mt-1">{formatDate(item.completed_at)}</p>
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
