const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const;

export const validateEnv = (): void => {
  const missing = required.filter((key) => !process.env[key]);
  const optionalWithWarning = ['STRIPE_SECRET_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'CLOUDINARY_CLOUD_NAME', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missingOptional = optionalWithWarning.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (missingOptional.length > 0) {
    console.warn(`Warning: Missing optional environment variables: ${missingOptional.join(', ')}. Some features may be limited.`);
  }
};
