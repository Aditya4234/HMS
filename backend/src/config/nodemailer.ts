import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  await transporter.sendMail({
    from: `"Hotel Management" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Hotel Management System',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for registering with our Hotel Management System.</p>
      <p>You now have access to manage your hotel operations efficiently.</p>
    `,
  });
};

export const sendBookingConfirmation = async (
  email: string,
  name: string,
  details: {
    reference: string;
    hotelName: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  }
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Booking Confirmed - ${details.reference}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${name},</p>
      <p>Your booking has been confirmed.</p>
      <p><strong>Reference:</strong> ${details.reference}</p>
      <p><strong>Hotel:</strong> ${details.hotelName}</p>
      <p><strong>Room:</strong> ${details.roomNumber}</p>
      <p><strong>Check-in:</strong> ${details.checkIn}</p>
      <p><strong>Check-out:</strong> ${details.checkOut}</p>
      <p><strong>Total:</strong> $${details.totalAmount}</p>
    `,
  });
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <h1>OTP Verification</h1>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  });
};

export default transporter;
