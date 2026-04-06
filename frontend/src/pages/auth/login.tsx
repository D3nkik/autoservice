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
      <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">Авто<span className="text-primary-500">Движ</span></span>
            </Link>
            <h1 className="text-2xl font-bold">Вход в кабинет</h1>
            <p className="text-dark-300 text-sm mt-1">Введите ваши данные для входа</p>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                <input {...register('email')} className="input-field" type="email" placeholder="ivan@example.com" autoComplete="email" />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Пароль</label>
                <input {...register('password')} className="input-field" type="password" placeholder="••••••••" autoComplete="current-password" />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base disabled:opacity-50">
                {isSubmitting ? 'Вход...' : 'Войти'}
              </button>
            </form>
            <div className="mt-5 pt-5 border-t border-dark-200 space-y-2 text-center text-sm">
              <p>
                <Link href="/auth/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Забыли пароль?
                </Link>
              </p>
              <p className="text-dark-300">
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="text-primary-400 hover:text-primary-300 transition-colors">Зарегистрироваться</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
