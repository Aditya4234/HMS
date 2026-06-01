# Hotel Management System

Full-stack hotel management platform with **Node.js/Express** backend and **Next.js** frontend.

## Features

- JWT authentication with refresh tokens (register, login, forgot password + OTP)
- Role-based access: Super Admin, Hotel Admin, Receptionist, Customer
- Room management with image uploads (Cloudinary)
- Booking lifecycle with conflict detection and email notifications
- Payments (Stripe + cash) with invoices
- Staff & customer management
- Reviews, AI room search (OpenRouter), real-time Socket.IO events
- Admin dashboard with analytics

## Tech Stack

| Backend | Frontend |
|---------|----------|
| Express, TypeScript, Prisma | Next.js 16, React 19, Tailwind |
| PostgreSQL, JWT, bcrypt | Zustand, Axios, Framer Motion |
| Stripe, Socket.IO, Cloudinary | react-hook-form, Zod |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed   # optional demo data
npm run dev
```

API: `http://localhost:5000/api`  
Health: `http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App: `http://localhost:3000`

### Environment Variables

**Backend** (`backend/.env`):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Access token secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `FRONTEND_URL` | Yes | `http://localhost:3000` for CORS |
| `STRIPE_SECRET_KEY` | For card payments | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing |
| `CLOUDINARY_*` | For room images | Cloudinary credentials |
| `SMTP_*` | For emails | Gmail or SMTP provider |
| `OPENROUTER_API_KEY` | For AI search | OpenRouter API key |

**Frontend** (`frontend/.env.local`):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5000/api` |

## Demo Accounts (after seed)

Check `backend/prisma/seed.ts` for seeded users. Typical flow:

1. Register as **Hotel Admin** with a hotel name
2. Add rooms, staff, and manage bookings from the dashboard
3. Register a **Customer** account to book rooms

## Project Structure

```
hotel management system/
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── middlewares/
│       └── services/
└── frontend/
    └── src/
        ├── app/
        ├── components/
        └── lib/api.ts
```

## Production Checklist

- [ ] Set strong JWT secrets
- [ ] Use `prisma migrate deploy` instead of `db push`
- [ ] Configure Stripe webhooks to `/api/webhooks/stripe`
- [ ] Set `NODE_ENV=production` and HTTPS for cookies
- [ ] Deploy frontend with correct `NEXT_PUBLIC_API_URL`
