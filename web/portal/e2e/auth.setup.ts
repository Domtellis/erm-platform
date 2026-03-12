import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../auth.json');

setup('authenticate via Keycloak UI', async ({ page }) => {
  console.log('Performing UI-based login to Keycloak...');

  await page.goto('/');
  
  // Click Sign In if not automatically redirected
  const signInButton = page.getByRole('button', { name: 'Sign In' });
  if (await signInButton.isVisible()) {
    await signInButton.click();
  }

  // Handle Keycloak Login Form
  await page.waitForSelector('text=Sign in to your account'); // Wait for Keycloak page
  await page.getByRole('textbox', { name: 'Username or email' }).fill('site-user-01');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for redirect back to the app and verification of login
  await expect(page.getByRole('link', { name: 'Monitoring' })).toBeVisible({ timeout: 15000 });

  // Wait for redirect back to the app and verification of login
  await expect(page.getByRole('link', { name: 'Monitoring' })).toBeVisible({ timeout: 15000 });

  // Manually extract sessionStorage (since Playwright's storageState ignores it)
  const sessionData = await page.evaluate(() => {
    const items: { name: string, value: string }[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('oidc.') || key.startsWith('auth.'))) {
        items.push({ name: key, value: sessionStorage.getItem(key) || '' });
      }
    }
    return items;
  });

  // Get current storage state and inject the origins
  const storageState = await page.context().storageState();
  storageState.origins = [
    {
      origin: 'https://erm.prod:5180',
      localStorage: sessionData,
    }
  ];

  fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
  console.log('Login successful. Auth state (with manual origins) saved to auth.json');
});
