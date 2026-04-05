import { test, expect } from '@playwright/test';

test.describe('Авторизация', () => {
  test('страница входа отображается', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Вход');
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByPlaceholder('Пароль')).toBeVisible();
  });

  test('показывает ошибку при неверных данных', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.getByRole('button', { name: /Войти/i }).click();
    await expect(page.getByText(/Неверный email или пароль/i)).toBeVisible({ timeout: 5000 });
  });

  test('страница регистрации отображается', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('h1')).toContainText('Создать аккаунт');
  });

  test('валидация формы регистрации', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByRole('button', { name: /Зарегистрироваться/i }).click();
    // Should show at least one validation error
    await expect(page.locator('p.text-red-500').first()).toBeVisible();
  });

  test('ссылка "Войти" на странице регистрации', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByRole('link', { name: /Войти/i }).click();
    await expect(page).toHaveURL('/auth/login');
  });
});
