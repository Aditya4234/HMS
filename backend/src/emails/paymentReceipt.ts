export const getPaymentReceiptHTML = (data: {
  name: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  date: string;
  bookingReference: string;
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
    h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 8px; }
    .receipt-header { text-align: center; margin-bottom: 32px; }
    .receipt-header p { color: #64748b; }
    .amount-circle { width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .amount-circle span { font-size: 28px; }
    .amount-text { font-size: 36px; font-weight: 700; color: #16a34a; text-align: center; }
    .details { margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .label { color: #64748b; }
    .value { color: #1e293b; font-weight: 600; }
    .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="receipt-header">
        <h1>Payment Receipt</h1>
        <p>Thank you for your payment, ${data.name}</p>
      </div>
      <div class="amount-circle"><span>💰</span></div>
      <div class="amount-text">$${data.amount.toFixed(2)}</div>
      <div class="details">
        <div class="row">
          <span class="label">Invoice</span>
          <span class="value">${data.invoiceNumber}</span>
        </div>
        <div class="row">
          <span class="label">Booking</span>
          <span class="value">${data.bookingReference}</span>
        </div>
        <div class="row">
          <span class="label">Payment Method</span>
          <span class="value">${data.method}</span>
        </div>
        <div class="row">
          <span class="label">Date</span>
          <span class="value">${data.date}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HotelManager. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
