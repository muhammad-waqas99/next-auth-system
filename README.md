# Next Auth System

## Badges
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com/)
---

A full-stack authentication system built with Next.js and TypeScript.

The project includes email/password authentication, Google OAuth, email verification, password reset, session management, and two-factor authentication. It is designed as a reusable authentication system that can also be integrated into future applications.

## Live Demo

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel)](https://next-auth-system-opal.vercel.app/)

## Features

* Email and password authentication
* Google OAuth login
* Email verification
* Forgot and reset password
* Change password
* Set password for Google accounts
* Access and refresh token authentication
* Protected routes
* Session and device management
* Logout from current session
* Logout from specific sessions
* Logout from all sessions
* Two-factor authentication (2FA)
* 2FA backup codes
* 2FA login verification
* Centralized error handling
* Request validation with Zod
* Reusable authentication utilities
* Light and dark themes
* Responsive authentication UI

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zustand
* Axios
* React Hot Toast

### Backend

* Next.js App Router
* Next.js Route Handlers
* MongoDB
* Mongoose
* JSON Web Tokens
* bcryptjs
* Zod

### Authentication & Email

* Google OAuth 2.0
* Nodemailer
* Gmail SMTP
* TOTP-based 2FA
* QR Code generation

## Authentication Flow

The system uses short-lived access tokens and refresh tokens stored in HTTP-only cookies.

Protected routes use a shared authentication function to validate the access token and retrieve the current user. Refresh tokens are stored securely as hashes and are associated with individual sessions, allowing users to manage their logged-in devices.

## Project Structure

```text
app/
├── (auth)/
├── (protected)/
├── (public)/
├── api/
│   └── auth/
├── components/
├── dbconfig/
├── lib/
├── models/
├── providers/
└── store/
```

The project keeps authentication logic, API routes, database models, reusable UI components, and shared utilities separated to make the system easier to extend.

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd next-auth-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

GMAIL_USER=
GMAIL_APP_PASSWORD=

DOMAIN=http://localhost:3000
```

Add the required values for MongoDB, JWT secrets, Google OAuth, and Gmail SMTP.

### 4. Run the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Notes

* `.env.local` should never be committed to the repository.
* Google OAuth redirect URIs must match the configured environment.
* Gmail SMTP requires a Google App Password when using a Google account for sending emails.

## License

This project is for learning and development purposes.

````





