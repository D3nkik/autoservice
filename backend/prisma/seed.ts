import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create lifts
  for (let i = 1; i <= 4; i++) {
    await prisma.lift.upsert({
      where: { id: i },
      update: {},
      create: { id: i, name: `Подъёмник ${i}`, is_active: true },
    });
  }

  // Create admin user
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@autoservice.ru' },
    update: {},
    create: {
      email: 'admin@autoservice.ru',
      phone: '+70000000000',
      name: 'Администратор',
      password_hash: hash,
      role: 'admin',
    },
  });

  // Create services
  const services = [
    { name: 'Техническое обслуживание', description: 'Замена масла, фильтров, проверка всех систем', price_from: 2000, price_to: 5000, duration_hours: 2, sort_order: 1 },
    { name: 'Диагностика', description: 'Компьютерная диагностика всех систем автомобиля', price_from: 500, price_to: 1500, duration_hours: 1, sort_order: 2 },
    { name: 'Ремонт ходовой части', description: 'Замена амортизаторов, рычагов, шаровых опор', price_from: 1500, price_to: 8000, duration_hours: 3, sort_order: 3 },
    { name: 'Шиномонтаж', description: 'Замена, балансировка шин', price_from: 800, price_to: 2000, duration_hours: 1, sort_order: 4 },
    { name: 'Кузовной ремонт', description: 'Устранение вмятин, покраска', price_from: 3000, duration_hours: 4, sort_order: 5 },
    { name: 'Замена тормозных колодок', description: 'Передние и задние тормозные колодки', price_from: 1200, price_to: 3000, duration_hours: 1, sort_order: 6 },
  ];

  for (const s of services) {
    await prisma.service.create({ data: { ...s, price_from: s.price_from, price_to: s.price_to } }).catch(() => {});
  }

  console.log('✅ Seed complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); process.exit(0); });
