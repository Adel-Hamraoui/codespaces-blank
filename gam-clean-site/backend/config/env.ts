// ============================================================================
// Configuration serveur, lue une seule fois depuis l'environnement.
// Aucune valeur secrète n'a de valeur par défaut dans le code.
// ============================================================================
import 'server-only'

const env = process.env

export const config = {
  isProduction: env.NODE_ENV === 'production',
  databaseUrl: env.DATABASE_URL || null,
  dbPoolMax: Math.min(Math.max(Number(env.DB_POOL_MAX) || 3, 1), 20),
  /** Secret applicatif (empreintes HMAC des adresses IP pour l'anti-abus). */
  appSecret: env.APP_SECRET || null,
  cronSecret: env.CRON_SECRET || null,
  resendApiKey: env.RESEND_API_KEY || null,
  contactToEmail: env.CONTACT_TO_EMAIL || null,
  contactFromEmail: env.CONTACT_FROM_EMAIL || null,
  sendCustomerConfirmation: env.SEND_CUSTOMER_CONFIRMATION === 'true',
  deliveryMode: env.CONTACT_DELIVERY_MODE === 'log' && env.NODE_ENV !== 'production' ? 'log' : 'resend',
} as const

export const hasDatabase = () => config.databaseUrl !== null
