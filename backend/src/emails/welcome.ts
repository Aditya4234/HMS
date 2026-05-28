export const getWelcomeEmailHTML = (name: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: #f4f7fc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-text { font-size: 28px; font-weight: 700; color: #1a1a2e; }
    .logo-text span { color: #4f46e5; }
    h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 16px; text-align: center; }
    p { color: #64748b; line-height: 1.6; font-size: 16px; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 14px 32px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px; }
    .features { margin: 24px 0; padding: 0; list-style: none; }
    .features li { padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
    .features li:before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <div class="logo-text">🏨 <span>Hotel</span>Manager</div>
      </div>
      <h1>Welcome to HotelManager! 🎉</h1>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome aboard! We're thrilled to have you join HotelManager — the all-in-one platform for managing your hotel operations.</p>
      <ul class="features">
        <li>Manage rooms and bookings effortlessly</li>
        <li>Track revenue and occupancy in real-time</li>
        <li>Handle check-ins and check-outs seamlessly</li>
        <li>Generate invoices and manage payments</li>
      </ul>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">Go to Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HotelManager. All rights reserved.</p>
      <p>If you have any questions, contact our support team.</p>
    </div>
  </div>
</body>
</html>
`;
