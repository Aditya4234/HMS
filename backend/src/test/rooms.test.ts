import request from "supertest";
import express from "express";
import cors from "cors";

import roomRoutes from "../routes/roomRoutes";
import prisma from "../config/database";
import { errorHandler } from "../middlewares/errorHandler";
import { createTestUser, createTestHotel, createTestRoom, cleanupDatabase } from "./helpers";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/rooms", roomRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("Rooms API", () => {
  let adminUser: any;
  let hotel: any;
  let room: any;

  beforeAll(async () => {
    hotel = await createTestHotel();
    adminUser = await createTestUser({
      email: `admin-rooms-${Date.now()}@example.com`,
      role: "HOTEL_ADMIN",
      hotelId: hotel.id,
    });
    room = await createTestRoom(hotel.id, { roomNumber: `RM-${Date.now()}` });
  });

  describe("GET /api/rooms", () => {
    it("should list all rooms", async () => {
      const res = await request(app)
        .get("/api/rooms")
        .set("Authorization", `Bearer ${adminUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/rooms/:id", () => {
    it("should get room by id", async () => {
      const res = await request(app)
        .get(`/api/rooms/${room.id}`)
        .set("Authorization", `Bearer ${adminUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(room.id);
    });

    it("should return 404 for non-existent room", async () => {
      const res = await request(app)
        .get("/api/rooms/non-existent-id")
        .set("Authorization", `Bearer ${adminUser.accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/rooms", () => {
    it("should create a new room (admin only)", async () => {
      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${adminUser.accessToken}`)
        .send({
          roomNumber: `NEW-${Date.now()}`,
          roomType: "SUITE",
          pricePerNight: "350",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject creation by non-admin", async () => {
      const customer = await createTestUser({
        email: `customer-rooms-${Date.now()}@example.com`,
        role: "CUSTOMER",
      });

      const res = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({
          roomNumber: `UNAUTH-${Date.now()}`,
          roomType: "SINGLE",
          pricePerNight: "100",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/rooms/:id/status", () => {
    it("should update room status", async () => {
      const res = await request(app)
        .patch(`/api/rooms/${room.id}/status`)
        .set("Authorization", `Bearer ${adminUser.accessToken}`)
        .send({ status: "MAINTENANCE" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("MAINTENANCE");
    });
  });
});
