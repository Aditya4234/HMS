import request from 'supertest';
import express from 'express';
import cors from 'cors';

import paymentRoutes from '../routes/paymentRoutes';
import prisma from '../config/database';
import { errorHandler } from '../middlewares/errorHandler';
import { createTestUser, createTestHotel, createTestRoom, createTestBooking, cleanupDatabase } from './helpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/payments', paymentRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('Payments API', () => {
  let adminUser: any;
  let customerUser: any;
  let hotel: any;
  let room: any;
  let booking: any;

  beforeAll(async () => {
    hotel = await createTestHotel();
    adminUser = await createTestUser({
      email: `admin-pay-${Date.now()}@example.com`,
      role: 'HOTEL_ADMIN',
      hotelId: hotel.id,
    });
    customerUser = await createTestUser({
      email: `cust-pay-${Date.now()}@example.com`,
      role: 'CUSTOMER',
    });
    room = await createTestRoom(hotel.id, { roomNumber: `PAY-RM-${Date.now()}` });
    booking = await createTestBooking(customerUser.id, room.id, {
      totalAmount: 500,
      status: 'CONFIRMED',
    });
  });

  describe('GET /api/payments', () => {
    it('should return empty payments list', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${adminUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/payments');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/payments', () => {
    it('should create a cash payment', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${adminUser.accessToken}`)
        .send({
          bookingId: booking.id,
          method: 'CASH',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.method).toBe('CASH');
      expect(res.body.data.payment.status).toBe('COMPLETED');
    });

    it('should create a stripe payment (pending)', async () => {
      const newBooking = await createTestBooking(customerUser.id, room.id, {
        totalAmount: 300,
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({
          bookingId: newBooking.id,
          method: 'STRIPE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.method).toBe('STRIPE');
      expect(res.body.data.payment.status).toBe('PENDING');
    });

    it('should reject invalid booking', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${adminUser.accessToken}`)
        .send({
          bookingId: '00000000-0000-0000-0000-000000000000',
          method: 'CASH',
        });

      expect(res.status).toBe(404);
    });

    it('should reject invalid payment method', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${adminUser.accessToken}`)
        .send({
          bookingId: booking.id,
          method: 'INVALID',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/payments/stats', () => {
    it('should return payment stats', async () => {
      const res = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${adminUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalRevenue');
      expect(res.body.data).toHaveProperty('completedPayments');
      expect(res.body.data).toHaveProperty('pendingPayments');
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    it('should reject refund by customer', async () => {
      const payment = await prisma.payment.findFirst({
        where: { bookingId: booking.id },
      });

      if (payment) {
        const res = await request(app)
          .post(`/api/payments/${payment.id}/refund`)
          .set('Authorization', `Bearer ${customerUser.accessToken}`)
          .send({ amount: 100 });

        expect(res.status).toBe(403);
      }
    });
  });
});
