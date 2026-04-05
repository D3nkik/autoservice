import { test, expect, Page } from '@playwright/test';

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', 'admin@autoservice.ru');
  await page.fill('input[type="password"]', 'admin123');
  await page.getByRole('button', { name: /Войти/i }).click();
  await page.waitForURL('/admin');
}

test.describe('Админ-панель', () => {
  test('неавторизованный пользователь перенаправляется', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('дашборд отображается после входа администратора', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('h1')).toContainText('Дашборд');
    await expect(page.getByText(/Записей сегодня/i)).toBeVisible();
  });

  test('список заявок доступен', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/bookings');
    await expect(page.locator('h1, header')).toContainText(/Заявк/i);
  });

  test('расписание подъёмников отображается', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/schedule');
    await expect(page.locator('h1')).toContainText(/Расписание/i);
    // Should show time slots
    await expect(page.getByText('08:00')).toBeVisible();
  });

  test('управление услугами доступно', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/services');
    await expect(page.locator('h1')).toContainText(/Услуги/i);
  });
});
