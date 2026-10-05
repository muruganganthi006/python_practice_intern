import { defineConfig, devices } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

const frontendPort = Number(process.env.PLAYWRIGHT_WEB_PORT ?? 5176);
const backendPort = Number(process.env.PLAYWRIGHT_API_PORT ?? 8002);
const frontendUrl = `http://localhost:${frontendPort}`;
const backendUrl = `http://127.0.0.1:${backendPort}`;
const backendRoot = path.resolve(process.cwd(), '../backend');
const pythonExecutable = process.env.PLAYWRIGHT_PYTHON ?? path.join(
  backendRoot,
  process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python',
);
const temporaryDatabase = path.join(
  os.tmpdir(),
  `govia-playwright-${randomUUID()}.db`,
).replace(/\\/g, '/');

process.env.PLAYWRIGHT_API_URL = backendUrl;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  outputDir: path.join(os.tmpdir(), `govia-playwright-results-${randomUUID()}`),
  use: {
    ...devices['Desktop Chrome'],
    baseURL: frontendUrl,
    browserName: 'chromium',
    channel: 'chromium',
    headless: true,
  },
  webServer: [
    {
      command: `"${pythonExecutable}" -m uvicorn app.main:app --host 127.0.0.1 --port ${backendPort}`,
      cwd: backendRoot,
      url: `${backendUrl}/api/health`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        DATABASE_URL: `sqlite:///${temporaryDatabase}`,
        FRONTEND_URL: frontendUrl,
        SECRET_KEY: 'govia-playwright-test-only',
        PYTHONUNBUFFERED: '1',
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      cwd: process.cwd(),
      url: frontendUrl,
      timeout: 60_000,
      reuseExistingServer: false,
      env: {
        VITE_API_URL: backendUrl,
      },
    },
  ],
});
