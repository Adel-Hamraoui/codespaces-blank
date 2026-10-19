// ============================================================================
// Tests de bout en bout (navigateur réel) : npm run test:e2e
// Prérequis : E2E_DATABASE_URL vers une base PostgreSQL de test (*_test / *_e2e),
// vidée et réinitialisée à chaque lancement. Le site est construit puis servi
// en mode production sur le port 3200.
// ============================================================================
import { defineConfig, devices } from '@playwright/test'

const PORT = 3200
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1, // les scénarios partagent une même base de données
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
    // Les animations au défilement ne doivent pas masquer de contenu pendant les vérifications.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'public', testMatch: /public\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', testMatch: /mobile\.spec\.ts/, use: { ...devices['Pixel 7'] } },
    { name: 'admin', testMatch: /admin\.spec\.ts/, use: { ...devices['Desktop Chrome'] }, dependencies: ['public'] },
  ],
  webServer: {
    command: `npm run -s e2e:prepare && npm run -s build && npm run -s start -- --port ${PORT}`,
    url: baseURL,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: process.env.E2E_DATABASE_URL ?? '',
      APP_SECRET: 'secret-de-test-e2e',
      CRON_SECRET: 'cron-de-test-e2e',
      NEXT_PUBLIC_SITE_URL: baseURL,
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
})
