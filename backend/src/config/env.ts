const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

const optionalWithWarning = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
] as const;

export const validateEnv = (): void => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // Production checks
  if (process.env.NODE_ENV === 'production') {
    const secretsToCheck = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const weakSecrets = secretsToCheck.filter(
      (key) => process.env[key]?.includes('your-') || (process.env[key]?.length || 0) < 16
    );
    if (weakSecrets.length > 0) {
      console.warn(
        `⚠️ WARNING: Weak secrets detected in production: ${weakSecrets.join(', ')}. Use strong random values (32+ chars).`
      );
    }

    if (!process.env.FRONTEND_URL) {
      console.warn('⚠️ WARNING: FRONTEND_URL not set. CORS will be restricted.');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('⚠️ WARNING: STRIPE_WEBHOOK_SECRET not set. Stripe webhooks cannot be verified.');
    }
  }

  const missingOptional = optionalWithWarning.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `Warning: Missing optional environment variables: ${missingOptional.join(', ')}. Some features may be limited.`,
    );
  }
};
