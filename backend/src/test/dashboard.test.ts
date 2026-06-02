import request from 'supertest';
import express from 'express';
import cors from 'cors';

import dashboardRoutes from '../routes/dashboardRoutes';
import prisma from '../config/database';
import { errorHandler } from '../middlewares/errorHandler';
import { createTestUser, createTestHotel, createTestRoom, createTestBooking, cleanupDatabase } from './helpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/dashboard', dashboardRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('Dashboard API', () => {
  let superAdmin: any;
  let hotel: any;

  beforeAll(async () => {
    hotel = await createTestHotel();
    superAdmin = await createTestUser({
      email: `admin-dash-${Date.now()}@example.com`,
      role: 'SUPER_ADMIN',
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${superAdmin.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalHotels');
      expect(res.body.data).toHaveProperty('totalRooms');
      expect(res.body.data).toHaveProperty('totalBookings');
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/revenue-chart', () => {
    it('should return revenue chart data', async () => {
      const res = await request(app)
        .get('/api/dashboard/revenue-chart')
        .set('Authorization', `Bearer ${superAdmin.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/dashboard/recent-activities', () => {
    it('should return recent activities', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activities')
        .set('Authorization', `Bearer ${superAdmin.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
