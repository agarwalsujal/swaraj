# Swaraj Backend

A Node.js backend with Express, PostgreSQL, and Google Gemini AI integration featuring authentication, subscription management, and AI query handling.

## Features

- 🔐 **Authentication**: JWT + OAuth (Google)
- 💳 **Subscription Management**: Free, Basic, Premium plans
- 🤖 **AI Integration**: Google Gemini API with query logging
- 📊 **Analytics**: Query logs and usage analytics
- 🔒 **Security**: Rate limiting, input validation, secure headers, Helmet
- 📝 **Logging**: Structured logging with Winston and log rotation
- 🔍 **Monitoring**: Health checks, system metrics, and performance tracking
- 📋 **API Documentation**: Swagger UI for interactive API exploration
- 🚢 **Containerization**: Docker and docker-compose for easy deployment
- 🧪 **Testing**: Jest with unit and integration tests

## Project Structure

```
├── server.js                  # Main application entry point
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables (template)
├── config/
│   ├── db.js                  # Database configuration
│   ├── index.js               # Central configuration loader
│   ├── development.js         # Development environment config
│   ├── production.js          # Production environment config
│   ├── test.js                # Test environment config
│   ├── geminiAI.js            # Gemini AI configuration
│   └── sequelize-cli.js       # Sequelize CLI configuration
├── models/
│   ├── index.js               # Model associations
│   ├── userModel.js           # User model
│   ├── subscriptionModel.js   # Subscription model
│   └── logModel.js            # Log model
├── routes/
│   ├── authRoutes.js          # Authentication routes
│   ├── subscriptionRoutes.js  # Subscription routes
│   └── aiRoutes.js            # AI query routes
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── subscriptionController.js # Subscription logic
│   └── aiController.js        # AI query logic
├── middlewares/
│   ├── authMiddleware.js      # JWT authentication
│   ├── errorMiddleware.js     # Error handling
│   ├── rateLimitMiddleware.js # Rate limiting
│   ├── requestLogMiddleware.js # Request logging
│   ├── subscriptionMiddleware.js # Quota checking
│   └── validationMiddleware.js # Input validation
├── utils/
│   ├── logger.js              # Winston logger setup
│   ├── monitoringUtils.js     # System monitoring utilities
│   ├── swagger.js             # Swagger API documentation
│   └── tokenUtils.js          # JWT token utilities
├── migrations/                # Database migrations
│   ├── 20230601000000-create-users.js
│   ├── 20230601000001-create-subscriptions.js
│   └── 20230601000002-create-logs.js
├── seeders/                   # Database seed data
│   └── 20230601000000-initial-data.js
├── __tests__/                 # Test files
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── Dockerfile                 # Production Docker build
├── Dockerfile.dev             # Development Docker build
└── docker-compose.yml         # Docker-compose configuration
```

## Quick Start

### Option 1: Running with Docker (Recommended)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/swaraj-backend.git
   cd swaraj-backend
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start with Docker Compose**:

   ```bash
   docker-compose up
   ```

   This will start:
   - The Node.js API server at http://localhost:3000
   - PostgreSQL database at localhost:5432
   - Adminer (DB management) at http://localhost:8080

### Option 2: Local Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up PostgreSQL**:
   - Install PostgreSQL
   - Create a database for the project
   - Update database credentials in .env

4. **Run database migrations**:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000/api`
API Documentation will be available at `http://localhost:3000/api/docs`

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swaraj_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
PASSWORD_RESET_EXPIRES_IN=1h

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=1024

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_CONSOLE=true
LOG_FILE=true
LOG_DIR=./logs
```

Environment-specific configurations are stored in the `config` directory.

## API Endpoints

Detailed API documentation is available via Swagger UI at `/api/docs` when running the application.

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

- `GET /api/health` - Basic health check endpoint
- `GET /api/metrics` - Detailed system metrics (protected)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data

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
- **Winston** - Structured logging
- **Swagger** - API documentation
- **Jest** - Testing framework
- **Supertest** - API testing
- **Docker** - Containerization
- **ESLint & Prettier** - Code quality
- **Google Gemini API** - AI functionality

## Production Deployment

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for a complete production readiness checklist.

## License

This project is licensed under the MIT License.
