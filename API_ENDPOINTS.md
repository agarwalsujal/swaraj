# API Endpoints Reference

This file lists all available REST API endpoints for your backend, grouped by feature/module.

---

## Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login with email and password
- `GET /api/auth/logout` — Logout (client-side token removal)

### OAuth

- `GET /api/auth/google` — Start Google OAuth login
- `GET /api/auth/google/callback` — Google OAuth callback

### Password Reset

- `POST /api/auth/forgot-password` — Request password reset link
- `POST /api/auth/reset-password/:token` — Reset password with token

### Email Verification

- `GET /api/auth/verify-email/:token` — Verify email with token
- `POST /api/auth/resend-verification` — Resend verification email

---

## Subscription Management

- `GET /api/subscriptions/plans` — List available subscription plans
- `GET /api/subscriptions/my-subscription` — Get current user's subscription
- `POST /api/subscriptions/subscribe` — Subscribe to a plan
- `PUT /api/subscriptions/cancel` — Cancel current subscription
- `PUT /api/subscriptions/upgrade` — Upgrade subscription plan
- `GET /api/subscriptions/usage` — Get usage statistics
- `GET /api/subscriptions/quota` — Get remaining quota

---

## AI Query & Logs

- `POST /api/ai/query` — Submit an AI query (Azure OpenAI)
- `GET /api/ai/logs` — Get AI query logs
- `GET /api/ai/analysis` — Get AI query analytics
- `GET /api/ai/incidents` — Get error/incident logs

---

## System

- `GET /api/health` — Health check endpoint

---

**Note:**

- All endpoints under `/api/auth`, `/api/subscriptions`, and `/api/ai` are protected and may require JWT authentication except for registration, login, OAuth, and password reset/verification endpoints.
- For details on request/response formats, see the README or controller files.
