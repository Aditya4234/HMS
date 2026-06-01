import { Router } from 'express';
import express from 'express';
import { stripeWebhook, razorpayWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/razorpay', express.json(), razorpayWebhook);

export default router;
