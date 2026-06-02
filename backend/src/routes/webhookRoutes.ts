/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Payment gateway webhook endpoints
 *
 * /api/webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Stripe webhook handler
 *     responses:
 *       200:
 *         description: Webhook received
 *
 * /api/webhooks/razorpay:
 *   post:
 *     tags: [Webhooks]
 *     summary: Razorpay webhook handler
 *     responses:
 *       200:
 *         description: Webhook received
 */
import { Router } from 'express';
import express from 'express';
import { stripeWebhook, razorpayWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/razorpay', express.json(), razorpayWebhook);

export default router;
