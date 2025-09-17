# Swaraj Backend

A robust Node.js backend API with Express.js, PostgreSQL, and Google Gemini AI integration. Features comprehensive authentication, subscription management, AI query processing, and production-ready security measures.

## 🚀 Features

- **🔐 Authentication**: JWT-based authentication with optional Google OAuth2 integration
- **💳 Subscription Management**: Tiered plans (Free, Basic, Premium) with quota enforcement
- **🤖 AI Integration**: Google Gemini API with intelligent query processing and logging
- **📊 Analytics & Monitoring**: Comprehensive logging, usage analytics, and health monitoring
- **🔒 Security**: Rate limiting, input validation, secure headers, CORS protection
- **📝 Structured Logging**: Winston-based logging with rotation and multiple transports
- **🐳 Containerization**: Docker-ready with multi-stage builds and docker-compose
- **📋 API Documentation**: Interactive Swagger UI documentation
- **🧪 Testing**: Comprehensive unit and integration tests with Jest
- **⚡ Performance**: Optimized queries, connection pooling, and caching strategies

## 🏗️ Architecture Overview

```
├── 🎯 Entry Point
│   └── server.js                    # Application entry point with middleware setup
├── ⚙️ Configuration
│   ├── config/                      # Environment-specific configurations
│   │   ├── index.js                 # Configuration loader
│   │   ├── development.js           # Development settings
│   │   ├── production.js            # Production settings
│   │   ├── db.js                    # Database connection setup
│   │   └── sequelize-cli.js         # Sequelize CLI configuration
├── 🗄️ Data Layer
│   ├── models/                      # Sequelize ORM models
│   ├── migrations/                  # Database schema migrations
│   └── seeders/                     # Database seed data
├── 🛣️ API Layer
│   ├── routes/                      # API route definitions
│   ├── controllers/                 # Business logic controllers
│   └── middlewares/                 # Custom middleware functions
├── 🔧 Utilities
│   ├── utils/                       # Helper functions and utilities
│   └── scripts/                     # Automation and deployment scripts
├── 🧪 Testing
│   └── __tests__/                   # Unit and integration tests
└── 🐳 Deployment
    ├── Dockerfile                   # Production container build
    ├── Dockerfile.dev              # Development container build
    └── docker-compose.yml          # Multi-service orchestration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 13.x
- **Docker** (optional, for containerized setup)
- **Git** for version control

### Option 1: Docker Deployment (Recommended for Production)

1. **Clone and configure**:

   ```bash
   git clone https://github.com/agarwalsujal/swaraj.git
   cd swaraj
   cp .env.example .env
   ```

2. **Configure environment variables** (see [Configuration](#-configuration)):

   ```bash
   # Edit .env with your production values
   nano .env
   ```

3. **Deploy with Docker**:

   ```bash
   docker-compose up -d --build
   ```

4. **Verify deployment**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Option 2: Local Development

1. **Setup and install**:

   ```bash
   git clone https://github.com/agarwalsujal/swaraj.git
   cd swaraj
   npm install
   cp .env.example .env
   ```

2. **Configure PostgreSQL**:

   ```bash
   # Create database
   createdb cyra_db

   # Run migrations and seed data
   npm run db:migrate
   npm run db:seed
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Access services**:
   - API Server: http://localhost:3000/api
   - API Documentation: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/api/health

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

| Category     | Variable                  | Description                            | Required |
| ------------ | ------------------------- | -------------------------------------- | -------- |
| **Server**   | `NODE_ENV`                | Environment (development/production)   | ✅       |
|              | `PORT`                    | Server port (default: 3000)            | ✅       |
| **Database** | `DB_HOST`                 | PostgreSQL host                        | ✅       |
|              | `DB_PORT`                 | PostgreSQL port                        | ✅       |
|              | `DB_NAME`                 | Database name                          | ✅       |
|              | `DB_USER`                 | Database username                      | ✅       |
|              | `DB_PASSWORD`             | Database password                      | ✅       |
| **JWT**      | `JWT_SECRET`              | JWT signing secret (use strong secret) | ✅       |
|              | `JWT_EXPIRES_IN`          | Token expiration time                  | ✅       |
| **OAuth**    | `GOOGLE_CLIENT_ID`        | Google OAuth client ID                 | ❌       |
|              | `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret             | ❌       |
| **AI**       | `GEMINI_API_KEY`          | Google Gemini API key                  | ✅       |
| **Security** | `RATE_LIMIT_MAX_REQUESTS` | Max requests per window                | ❌       |
| **Frontend** | `FRONTEND_URL`            | Frontend application URL               | ✅       |

> ⚠️ **Security Note**: Never commit `.env` files to version control. Use secure secret management in production.

### Production Configuration

For production deployments, ensure:

- **Strong JWT secrets** (minimum 256-bit)
- **Database SSL connections** enabled
- **Rate limiting** configured appropriately
- **CORS** restricted to allowed origins
- **Logging level** set to 'info' or 'warn'
- **Error reporting** configured (e.g., Sentry)

## 📋 API Documentation

### Core Endpoints

#### Authentication

```
POST   /api/auth/register           # Create new account
POST   /api/auth/login              # User login
GET    /api/auth/google             # Google OAuth (if configured)
POST   /api/auth/forgot-password    # Password reset request
POST   /api/auth/reset-password     # Password reset confirmation
```

#### Subscription Management

```
GET    /api/subscriptions/plans     # Available subscription plans
GET    /api/subscriptions/current   # Current user subscription
POST   /api/subscriptions/subscribe # Subscribe to plan
GET    /api/subscriptions/usage     # Usage statistics
```

#### AI Services

```
POST   /api/ai/query               # Process AI query
GET    /api/ai/logs                # Query history
GET    /api/ai/analysis            # Usage analytics
```

#### System

```
GET    /api/health                 # Health check
GET    /api/metrics                # System metrics (authenticated)
```

### Interactive Documentation

Full API documentation with request/response examples is available at:

- Development: http://localhost:3000/api/docs
- Production: https://yourdomain.com/api/docs

## 🗄️ Database Schema

### Core Models

**Users**

- Authentication and profile management
- Provider support (local/Google OAuth)
- Email verification status

**Subscriptions**

- Plan management and billing
- Usage quota tracking
- Subscription lifecycle

**Logs**

- AI query logging
- Error tracking and analytics
- Performance monitoring

### Database Operations

```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Reset database (development only)
npm run db:reset
```

## 🔧 Development Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm start`          | Production server                  |
| `npm run dev`        | Development server with hot reload |
| `npm test`           | Run test suite                     |
| `npm run lint`       | Code linting with ESLint           |
| `npm run format`     | Code formatting with Prettier      |
| `npm run db:migrate` | Run database migrations            |
| `npm run db:seed`    | Seed database with initial data    |

## 🚢 Deployment

### Production Checklist

Before deploying to production, review the [Production Checklist](./PRODUCTION_CHECKLIST.md):

- [ ] Environment variables configured securely
- [ ] Database connection SSL enabled
- [ ] JWT secrets generated securely
- [ ] Rate limiting configured
- [ ] CORS origins restricted
- [ ] Logging and monitoring setup
- [ ] SSL/TLS certificates configured
- [ ] Security headers enabled
- [ ] Error reporting configured

### Docker Deployment

```bash
# Build production image
docker build -t swaraj-api .

# Run with docker-compose
docker-compose up -d

# Scale services
docker-compose up --scale api=3
```

## 🔒 Security

### Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **CORS Configuration** with origin restrictions
- **Security Headers** with Helmet.js
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** through input sanitization

### Security Best Practices

1. **Never commit secrets** to version control
2. **Use HTTPS** in production
3. **Rotate JWT secrets** regularly
4. **Monitor for suspicious activity**
5. **Keep dependencies updated**
6. **Use strong database passwords**
7. **Enable database SSL connections**

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure all tests pass and follow the existing code style.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and API docs
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Security**: Report security issues privately to the maintainers

---

**Built with ❤️ using Node.js, Express.js, PostgreSQL, and Google Gemini AI**
