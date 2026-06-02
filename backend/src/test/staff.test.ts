import request from 'supertest';
import express from 'express';
import cors from 'cors';

import staffRoutes from '../routes/staffRoutes';
import prisma from '../config/database';
import { errorHandler } from '../middlewares/errorHandler';
import { createTestUser, createTestHotel, cleanupDatabase } from './helpers';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/staff', staffRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('Staff API', () => {
  let adminUser: any;
  let customerUser: any;
  let hotel: any;

  beforeAll(async () => {
    hotel = await createTestHotel();
    adminUser = await createTestUser({
      email: `admin-staff-${Date.now()}@example.com`,
      role: 'HOTEL_ADMIN',
      hotelId: hotel.id,
    });
    customerUser = await createTestUser({
      email: `cust-staff-${Date.now()}@example.com`,
      role: 'CUSTOMER',
    });
  });

  describe('GET /api/staff', () => {
    it('should list staff (admin)', async () => {
      const res = await request(app)
        .get('/api/staff')
        .set('Authorization', `Bearer ${adminUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject for customer', async () => {
      const res = await request(app)
        .get('/api/staff')
        .set('Authorization', `Bearer ${customerUser.accessToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/staff', () => {
    it('should create staff (admin)', async () => {
      const res = await request(app)
        .post('/api/staff')
        .set('Authorization', `Bearer ${adminUser.accessToken}`)
        .send({
          fullName: 'John Staff',
          email: `staff-${Date.now()}@example.com`,
          position: 'Receptionist',
          department: 'Front Desk',
          shift: 'MORNING',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('John Staff');
    });

    it('should reject creation by customer', async () => {
      const res = await request(app)
        .post('/api/staff')
        .set('Authorization', `Bearer ${customerUser.accessToken}`)
        .send({
          fullName: 'Hacker',
          email: `hacker-${Date.now()}@example.com`,
          position: 'Receptionist',
          department: 'Front Desk',
        });

      expect(res.status).toBe(403);
    });

    it('should reject duplicate email', async () => {
      const email = `dup-${Date.now()}@example.com`;
      await request(app)
        .post('/api/staff')
        .set('Authorization', `Bearer ${adminUser.accessToken}`)
        .send({
          fullName: 'First Staff',
          email,
          position: 'Manager',
          department: 'Operations',
        });

      const res = await request(app)
        .post('/api/staff')
        .set('Authorization', `Bearer ${adminUser.accessToken}`)
        .send({
          fullName: 'Duplicate Staff',
          email,
          position: 'Manager',
          department: 'Operations',
        });

      expect(res.status).toBe(400);
    });
  });
});
