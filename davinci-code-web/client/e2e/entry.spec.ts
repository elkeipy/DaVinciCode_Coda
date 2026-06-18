import { test, expect } from '@playwright/test';

test('entry page loads and validates nickname', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Da Vinci Code' })).toBeVisible();
  await page.getByRole('button', { name: '로비 입장' }).click();
  await expect(page.getByRole('alert')).toContainText('2자 이상');
});

test('join lobby with nickname', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('닉네임 입력').fill('Tester');
  await page.getByRole('button', { name: '로비 입장' }).click();
  await expect(page.getByText('로비')).toBeVisible({ timeout: 10000 });
});
