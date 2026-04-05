import { test, expect } from '@playwright/test';

test.describe('Страница услуг', () => {
  test('загружает и отображает услуги', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1')).toContainText('Наши услуги');
    // Wait for services to load (or show loading state)
    await page.waitForResponse((r) => r.url().includes('/api/services') && r.status() === 200);
    // At least one service card should be visible
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 5000 });
  });

  test('кнопка "Записаться" ведёт на форму с предвыбранной услугой', async ({ page }) => {
    await page.goto('/services');
    await page.waitForResponse((r) => r.url().includes('/api/services'));
    const firstBookBtn = page.getByRole('link', { name: /Записаться/i }).first();
    await firstBookBtn.click();
    await expect(page).toHaveURL(/\/booking\?service=/);
  });
});
