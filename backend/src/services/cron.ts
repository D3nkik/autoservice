import cron from 'node-cron';
import { prisma } from './prisma';
import { sendEmail } from './email';

export function startCronJobs() {
  // Every day at 09:00 — send reminders for tomorrow's bookings
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Sending reminders for tomorrow bookings...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const bookings = await prisma.booking.findMany({
      where: {
        date: { gte: tomorrow, lt: dayAfter },
        status: { in: ['confirmed'] },
        client_email: { not: null },
      },
      include: { service: true },
    });

    for (const booking of bookings) {
      if (!booking.client_email) continue;
      const timeStr = booking.time_slot.toISOString().slice(11, 16);
      const dateStr = booking.date.toISOString().slice(0, 10);
      await sendEmail({
        to: booking.client_email,
        subject: 'Напоминание о визите — АвтоСервис',
        html: `
          <h2>Напоминаем о вашей записи!</h2>
          <p>Завтра <strong>${dateStr}</strong> в <strong>${timeStr}</strong></p>
          <p>Услуга: <strong>${booking.service?.name || booking.custom_service || 'Другое'}</strong></p>
          <p>Ждём вас!</p>
        `,
      }).catch(console.error);
    }

    console.log(`[Cron] Sent ${bookings.length} reminders`);
  });

  console.log('✅ Cron jobs started');
}
