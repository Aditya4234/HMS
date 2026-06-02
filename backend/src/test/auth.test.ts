import request from "supertest";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "../routes/authRoutes";
import prisma from "../config/database";
import { errorHandler } from "../middlewares/errorHandler";
import { createTestUser, cleanupDatabase } from "./helpers";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

beforeAll(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await prisma.$disconnect();
});

describe("Auth API", () => {
  const testUser = {
    fullName: "Test User",
    email: `auth-test-${Date.now()}@example.com`,
    password: "TestPass123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "invalid-email" });

      expect(res.status).toBe(400);
    });

    it("should reject short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: `short-${Date.now()}@example.com`, password: "123" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it("should reject invalid password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });

    it("should reject non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "TestPass123" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should return user profile with valid token", async () => {
      const user = await createTestUser();
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${user.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(user.email);
    });

    it("should reject without token", async () => {
      const res = await request(app).get("/api/auth/profile");

      expect(res.status).toBe(401);
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should send OTP for existing email", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
