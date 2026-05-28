export const getBookingConfirmationHTML = (data: {
  name: string;
  reference: string;
  hotelName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  address?: string;
}): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: #f4f7fc; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 6px 16px; background: #dcfce7; color: #16a34a; border-radius: 20px; font-size: 14px; font-weight: 600; }
    .details { margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-label { color: #64748b; font-size: 14px; }
    .detail-value { color: #1e293b; font-weight: 600; font-size: 14px; }
    .total { display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px; border-top: 2px solid #4f46e5; }
    .total-label { font-size: 18px; font-weight: 700; color: #1a1a2e; }
    .total-value { font-size: 24px; font-weight: 700; color: #4f46e5; }
    .btn { display: inline-block; padding: 14px 32px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 24px; }
    .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>Booking Confirmed! ✅</h1>
      <span class="badge">Confirmed</span>
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Reference</span>
          <span class="detail-value">${data.reference}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Hotel</span>
          <span class="detail-value">${data.hotelName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Room</span>
          <span class="detail-value">${data.roomNumber} (${data.roomType})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-in</span>
          <span class="detail-value">${data.checkIn}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-out</span>
          <span class="detail-value">${data.checkOut}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Guests</span>
          <span class="detail-value">${data.guests}</span>
        </div>
      </div>
      <div class="total">
        <span class="total-label">Total Amount</span>
        <span class="total-value">$${data.totalAmount.toFixed(2)}</span>
      </div>
      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${data.reference}" class="btn">View Booking</a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HotelManager. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
