import { PrismaClient, UserRole, RoomStatus, BookingStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hotel.deleteMany();

  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  const staffPassword = await bcrypt.hash("Staff@123", 12);
  const customerPassword = await bcrypt.hash("Guest@123", 12);

  // Create super admin
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@hotelmanager.com",
      password: hashedPassword,
      fullName: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      phoneNumber: "+1-555-0001",
      emailVerified: true,
    },
  });

  // Create hotels
  const grandHotel = await prisma.hotel.create({
    data: {
      name: "Grand Plaza Hotel",
      description: "A luxurious 5-star hotel in the heart of the city with world-class amenities and breathtaking views.",
      email: "info@grandplaza.com",
      phone: "+1-555-0100",
      address: "123 Luxury Avenue",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001",
      rating: 4.8,
      checkInTime: "15:00",
      checkOutTime: "11:00",
      taxRate: 8.875,
      currency: "USD",
      timezone: "America/New_York",
      amenities: ["Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "WiFi", "Room Service", "Concierge", "Business Center"],
      images: [],
    },
  });

  const oceanView = await prisma.hotel.create({
    data: {
      name: "Ocean View Resort",
      description: "Beachfront resort offering stunning ocean views, tropical gardens, and exceptional hospitality.",
      email: "reservations@oceanview.com",
      phone: "+1-555-0200",
      address: "456 Beach Road",
      city: "Miami",
      state: "FL",
      country: "USA",
      zipCode: "33101",
      rating: 4.6,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      taxRate: 7.5,
      currency: "USD",
      timezone: "America/New_York",
      amenities: ["Beach Access", "Pool", "Spa", "Restaurant", "Bar", "Parking", "WiFi", "Kids Club"],
      images: [],
    },
  });

  // Create hotel admins
  const hotelAdmin1 = await prisma.user.create({
    data: {
      email: "manager@grandplaza.com",
      password: hashedPassword,
      fullName: "John Smith",
      role: UserRole.HOTEL_ADMIN,
      hotelId: grandHotel.id,
      phoneNumber: "+1-555-0101",
      emailVerified: true,
    },
  });

  const hotelAdmin2 = await prisma.user.create({
    data: {
      email: "manager@oceanview.com",
      password: hashedPassword,
      fullName: "Sarah Johnson",
      role: UserRole.HOTEL_ADMIN,
      hotelId: oceanView.id,
      phoneNumber: "+1-555-0201",
      emailVerified: true,
    },
  });

  // Create receptionists
  const receptionist1 = await prisma.user.create({
    data: {
      email: "reception@grandplaza.com",
      password: staffPassword,
      fullName: "Emily Davis",
      role: UserRole.RECEPTIONIST,
      hotelId: grandHotel.id,
      phoneNumber: "+1-555-0102",
      emailVerified: true,
    },
  });

  // Create customers
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        password: customerPassword,
        fullName: "Alice Williams",
        role: UserRole.CUSTOMER,
        phoneNumber: "+1-555-1001",
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        password: customerPassword,
        fullName: "Bob Martinez",
        role: UserRole.CUSTOMER,
        phoneNumber: "+1-555-1002",
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "charlie@example.com",
        password: customerPassword,
        fullName: "Charlie Brown",
        role: UserRole.CUSTOMER,
        phoneNumber: "+1-555-1003",
        emailVerified: true,
      },
    }),
  ]);

  // Create rooms for Grand Plaza
  const roomTypes = [
    { type: "SINGLE", price: 199, capacity: 1, beds: 1, size: 28 },
    { type: "DOUBLE", price: 299, capacity: 2, beds: 1, size: 35 },
    { type: "TWIN", price: 279, capacity: 2, beds: 2, size: 38 },
    { type: "DELUXE", price: 399, capacity: 2, beds: 1, size: 45 },
    { type: "SUITE", price: 599, capacity: 4, beds: 2, size: 65 },
    { type: "PENTHOUSE", price: 1299, capacity: 6, beds: 3, size: 120 },
  ];

  const grandRooms = [];
  const amenities = ["WiFi", "AC", "TV", "Mini Bar", "Safe", "Work Desk", "Room Service"];

  for (let floor = 1; floor <= 10; floor++) {
    for (const rt of roomTypes) {
      const roomNum = `${floor}${String(roomTypes.indexOf(rt) + 1).padStart(2, "0")}`;
      const room = await prisma.room.create({
        data: {
          roomNumber: roomNum,
          roomType: rt.type,
          floor,
          description: `Beautiful ${rt.type.toLowerCase()} room on floor ${floor} with modern amenities.`,
          pricePerNight: rt.price + (floor > 5 ? 50 : 0),
          capacity: rt.capacity,
          size: rt.size,
          beds: rt.beds,
          amenities,
          images: [],
          status: RoomStatus.AVAILABLE,
          hotelId: grandHotel.id,
        },
      });
      grandRooms.push(room);
    }
  }

  // Create rooms for Ocean View
  const oceanRooms = [];
  for (let floor = 1; floor <= 6; floor++) {
    for (const rt of roomTypes.slice(0, 4)) {
      const roomNum = `${floor}${String(roomTypes.indexOf(rt) + 1).padStart(2, "0")}`;
      const room = await prisma.room.create({
        data: {
          roomNumber: roomNum,
          roomType: rt.type,
          floor,
          description: `Ocean-facing ${rt.type.toLowerCase()} room with stunning sea views.`,
          pricePerNight: rt.price + 50,
          capacity: rt.capacity,
          size: rt.size,
          beds: rt.beds,
          amenities: [...amenities, "Ocean View", "Balcony"],
          images: [],
          status: RoomStatus.AVAILABLE,
          hotelId: oceanView.id,
        },
      });
      oceanRooms.push(room);
    }
  }

  // Create sample bookings
  const now = new Date();
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        bookingReference: "BK-ALICE-001",
        checkIn: new Date(now.getTime() + 7 * 86400000),
        checkOut: new Date(now.getTime() + 10 * 86400000),
        guests: 2,
        status: BookingStatus.CONFIRMED,
        totalAmount: 1197,
        taxAmount: 106.23,
        paidAmount: 1197,
        specialRequests: "Extra pillows, late check-in",
        roomId: grandRooms[30].id,
        userId: customers[0].id,
      },
    }),
    prisma.booking.create({
      data: {
        bookingReference: "BK-BOB-001",
        checkIn: new Date(now.getTime() + 14 * 86400000),
        checkOut: new Date(now.getTime() + 17 * 86400000),
        guests: 1,
        status: BookingStatus.CONFIRMED,
        totalAmount: 597,
        taxAmount: 52.99,
        paidAmount: 597,
        roomId: grandRooms[0].id,
        userId: customers[1].id,
      },
    }),
    prisma.booking.create({
      data: {
        bookingReference: "BK-CHARLIE-001",
        checkIn: new Date(now.getTime() + 3 * 86400000),
        checkOut: new Date(now.getTime() + 6 * 86400000),
        guests: 3,
        status: BookingStatus.CONFIRMED,
        totalAmount: 1797,
        taxAmount: 159.53,
        paidAmount: 1797,
        specialRequests: "Airport pickup needed",
        roomId: oceanRooms[10].id,
        userId: customers[2].id,
      },
    }),
  ]);

  // Create payments for bookings
  await Promise.all([
    prisma.payment.create({
      data: {
        amount: 1197,
        status: PaymentStatus.COMPLETED,
        method: PaymentMethod.STRIPE,
        transactionId: `pi_test_${Date.now()}_1`,
        bookingId: bookings[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 597,
        status: PaymentStatus.COMPLETED,
        method: PaymentMethod.CARD,
        transactionId: `pi_test_${Date.now()}_2`,
        bookingId: bookings[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        amount: 1797,
        status: PaymentStatus.COMPLETED,
        method: PaymentMethod.STRIPE,
        transactionId: `pi_test_${Date.now()}_3`,
        bookingId: bookings[2].id,
      },
    }),
  ]);

  // Create invoices
  await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(1).padStart(4, "0")}`,
        amount: 1197,
        taxAmount: 106.23,
        totalAmount: 1303.23,
        status: "PAID",
        dueDate: new Date(now.getTime() + 30 * 86400000),
        paidAt: now,
        bookingId: bookings[0].id,
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(2).padStart(4, "0")}`,
        amount: 597,
        taxAmount: 52.99,
        totalAmount: 649.99,
        status: "PAID",
        dueDate: new Date(now.getTime() + 30 * 86400000),
        paidAt: now,
        bookingId: bookings[1].id,
      },
    }),
  ]);

  // Create staff
  await Promise.all([
    prisma.staff.create({
      data: {
        employeeId: "EMP-GP-001",
        fullName: "Maria Garcia",
        email: "maria@grandplaza.com",
        phoneNumber: "+1-555-2001",
        position: "Head Chef",
        department: "Kitchen",
        salary: 65000,
        gender: "FEMALE",
        shift: "MORNING",
        hotelId: grandHotel.id,
      },
    }),
    prisma.staff.create({
      data: {
        employeeId: "EMP-GP-002",
        fullName: "James Wilson",
        email: "james@grandplaza.com",
        phoneNumber: "+1-555-2002",
        position: "Housekeeping Manager",
        department: "Housekeeping",
        salary: 45000,
        gender: "MALE",
        shift: "MORNING",
        hotelId: grandHotel.id,
      },
    }),
    prisma.staff.create({
      data: {
        employeeId: "EMP-OV-001",
        fullName: "Lisa Anderson",
        email: "lisa@oceanview.com",
        phoneNumber: "+1-555-2003",
        position: "Front Desk Manager",
        department: "Front Office",
        salary: 52000,
        gender: "FEMALE",
        shift: "AFTERNOON",
        hotelId: oceanView.id,
      },
    }),
    prisma.staff.create({
      data: {
        employeeId: "EMP-OV-002",
        fullName: "David Thompson",
        email: "david@oceanview.com",
        phoneNumber: "+1-555-2004",
        position: "Bell Captain",
        department: "Concierge",
        salary: 38000,
        gender: "MALE",
        shift: "NIGHT",
        hotelId: oceanView.id,
      },
    }),
  ]);

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Absolutely amazing stay! The staff was incredibly welcoming and the room was spotless.",
        userId: customers[0].id,
        hotelId: grandHotel.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Great hotel with excellent amenities. The pool was fantastic.",
        userId: customers[1].id,
        hotelId: grandHotel.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Breathtaking ocean views! Best vacation ever. Will definitely come back.",
        userId: customers[2].id,
        hotelId: oceanView.id,
      },
    }),
  ]);

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        title: "Welcome to HotelManager!",
        message: "Your account has been created successfully. Start managing your hotel operations.",
        type: "SUCCESS",
        userId: superAdmin.id,
      },
    }),
    prisma.notification.create({
      data: {
        title: "Booking Confirmed",
        message: "Booking BK-ALICE-001 has been confirmed for Grand Plaza Hotel.",
        type: "INFO",
        userId: customers[0].id,
        link: "/dashboard/bookings",
      },
    }),
    prisma.notification.create({
      data: {
        title: "New Booking Alert",
        message: "A new booking has been made for Penthouse suite.",
        type: "INFO",
        userId: hotelAdmin1.id,
        link: "/dashboard/bookings",
      },
    }),
    prisma.notification.create({
      data: {
        title: "Payment Received",
        message: "Payment of $1,797 received for booking BK-CHARLIE-001.",
        type: "SUCCESS",
        userId: hotelAdmin2.id,
        link: "/dashboard/payments",
      },
    }),
  ]);

  // Create activity logs
  await Promise.all([
    prisma.activityLog.create({
      data: {
        action: "USER_REGISTERED",
        entity: "USER",
        details: "Super admin account created",
        userId: superAdmin.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "HOTEL_CREATED",
        entity: "HOTEL",
        details: "Grand Plaza Hotel added to system",
        userId: superAdmin.id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: "BOOKING_CREATED",
        entity: "BOOKING",
        entityId: bookings[0].id,
        details: `Booking ${bookings[0].bookingReference} created for Alice Williams`,
        userId: customers[0].id,
      },
    }),
  ]);

  console.log("✅ Seeding completed!");
  console.log("📧 Login Credentials:");
  console.log("   Super Admin: admin@hotelmanager.com / Admin@123");
  console.log("   Hotel Admin: manager@grandplaza.com / Admin@123");
  console.log("   Receptionist: reception@grandplaza.com / Staff@123");
  console.log("   Customer: alice@example.com / Guest@123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
