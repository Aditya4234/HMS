import api, { authAPI, roomAPI, bookingAPI, customerAPI } from "@/lib/api";

// Mock axios
jest.mock("axios", () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return mockAxios;
});

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  describe("authAPI", () => {
    it("login sends correct request", () => {
      const spy = jest.spyOn(api, "post");
      authAPI.login({ email: "test@test.com", password: "pass" });
      expect(spy).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "pass",
      });
    });

    it("register sends correct request", () => {
      const spy = jest.spyOn(api, "post");
      authAPI.register({ fullName: "Test", email: "test@test.com", password: "Test1234" });
      expect(spy).toHaveBeenCalledWith("/auth/register", {
        fullName: "Test",
        email: "test@test.com",
        password: "Test1234",
      });
    });

    it("forgotPassword sends correct request", () => {
      const spy = jest.spyOn(api, "post");
      authAPI.forgotPassword({ email: "test@test.com" });
      expect(spy).toHaveBeenCalledWith("/auth/forgot-password", {
        email: "test@test.com",
      });
    });
  });

  describe("roomAPI", () => {
    it("getAll sends correct request", () => {
      const spy = jest.spyOn(api, "get");
      roomAPI.getAll({ page: 1, limit: 10 });
      expect(spy).toHaveBeenCalledWith("/rooms", { params: { page: 1, limit: 10 } });
    });

    it("getById sends correct request", () => {
      const spy = jest.spyOn(api, "get");
      roomAPI.getById("room-1");
      expect(spy).toHaveBeenCalledWith("/rooms/room-1");
    });

    it("create sends correct request", () => {
      const spy = jest.spyOn(api, "post");
      roomAPI.create({ roomNumber: "101", roomType: "DELUXE", pricePerNight: 200 });
      expect(spy).toHaveBeenCalledWith("/rooms", {
        roomNumber: "101",
        roomType: "DELUXE",
        pricePerNight: 200,
      });
    });
  });

  describe("bookingAPI", () => {
    it("getAll sends correct request", () => {
      const spy = jest.spyOn(api, "get");
      bookingAPI.getAll({ status: "CONFIRMED" });
      expect(spy).toHaveBeenCalledWith("/bookings", { params: { status: "CONFIRMED" } });
    });

    it("create sends correct request", () => {
      const spy = jest.spyOn(api, "post");
      bookingAPI.create({
        roomId: "room-1",
        checkIn: "2026-06-01",
        checkOut: "2026-06-05",
      });
      expect(spy).toHaveBeenCalledWith("/bookings", {
        roomId: "room-1",
        checkIn: "2026-06-01",
        checkOut: "2026-06-05",
      });
    });
  });

  describe("customerAPI", () => {
    it("getAll sends correct request", () => {
      const spy = jest.spyOn(api, "get");
      customerAPI.getAll({ search: "John" });
      expect(spy).toHaveBeenCalledWith("/customers", { params: { search: "John" } });
    });
  });
});
