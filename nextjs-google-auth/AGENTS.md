# Google Auth Setup

## Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Google Cloud Project with OAuth 2.0 credentials

## Google OAuth Setup
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID (Web application)
3. Add Authorized JavaScript origins: `http://localhost:3000`
4. Add Authorized redirect URIs: `http://localhost:3000`
5. Copy the Client ID

## Backend Setup
```bash
cd backend
npm install
cp .env .env  # Edit with your values
npx prisma migrate dev --name init
npm run dev
```

### Required .env values:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Random 32+ char string
- `JWT_REFRESH_SECRET` - Random 32+ char string  
- `GOOGLE_CLIENT_ID` - From Google Cloud Console

## Frontend Setup
```bash
cd frontend
npm install
cp .env.local .env.local  # Edit with your values
npm run dev
```

### Required .env.local values:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Same Client ID from Google Cloud
- `NEXT_PUBLIC_API_URL` - Backend URL (default: http://localhost:4000/api)

## Running
1. Start PostgreSQL
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open http://localhost:3000

## Verify
- Login page at http://localhost:3000/login
- Click "Continue with Google"
- Select your Google account
- Dashboard should show your profile

## Security Notes
- HTTPS required in production
- Rotate JWT secrets regularly
- Keep refresh tokens in httpOnly cookies
- Enable CSRF protection for production
