import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
  test('открывается и содержит ключевые элементы', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/АвтоСервис/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: /Записаться онлайн/i })).toBeVisible();
  });

  test('навигация в шапке работает', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Услуги/i }).click();
    await expect(page).toHaveURL('/services');
  });

  test('кнопка "Записаться" ведёт на форму', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Записаться онлайн/i }).first().click();
    await expect(page).toHaveURL('/booking');
  });
});
