import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { meApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface CarData {
  car_brand: string;
  car_model: string;
  car_year: string;
  car_plate: string;
}

export default function CabinetCarPage() {
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CarData>();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    meApi.getProfile().then((res) => {
      reset({
        car_brand: res.data.car_brand || '',
        car_model: res.data.car_model || '',
        car_year: res.data.car_year?.toString() || '',
        car_plate: res.data.car_plate || '',
      });
    });
  }, [router, reset]);

  const onSubmit = async (data: CarData) => {
    try {
      await meApi.updateProfile({ ...data, car_year: data.car_year ? parseInt(data.car_year) : undefined });
      toast.success('Данные сохранены');
    } catch {
      toast.error('Ошибка сохранения');
    }
  };

  return (
    <>
      <Head><title>Мой автомобиль — АвтоДвиж</title></Head>
      <div className="min-h-screen bg-dark-DEFAULT">
        <div className="bg-dark-100 border-b border-dark-200 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <Link href="/cabinet" className="text-dark-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Мой автомобиль</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto py-8 px-4">
          <div className="card">
            <p className="text-dark-300 text-sm mb-6">Укажите данные вашего автомобиля — они автоматически подставятся при записи</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Марка</label>
                  <input {...register('car_brand')} className="input-field" placeholder="Toyota" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Модель</label>
                  <input {...register('car_model')} className="input-field" placeholder="Camry" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Год выпуска</label>
                  <input {...register('car_year')} className="input-field" type="number" placeholder="2020" min="1990" max="2030" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Госномер</label>
                  <input {...register('car_plate')} className="input-field" placeholder="А001АА 82" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-50">
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
