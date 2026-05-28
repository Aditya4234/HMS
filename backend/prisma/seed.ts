import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@hotel.com' },
    update: {},
    create: {
      email: 'superadmin@hotel.com',
      password: hashedPassword,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`Created super admin: ${superAdmin.email}`);

  const hotel = await prisma.hotel.upsert({
    where: { id: 'seed-hotel-001' },
    update: {},
    create: {
      id: 'seed-hotel-001',
      name: 'Grand Palace Hotel',
      description: 'A luxury hotel in the city center',
      email: 'info@grandpalace.com',
      phone: '+1-234-567-8900',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
      rating: 4.5,
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking'],
      images: [],
      taxRate: 10.0,
      currency: 'USD',
      timezone: 'America/New_York',
      isActive: true,
    },
  });
  console.log(`Created hotel: ${hotel.name}`);

  const hotelAdmin = await prisma.user.upsert({
    where: { email: 'admin@grandpalace.com' },
    update: {},
    create: {
      email: 'admin@grandpalace.com',
      password: hashedPassword,
      fullName: 'Hotel Admin',
      role: 'HOTEL_ADMIN',
      hotelId: hotel.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`Created hotel admin: ${hotelAdmin.email}`);

  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@grandpalace.com' },
    update: {},
    create: {
      email: 'receptionist@grandpalace.com',
      password: hashedPassword,
      fullName: 'John Receptionist',
      role: 'RECEPTIONIST',
      hotelId: hotel.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`Created receptionist: ${receptionist.email}`);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      password: hashedPassword,
      fullName: 'Test Customer',
      role: 'CUSTOMER',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`Created customer: ${customer.email}`);

  const rooms = [
    { roomNumber: '101', roomType: 'Single', pricePerNight: 100, capacity: 1, beds: 1, floor: 1 },
    { roomNumber: '102', roomType: 'Single', pricePerNight: 100, capacity: 1, beds: 1, floor: 1 },
    { roomNumber: '201', roomType: 'Double', pricePerNight: 150, capacity: 2, beds: 1, floor: 2 },
    { roomNumber: '202', roomType: 'Double', pricePerNight: 150, capacity: 2, beds: 1, floor: 2 },
    { roomNumber: '301', roomType: 'Suite', pricePerNight: 300, capacity: 4, beds: 2, floor: 3 },
    { roomNumber: '302', roomType: 'Suite', pricePerNight: 350, capacity: 4, beds: 2, floor: 3 },
    { roomNumber: '401', roomType: 'Deluxe', pricePerNight: 200, capacity: 2, beds: 1, floor: 4 },
    { roomNumber: '402', roomType: 'Deluxe', pricePerNight: 200, capacity: 2, beds: 1, floor: 4 },
    { roomNumber: '501', roomType: 'Penthouse', pricePerNight: 500, capacity: 6, beds: 3, floor: 5 },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { hotelId_roomNumber: { hotelId: hotel.id, roomNumber: room.roomNumber } },
      update: {},
      create: {
        ...room,
        hotelId: hotel.id,
        amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
        images: [],
        isActive: true,
      },
    });
  }
  console.log(`Created ${rooms.length} rooms`);

  console.log('\n--- Seed Complete ---');
  console.log('Login credentials (password: password123):');
  console.log('  Super Admin:  superadmin@hotel.com');
  console.log('  Hotel Admin:  admin@grandpalace.com');
  console.log('  Receptionist: receptionist@grandpalace.com');
  console.log('  Customer:     customer@test.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
