import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi, ServicePayload } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';

interface Service extends ServicePayload { id: number; }

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ServicePayload>();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { router.push('/auth/login'); return; }
    load();
  }, [router]);

  const load = () => adminApi.getServices().then((r) => setServices(r.data));

  const onSubmit = async (data: ServicePayload) => {
    try {
      if (editing) {
        await adminApi.updateService(editing.id, data);
        toast.success('Услуга обновлена');
      } else {
        await adminApi.createService(data);
        toast.success('Услуга создана');
      }
      reset(); setEditing(null); load();
    } catch { toast.error('Ошибка'); }
  };

  const handleEdit = (s: Service) => { setEditing(s); reset(s); };
  const handleDelete = async (id: number) => {
    if (!confirm('Удалить услугу?')) return;
    try { await adminApi.deleteService(id); load(); toast.success('Удалено'); }
    catch { toast.error('Ошибка'); }
  };

  return (
    <>
      <Head><title>Услуги — Админ</title></Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-dark-DEFAULT text-white px-6 py-4 flex gap-6 items-center">
          <Link href="/admin" className="text-primary-500 font-bold">← Дашборд</Link>
          <h1 className="text-lg font-semibold">Управление услугами</h1>
        </header>
        <main className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* List */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Список услуг</h2>
            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="card flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(s.price_from, s.price_to)} · {s.duration_hours} ч.</p>
                    {!s.is_active && <span className="text-xs text-red-400">Неактивна</span>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(s)} className="text-sm text-blue-500 hover:underline">Ред.</button>
                    <button onClick={() => handleDelete(s.id)} className="text-sm text-red-500 hover:underline">Удал.</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-semibold text-lg mb-4">{editing ? 'Редактировать' : 'Новая услуга'}</h2>
            <div className="card">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <input {...register('name')} className="input-field" placeholder="Название" required />
                <textarea {...register('description')} className="input-field" rows={2} placeholder="Описание" />
                <div className="grid grid-cols-2 gap-3">
                  <input {...register('price_from', { valueAsNumber: true })} className="input-field" type="number" placeholder="Цена от" required />
                  <input {...register('price_to', { valueAsNumber: true })} className="input-field" type="number" placeholder="Цена до" />
                </div>
                <input {...register('duration_hours', { valueAsNumber: true })} className="input-field" type="number" placeholder="Длительность (ч.)" defaultValue={1} required />
                <input {...register('sort_order', { valueAsNumber: true })} className="input-field" type="number" placeholder="Порядок сортировки" defaultValue={0} />
                <label className="flex items-center gap-2 text-sm">
                  <input {...register('is_active')} type="checkbox" defaultChecked />
                  Активна
                </label>
                <div className="flex gap-2">
                  <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                    {editing ? 'Сохранить' : 'Создать'}
                  </button>
                  {editing && (
                    <button type="button" onClick={() => { setEditing(null); reset(); }} className="btn-outline flex-1">
                      Отмена
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
