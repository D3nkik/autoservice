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
  name: z.string().min(2, 'Введите имя'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(10, 'Введите номер телефона'),
  password: z.string().min(6, 'Минимум 6 символов'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setTokens(res.data.access_token, res.data.refresh_token);
      storeUser(res.data.user);
      toast.success('Аккаунт создан!');
      router.push('/cabinet');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Ошибка регистрации');
    }
  };

  return (
    <>
      <Head><title>Регистрация — АвтоСервис</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Создать аккаунт</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { key: 'name', placeholder: 'Имя', type: 'text' },
              { key: 'email', placeholder: 'Email', type: 'email' },
              { key: 'phone', placeholder: 'Телефон +7...', type: 'tel' },
              { key: 'password', placeholder: 'Пароль', type: 'password' },
              { key: 'confirmPassword', placeholder: 'Повторите пароль', type: 'password' },
            ].map(({ key, placeholder, type }) => (
              <div key={key}>
                <input
                  {...register(key as keyof FormData)}
                  className="input-field"
                  type={type}
                  placeholder={placeholder}
                />
                {errors[key as keyof FormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[key as keyof FormData]?.message}
                  </p>
                )}
              </div>
            ))}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-primary-500 hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </>
  );
}
