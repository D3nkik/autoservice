import { test, expect } from '@playwright/test';
import { format, addDays } from 'date-fns';

test.describe('Форма онлайн-записи', () => {
  test('форма отображается корректно', async ({ page }) => {
    await page.goto('/booking');
    await expect(page.locator('h1')).toContainText('Онлайн-запись');
    await expect(page.getByPlaceholder(/Иван Иванов/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Телефон/i)).toBeVisible();
  });

  test('показывает ошибки при пустой отправке', async ({ page }) => {
    await page.goto('/booking');
    await page.getByRole('button', { name: /Записаться/i }).click();
    await expect(page.getByText(/Введите имя/i)).toBeVisible();
    await expect(page.getByText(/Введите телефон/i)).toBeVisible();
  });

  test('поле "Описание" появляется при выборе "Другое"', async ({ page }) => {
    await page.goto('/booking');
    await page.selectOption('select', 'other');
    await expect(page.getByPlaceholder(/Опишите что нужно сделать/i)).toBeVisible();
  });

  test('выбор даты загружает доступные слоты', async ({ page }) => {
    await page.goto('/booking');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    await page.fill('input[type="date"]', tomorrow);
    // Wait for slots to load
    await page.waitForResponse((r) => r.url().includes('/api/slots') && r.status() === 200);
    // Should show time slots or "no slots" message
    const slotsOrMessage = page.locator('[class*="grid-cols-4"], p:has-text("нет свободного времени")');
    await expect(slotsOrMessage.first()).toBeVisible({ timeout: 5000 });
  });
});
