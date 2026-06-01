const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

const optionalWithWarning = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'OPENROUTER_API_KEY',
  'FRONTEND_URL',
] as const;

export const validateEnv = (): void => {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const missingOptional = optionalWithWarning.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `Warning: Missing optional environment variables: ${missingOptional.join(', ')}. Some features may be limited.`,
    );
  }
};
