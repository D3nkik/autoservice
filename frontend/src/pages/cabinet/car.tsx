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
      <Head><title>Мой автомобиль — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Мой автомобиль</h1>
            <Link href="/cabinet" className="text-sm text-gray-500 hover:underline">← Назад</Link>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Марка</label>
                <input {...register('car_brand')} className="input-field" placeholder="Toyota" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Модель</label>
                <input {...register('car_model')} className="input-field" placeholder="Camry" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Год выпуска</label>
                <input {...register('car_year')} className="input-field" type="number" placeholder="2020" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Госномер</label>
                <input {...register('car_plate')} className="input-field" placeholder="А001АА 77" />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
