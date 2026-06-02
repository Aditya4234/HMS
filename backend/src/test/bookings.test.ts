import request from "supertest";
import express from "express";
import cors from "cors";

import bookingRoutes from "../routes/bookingRoutes";
import prisma from "../config/database";
import { errorHandler } from "../middlewares/errorHandler";
import { createTestUser, createTestHotel, createTestRoom, createTestBooking, cleanupDatabase } from "./helpers";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/bookings", bookingRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("Bookings API", () => {
  let hotel: any;
  let room: any;
  let customer: any;
  let booking: any;

  beforeAll(async () => {
    hotel = await createTestHotel();
    room = await createTestRoom(hotel.id, { roomNumber: `BK-RM-${Date.now()}` });
    customer = await createTestUser({
      email: `booking-cust-${Date.now()}@example.com`,
      role: "CUSTOMER",
    });
    booking = await createTestBooking(customer.id, room.id);
  });

  describe("GET /api/bookings", () => {
    it("should list bookings for customer", async () => {
      const res = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${customer.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/bookings/:id", () => {
    it("should get booking by id", async () => {
      const res = await request(app)
        .get(`/api/bookings/${booking.id}`)
        .set("Authorization", `Bearer ${customer.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(booking.id);
    });
  });

  describe("POST /api/bookings", () => {
    const checkIn = "2026-07-01";
    const checkOut = "2026-07-05";

    it("should create a new booking", async () => {
      const availableRoom = await createTestRoom(hotel.id, {
        roomNumber: `NEW-BK-${Date.now()}`,
      });

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({
          roomId: availableRoom.id,
          checkIn,
          checkOut,
          guests: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject booking with invalid dates", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({
          roomId: room.id,
          checkIn: "2026-07-10",
          checkOut: "2026-07-05",
          guests: 2,
        });

      expect(res.status).toBe(400);
    });

    it("should reject booking for unavailable room", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({
          roomId: "non-existent-room",
          checkIn,
          checkOut,
          guests: 2,
        });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/bookings/:id/status", () => {
    it("should update booking status", async () => {
      const res = await request(app)
        .patch(`/api/bookings/${booking.id}/status`)
        .set("Authorization", `Bearer ${customer.accessToken}`)
        .send({ status: "CHECKED_IN" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CHECKED_IN");
    });
  });
});
