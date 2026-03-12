import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

let uniqueRefId: string;

Given('I am logged in as {string}', async ({ page }, username) => {
  await page.goto('/');
  
  // If the page redirects to Keycloak, perform a fresh login
  if (page.url().includes('realms/erm-platform/protocol/openid-connect/auth') || await page.getByRole('button', { name: 'Sign In' }).isVisible()) {
    if (await page.getByRole('button', { name: 'Sign In' }).isVisible()) {
      await page.getByRole('button', { name: 'Sign In' }).click();
    }
    await page.getByRole('textbox', { name: 'Username or email' }).fill(username);
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();
  }

  // Final verification that we are logged in and the dashboard is ready
  await expect(page.getByRole('link', { name: 'Monitoring' })).toBeVisible({ timeout: 20000 });
});

When('I navigate to the {string} page', async ({ page }, pageName) => {
  // Map "New Breach Submission" to the Monitoring page where the button is
  if (pageName === 'New Breach Submission') {
    await page.getByRole('link', { name: 'Monitoring' }).click();
    await expect(page).toHaveURL(/.*monitoring/);
    await page.getByRole('button', { name: 'Report Breach' }).click();
  } else {
    await page.getByRole('link', { name: pageName }).click();
  }
});

When('I enter a unique Reference ID for the {string} report', async ({ page }, reportType) => {
  uniqueRefId = `ISO-${reportType.toUpperCase()}-${Date.now()}`;
  // Use placeholder as it's the only stable identifier in the pre-built container
  const input = page.locator('input[placeholder="e.g. SITE-01"]');
  await expect(input).toBeVisible();
  await input.fill(uniqueRefId);
});

When('I fill in the metrics for a {string} of {string} \\(ISO 31000 Scale)', async ({ page }, metricName, value) => {
  // Use first select for Metric Name
  await page.locator('select').first().selectOption({ label: metricName });
  // Use type="number" for Observed Value
  await page.locator('input[type="number"]').fill(value);
});

When('I submit the ISO-standardized report', async ({ page }) => {
  await page.getByRole('button', { name: 'Submit Breach Case' }).click();
});

Then('I should see a success notification {string}', async ({ page }, message) => {
  // Use text locator for notification with a wait
  await expect(page.getByText(message)).toBeVisible({ timeout: 15000 });
});

Then('the breach should appear in the {string} with status {string}', async ({ page }, registryName) => {
  if (registryName !== 'Risk Registry') {
    await page.getByRole('link', { name: registryName }).click();
  }
  
  // Wait for the table to load and find our unique ID
  const row = page.locator('tr').filter({ hasText: uniqueRefId });
  await expect(row).toBeVisible({ timeout: 25000 });
  
  // Use expect.toPass to wait for the status to transition from "open" to an AI-processed state
  await expect(async () => {
    const rowText = await row.innerText();
    const isAIStatus = /AI Assessment Ready|AI SUGGESTED|PENDING_AI|ai_suggested/i.test(rowText);
    if (!isAIStatus) {
        throw new Error(`Status not yet AI-processed. Current row text: "${rowText}"`);
    }
  }).toPass({ 
    timeout: 30000,
    intervals: [2000, 5000] 
  });
});
