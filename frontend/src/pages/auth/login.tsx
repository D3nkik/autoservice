import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { setTokens, storeUser } from '@/lib/auth';

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      setTokens(res.data.access_token, res.data.refresh_token);
      storeUser(res.data.user);
      toast.success('Добро пожаловать!');
      router.push(res.data.user.role === 'admin' ? '/admin' : '/cabinet');
    } catch {
      toast.error('Неверный email или пароль');
    }
  };

  return (
    <>
      <Head><title>Вход — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Вход в личный кабинет</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input {...register('email')} className="input-field" type="email" placeholder="Email" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register('password')} className="input-field" type="password" placeholder="Пароль" />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <p>
              <Link href="/auth/forgot-password" className="text-primary-500 hover:underline">
                Забыли пароль?
              </Link>
            </p>
            <p className="text-gray-500">
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-primary-500 hover:underline">Зарегистрироваться</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
