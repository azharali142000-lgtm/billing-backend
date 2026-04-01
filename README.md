# Billr Cloud Billing

Production-ready Node.js and Express backend for a cloud billing application using PostgreSQL, Prisma, role-based access, hosted web deployment, Firebase OTP auth support, and a Capacitor Android shell.

## Cloud Architecture

- Android APK shell: Capacitor WebView
- Frontend hosting: Vercel
- Backend API hosting: Render
- Database: Neon PostgreSQL
- OTP auth: Firebase Phone Authentication

Important production rule:

- Do not point production web or APK builds to `localhost`
- The Capacitor shell should load the live hosted frontend URL
- Frontend and backend changes can go live without rebuilding the APK

## Features

- JWT authentication
- Firebase OTP authentication endpoint
- Role-based access for `admin` and `worker`
- PostgreSQL with Prisma ORM
- Invoice creation with stock deduction and customer balance updates
- Payment recording with balance reduction
- Customer and product listing APIs
- Environment-based configuration
- Centralized error handling

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/firebase-login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Customers

- `GET /api/customers`

### Products

- `GET /api/products`

### Invoices

- `POST /api/invoices`

### Payments

- `POST /api/payments`

## Auth Notes

The requested `users` table includes `id`, `name`, `phone`, and `role`. To support secure JWT login, this backend adds a `password_hash` column to the `users` table. Login uses `phone` and `password`.

For cloud/mobile production, Firebase OTP is the preferred flow:

1. Frontend verifies phone number with Firebase
2. Frontend gets Firebase ID token
3. Frontend calls `POST /api/auth/firebase-login`
4. Backend verifies the Firebase ID token
5. Backend creates the user on first login with default role `worker`
6. Backend returns access + refresh tokens for API session handling

Registration behavior:

- If no users exist yet, the first registration creates an `admin`
- After that, only an authenticated `admin` can create more users

## Local Setup

1. Install Node.js 20+ and PostgreSQL 15+
2. Copy `.env.example` to `.env`
3. Update `DATABASE_URL` and `JWT_SECRET`
4. Install dependencies:

```bash
npm install
```

5. Generate Prisma client:

```bash
npm run prisma:generate
```

6. Create and apply migrations:

```bash
npm run prisma:migrate -- --name init
```

7. Optionally seed an initial admin:

```bash
npm run prisma:seed
```

8. Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Example Requests

### Register first admin

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "phone": "9999999999",
  "password": "StrongPassword123!",
  "role": "admin"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "9999999999",
  "password": "StrongPassword123!"
}
```

### Create invoice

```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ]
}
```

### Record payment

```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "amount": 250.0,
  "method": "cash"
}
```

## Render Deployment

This project is portable and can run on Render, Koyeb, a VPS, or any Node.js host without code changes.

### Required environment variables

```env
DATABASE_URL=postgresql://neondb_owner:npg_DPt1TjboFLI9@ep-restless-mouse-a1osx0b0.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=mysecret
PORT=3000
NODE_ENV=production
```

Optional variables:

```env
CORS_ORIGINS=https://your-frontend-domain.vercel.app
APP_BASE_URL=https://your-backend-domain.onrender.com
API_BASE_URL=https://your-backend-domain.onrender.com
FRONTEND_URL=https://your-frontend-domain.vercel.app
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Render service configuration

- Runtime: Node
- Build command: `npm install && npx prisma generate`
- Start command: `node src/server.js`

Do not add a deploy command that runs Prisma migrations unless you explicitly want schema changes to run during deploy.

### Render click path

1. Create a new `Web Service`
2. Connect the GitHub repository
3. Select the `billing-backend` repository
4. Add the environment variables above
5. Set the build and start commands
6. Deploy

### Post-deploy checks

After deployment, verify:

- `https://your-render-url/health`
- `https://your-render-url/api/customers`

Expected behavior:

- `/health` returns JSON
- `/api/customers` returns JSON or an auth error JSON response

## Deployment Notes

- Set a strong `JWT_SECRET`
- Put the app behind HTTPS
- Restrict CORS to known frontend origins
- Use managed PostgreSQL backups and monitoring
- Set Firebase Admin credentials in environment variables if using OTP auth
- Use [vercel.json](/D:/billing-backend/vercel.json) for static frontend routing
- Use [capacitor-apk](/D:/billing-backend/capacitor-apk) as the live-URL Android shell

## Cloud-Ready Auth

The backend now supports mobile/cloud session handling:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Login returns:

- `accessToken`
- `refreshToken`
- `user`

`accessToken` is intended for API calls. `refreshToken` is stored server-side as a hash and can be rotated with `/api/auth/refresh`.

Recommended production setup:

1. Host PostgreSQL on a managed provider
2. Deploy the API behind HTTPS
3. Set `APP_BASE_URL`
4. Set `CORS_ORIGINS` to your web and mobile dev/prod origins
5. Use a long random `JWT_SECRET`

## Android APK Shell

The Capacitor Android shell is scaffolded in [capacitor-apk](/D:/billing-backend/capacitor-apk).

It is configured to load a live hosted URL instead of localhost.
