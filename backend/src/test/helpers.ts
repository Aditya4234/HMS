import prisma from "../config/database";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { UserRole } from "@prisma/client";

interface TestUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  hotelId?: string;
  accessToken: string;
  refreshToken: string;
}

export async function createTestUser(overrides: Partial<{
  email: string;
  fullName: string;
  password: string;
  role: string;
  hotelId: string;
}> = {}): Promise<TestUser> {
  const email = overrides.email || `test-${Date.now()}@example.com`;
  const password = overrides.password || "TestPass123";
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName: overrides.fullName || "Test User",
      role: (overrides.role || "CUSTOMER") as UserRole,
      hotelId: overrides.hotelId || null,
    },
  });

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as string,
    hotelId: user.hotelId || undefined,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as string,
    hotelId: user.hotelId || undefined,
    accessToken,
    refreshToken,
  };
}

export async function createTestHotel(overrides: Partial<{
  name: string;
  email: string;
  city: string;
}> = {}) {
  return prisma.hotel.create({
    data: {
      name: overrides.name || "Test Hotel",
      email: overrides.email || `hotel-${Date.now()}@example.com`,
      city: overrides.city || "Test City",
      amenities: ["wifi", "ac"],
      images: [],
    },
  });
}

export async function createTestRoom(
  hotelId: string,
  overrides: Partial<{
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
    capacity: number;
    status: string;
  }> = {}
) {
  return prisma.room.create({
    data: {
      roomNumber: overrides.roomNumber || `R${Date.now()}`,
      roomType: overrides.roomType || "DELUXE",
      pricePerNight: overrides.pricePerNight || 200,
      capacity: overrides.capacity || 2,
      status: (overrides.status as any) || "AVAILABLE",
      hotelId,
      amenities: ["wifi", "tv"],
      images: [],
    },
  });
}

export async function createTestBooking(
  userId: string,
  roomId: string,
  overrides: Partial<{
    checkIn: Date;
    checkOut: Date;
    totalAmount: number;
    status: string;
  }> = {}
) {
  const checkIn = overrides.checkIn || new Date("2026-06-15");
  const checkOut = overrides.checkOut || new Date("2026-06-18");
  const nights = Math.ceil(
    Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return prisma.booking.create({
    data: {
      bookingReference: `BK-TEST-${Date.now()}`,
      checkIn,
      checkOut,
      guests: 2,
      totalAmount: overrides.totalAmount || nights * 200,
      status: (overrides.status as any) || "CONFIRMED",
      userId,
      roomId,
    },
  });
}

export async function cleanupDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`);

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables.join(", ")} CASCADE;`);
  } catch {
    // ignore truncate errors
  }
}
