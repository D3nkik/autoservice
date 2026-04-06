import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function runSeed() {
  try {
    for (let i = 1; i <= 4; i++) {
      await prisma.lift.upsert({
        where: { id: i },
        update: {},
        create: { id: i, name: `Подъёмник ${i}`, is_active: true },
      });
    }

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

    const services = [
      { name: 'Компьютерная диагностика', description: 'Полная диагностика всех систем автомобиля, проверка ошибок ЭБУ', price_from: 500, price_to: 1500, duration_hours: 1, sort_order: 1 },
      { name: 'Техническое обслуживание', description: 'Замена масла, фильтров, проверка всех систем автомобиля', price_from: 2000, price_to: 5000, duration_hours: 2, sort_order: 2 },
      { name: 'Ремонт ходовой части', description: 'Амортизаторы, рычаги, шаровые опоры, сайлентблоки, рулевые тяги', price_from: 500, price_to: 8000, duration_hours: 3, sort_order: 3 },
      { name: 'Тормозная система', description: 'Замена колодок, дисков, суппортов. Прокачка и замена тормозной жидкости', price_from: 600, price_to: 3000, duration_hours: 1, sort_order: 4 },
      { name: 'Ремонт двигателя', description: 'Диагностика и ремонт двигателя любой сложности, замена ГРМ', price_from: 3000, price_to: 50000, duration_hours: 4, sort_order: 5 },
      { name: 'Шиномонтаж и балансировка', description: 'Замена и балансировка шин. Сезонное хранение шин', price_from: 800, price_to: 2000, duration_hours: 1, sort_order: 6 },
      { name: 'Ремонт АКПП', description: 'Ремонт и обслуживание автоматических коробок передач, DSG, вариаторов', price_from: 5000, price_to: 60000, duration_hours: 8, sort_order: 7 },
      { name: 'Кузовной ремонт', description: 'Устранение вмятин, рихтовка, покраска. Работаем с любыми повреждениями', price_from: 3000, price_to: 30000, duration_hours: 4, sort_order: 8 },
    ];

    for (const s of services) {
      await prisma.service.create({ data: s }).catch(() => {});
    }

    console.log('✅ Seed complete');
  } finally {
    await prisma.$disconnect();
  }
}
