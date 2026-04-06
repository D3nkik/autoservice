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
      <Head><title>Настройки — АвтоДвиж</title></Head>
      <div className="min-h-screen bg-dark-DEFAULT">
        <div className="bg-dark-100 border-b border-dark-200 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <Link href="/cabinet" className="text-dark-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Настройки профиля</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto py-8 px-4">
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { key: 'name', label: 'Имя', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Телефон', type: 'tel' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">{label}</label>
                  <input {...register(key as keyof FormData)} type={type} className="input-field" />
                  {errors[key as keyof FormData] && (
                    <p className="text-red-400 text-sm mt-1">{errors[key as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-dark-200">
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Новый пароль <span className="text-dark-200 text-xs">(оставьте пустым, если не меняете)</span>
                </label>
                <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 disabled:opacity-50">
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
