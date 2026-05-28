# Hotel Management System

A full-stack hotel management system built with **Node.js/Express** (backend) and **Next.js** (frontend).

## Tech Stack

### Backend
- Node.js, Express, TypeScript
- Prisma ORM with PostgreSQL
- JWT Authentication, bcrypt
- Stripe Payments, Socket.io
- Cloudinary, Nodemailer, Winston

### Frontend
- Next.js, TypeScript
- Tailwind CSS
- REST API & Socket.io client

## Features
- User authentication & role-based access
- Room booking & management
- Payment processing (Stripe)
- Real-time notifications (Socket.io)
- Admin dashboard
- Hotel inventory & staff management

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # configure your environment
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
