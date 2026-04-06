import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

const schema = z.object({
  password: z.string().min(6, 'Минимум 6 символов'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Пароли не совпадают',
  path: ['confirm'],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token || typeof token !== 'string') {
      toast.error('Неверная ссылка для сброса пароля');
      return;
    }
    try {
      await authApi.resetPassword(token, data.password);
      setDone(true);
    } catch {
      toast.error('Ссылка недействительна или истекла. Запросите новую.');
    }
  };

  return (
    <>
      <Head><title>Новый пароль — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Новый пароль</h1>
          {!token ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">Неверная ссылка для сброса пароля.</p>
              <Link href="/auth/forgot-password" className="text-primary-500 hover:underline">
                Запросить новую ссылку
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">Пароль успешно изменён!</p>
              <Link href="/auth/login" className="text-primary-500 hover:underline">Войти</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register('password')}
                  className="input-field"
                  type="password"
                  placeholder="Новый пароль"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <input
                  {...register('confirm')}
                  className="input-field"
                  type="password"
                  placeholder="Повторите пароль"
                />
                {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
              </button>
              <p className="text-center text-sm">
                <Link href="/auth/login" className="text-primary-500 hover:underline">Назад</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
