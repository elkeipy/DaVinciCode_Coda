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
  await expect(page.getByRole('heading', { name: '로비' })).toBeVisible({ timeout: 10000 });
});

test('create room from lobby', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('닉네임 입력').fill('Host');
  await page.getByRole('button', { name: '로비 입장' }).click();
  await expect(page.getByRole('heading', { name: '로비' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: '+ 방 만들기' }).click();
  await page.getByRole('button', { name: '생성' }).click();
  await expect(page.getByText('방 로딩 중...')).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: '나가기' })).toBeVisible({ timeout: 10000 });
});
