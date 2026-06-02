import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import stripe from '../config/stripe';
import { AppError } from '../middlewares/errorHandler';
import { generateInvoiceNumber } from '../utils/helpers';

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) throw new AppError('Missing stripe signature', 400);

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          const payment = await prisma.payment.findFirst({
            where: { paymentIntentId: paymentIntent.id },
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'COMPLETED', transactionId: paymentIntent.id },
            });

            await prisma.booking.update({
              where: { id: bookingId },
              data: {
                paidAmount: { increment: payment.amount },
                status: 'CONFIRMED',
              },
            });

            await prisma.invoice.create({
              data: {
                invoiceNumber: generateInvoiceNumber(),
                amount: payment.amount,
                totalAmount: payment.amount,
                status: 'PAID',
                dueDate: new Date(),
                paidAt: new Date(),
                bookingId,
                paymentId: payment.id,
              },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object;
        await prisma.payment.updateMany({
          where: { paymentIntentId: failedIntent.id },
          data: { status: 'FAILED' },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const razorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      const actualSignature = req.headers['x-razorpay-signature'] as string;
      if (expectedSignature !== actualSignature) {
        throw new AppError('Invalid webhook signature', 400);
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const payload = req.body.payload;
      const paymentId = payload.payment?.entity?.id;
      const receipt = payload.order?.entity?.receipt;

      if (receipt) {
        await prisma.payment.updateMany({
          where: { transactionId: receipt },
          data: { status: 'COMPLETED', transactionId: paymentId },
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
