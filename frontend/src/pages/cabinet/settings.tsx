import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { meApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function CabinetSettingsPage() {
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    meApi.getProfile().then((res) => {
      reset({ name: res.data.name, email: res.data.email, phone: res.data.phone, password: '' });
    });
  }, [router, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: Record<string, string> = { name: data.name, email: data.email, phone: data.phone };
    if (data.password) payload.password = data.password;
    try {
      await meApi.updateProfile(payload);
      toast.success('Профиль обновлён');
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  return (
    <>
      <Head><title>Настройки — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Настройки профиля</h1>
            <Link href="/cabinet" className="text-sm text-gray-500 hover:underline">← Назад</Link>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { key: 'name', label: 'Имя', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Телефон', type: 'tel' },
                { key: 'password', label: 'Новый пароль (оставьте пустым)', type: 'password' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input {...register(key as keyof FormData)} type={type} className="input-field" />
                  {errors[key as keyof FormData] && (
                    <p className="text-red-500 text-sm mt-1">{errors[key as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
