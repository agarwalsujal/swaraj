# Swaraj Backend

A Node.js backend with Express, PostgreSQL, and Azure OpenAI integration featuring authentication, subscription management, and AI query handling.

## Features

- 🔐 **Authentication**: JWT + OAuth (Google)
- 💳 **Subscription Management**: Free, Basic, Premium plans
- 🤖 **AI Integration**: Azure OpenAI API with query logging
- 📊 **Analytics**: Query logs and usage analytics
- 🔒 **Security**: Rate limiting, input validation, secure headers
- 📝 **Logging**: Structured logging with incident tracking

## Project Structure

```
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (template)
├── config/
│   ├── db.js                 # Database configuration
│   └── azureAI.js            # Azure OpenAI configuration
├── models/
│   ├── index.js              # Model associations
│   ├── userModel.js          # User model
│   ├── subscriptionModel.js  # Subscription model
│   └── logModel.js           # Log model
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── subscriptionRoutes.js # Subscription routes
│   └── aiRoutes.js           # AI query routes
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── subscriptionController.js # Subscription logic
│   └── aiController.js       # AI query logic
├── middlewares/
│   ├── authMiddleware.js     # JWT authentication
│   ├── errorMiddleware.js    # Error handling
│   ├── rateLimitMiddleware.js # Rate limiting
│   ├── subscriptionMiddleware.js # Quota checking
│   └── validationMiddleware.js # Input validation
└── utils/
    └── tokenUtils.js         # JWT token utilities
```

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env .env.local
   # Edit .env.local with your actual values
   ```

3. **Set up PostgreSQL**:
   - Install PostgreSQL
   - Create a database for the project
   - Update database credentials in .env

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyra_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Azure OpenAI Configuration
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT=your_deployment_name

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email

### Subscriptions
- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/my-subscription` - Get current subscription
- `POST /api/subscriptions/subscribe` - Subscribe to a plan
- `PUT /api/subscriptions/cancel` - Cancel subscription
- `PUT /api/subscriptions/upgrade` - Upgrade subscription
- `GET /api/subscriptions/usage` - Get usage statistics
- `GET /api/subscriptions/quota` - Get remaining quota

### AI Queries
- `POST /api/ai/query` - Process AI query
- `GET /api/ai/logs` - Get query logs
- `GET /api/ai/analysis` - Get query analysis
- `GET /api/ai/incidents` - Get error incidents

### System
- `GET /api/health` - Health check endpoint

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Database Models

### User
- Authentication (email/password + OAuth)
- Email verification status
- Provider information (local/google)

### Subscription
- Plan management (free/basic/premium)
- Quota tracking
- Payment status
- Subscription lifecycle

### Log
- Query logging
- Error tracking
- Analytics data
- Incident management

## Development

The project uses:
- **Express.js** - Web framework
- **Sequelize** - ORM for PostgreSQL
- **Passport.js** - Authentication strategies
- **JWT** - Token-based authentication
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Winston** - Logging (planned)

## Production Deployment

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for a complete production readiness checklist.

## License

This project is licensed under the MIT License.