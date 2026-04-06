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

  const fields = [
    { key: 'name', label: 'Имя', placeholder: 'Иван Иванов', type: 'text', autocomplete: 'name' },
    { key: 'email', label: 'Email', placeholder: 'ivan@example.com', type: 'email', autocomplete: 'email' },
    { key: 'phone', label: 'Телефон', placeholder: '+7 (978) 000-00-00', type: 'tel', autocomplete: 'tel' },
    { key: 'password', label: 'Пароль', placeholder: '••••••••', type: 'password', autocomplete: 'new-password' },
    { key: 'confirmPassword', label: 'Повторите пароль', placeholder: '••••••••', type: 'password', autocomplete: 'new-password' },
  ];

  return (
    <>
      <Head><title>Регистрация — АвтоСервис</title></Head>
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
            <h1 className="text-2xl font-bold">Создать аккаунт</h1>
            <p className="text-dark-300 text-sm mt-1">Отслеживайте свои записи и историю обслуживания</p>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(({ key, label, placeholder, type, autocomplete }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">{label}</label>
                  <input
                    {...register(key as keyof FormData)}
                    className="input-field"
                    type={type}
                    placeholder={placeholder}
                    autoComplete={autocomplete}
                  />
                  {errors[key as keyof FormData] && (
                    <p className="text-red-400 text-sm mt-1">{errors[key as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base disabled:opacity-50">
                {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
            <p className="mt-5 pt-5 border-t border-dark-200 text-center text-sm text-dark-300">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 transition-colors">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
