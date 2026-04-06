import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminApi, ServicePayload } from '@/lib/api';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';

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

  const handleEdit = (s: Service) => { setEditing(s); reset(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDelete = async (id: number) => {
    if (!confirm('Удалить услугу?')) return;
    try { await adminApi.deleteService(id); load(); toast.success('Удалено'); }
    catch { toast.error('Ошибка'); }
  };

  return (
    <>
      <Head><title>Услуги — АвтоДвиж Admin</title></Head>
      <AdminLayout title="Управление услугами">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card">
            <h2 className="font-semibold mb-4">{editing ? `Редактировать: ${editing.name}` : 'Новая услуга'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Название</label>
                <input {...register('name')} className="input-field text-sm" placeholder="Компьютерная диагностика" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Описание</label>
                <textarea {...register('description')} className="input-field text-sm" rows={2} placeholder="Краткое описание услуги..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Цена от (₽)</label>
                  <input {...register('price_from', { valueAsNumber: true })} className="input-field text-sm" type="number" placeholder="500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Цена до (₽)</label>
                  <input {...register('price_to', { valueAsNumber: true })} className="input-field text-sm" type="number" placeholder="1500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Длительность (ч.)</label>
                  <input {...register('duration_hours', { valueAsNumber: true })} className="input-field text-sm" type="number" defaultValue={1} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Порядок</label>
                  <input {...register('sort_order', { valueAsNumber: true })} className="input-field text-sm" type="number" defaultValue={0} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
                <input {...register('is_active')} type="checkbox" defaultChecked className="w-4 h-4 accent-primary-500" />
                Активна (отображается на сайте)
              </label>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">
                  {editing ? 'Сохранить' : 'Создать'}
                </button>
                {editing && (
                  <button type="button" onClick={() => { setEditing(null); reset(); }} className="btn-outline flex-1 text-sm py-2.5">
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div>
            <h2 className="font-semibold mb-4">Услуги ({services.length})</h2>
            <div className="space-y-2">
              {services.map((s) => (
                <div key={s.id} className={`card p-4 flex items-center justify-between gap-3 ${!s.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">{s.name}</p>
                    <p className="text-dark-300 text-xs mt-0.5">{formatPrice(s.price_from, s.price_to)} · {s.duration_hours} ч.</p>
                    {!s.is_active && <span className="text-xs text-red-400">Скрыта</span>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(s)} className="text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded-lg border border-dark-200 hover:border-primary-500/50 transition-colors">
                      Изменить
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg border border-dark-200 hover:border-red-500/50 transition-colors">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="card text-center py-8 text-dark-300 text-sm">Услуги не добавлены</div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
