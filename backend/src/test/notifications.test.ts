import request from 'supertest';
import express from 'express';
import cors from 'cors';

import notificationRoutes from '../routes/notificationRoutes';
import prisma from '../config/database';
import { errorHandler } from '../middlewares/errorHandler';
import { createTestUser, cleanupDatabase } from './helpers';
import { createNotification } from '../controllers/notificationController';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe('Notifications API', () => {
  let user: any;
  let notification: any;

  beforeAll(async () => {
    user = await createTestUser({
      email: `notif-${Date.now()}@example.com`,
      role: 'CUSTOMER',
    });

    notification = await createNotification(
      user.id,
      'Test Notification',
      'This is a test notification',
      'INFO',
      '/dashboard'
    );
  });

  describe('GET /api/notifications', () => {
    it('should list notifications for authenticated user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notification.id}/read`)
        .set('Authorization', `Bearer ${user.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject for non-existent notification', async () => {
      const res = await request(app)
        .patch('/api/notifications/00000000-0000-0000-0000-000000000000/read')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expect(res.status).toBe(500); // Prisma throws on invalid uuid
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification', async () => {
      const newNotif = await createNotification(
        user.id,
        'To Delete',
        'Will be deleted',
        'INFO'
      );

      const res = await request(app)
        .delete(`/api/notifications/${newNotif.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
