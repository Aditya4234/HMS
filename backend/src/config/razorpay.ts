import Razorpay from 'razorpay';

let razorpay: Razorpay | null = null;

const getRazorpay = (): Razorpay => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error('RAZORPAY_KEY_ID not configured');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }
  return razorpay;
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR', receipt?: string) => {
  return getRazorpay().orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
  });
};

export const verifyRazorpayPayment = (orderId: string, paymentId: string, signature: string): boolean => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
};

export default getRazorpay;
