import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

const schema = z.object({ email: z.string().email('Некорректный email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Ошибка отправки письма');
    }
  };

  return (
    <>
      <Head><title>Восстановление пароля — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Восстановление пароля</h1>
          {sent ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">Письмо отправлено! Проверьте вашу почту.</p>
              <Link href="/auth/login" className="text-primary-500 hover:underline">Вернуться к входу</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-gray-500 text-sm mb-2">
                Введите email — мы отправим ссылку для сброса пароля.
              </p>
              <div>
                <input {...register('email')} className="input-field" type="email" placeholder="Email" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Отправка...' : 'Отправить письмо'}
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
