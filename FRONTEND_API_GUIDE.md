# 🚀 Frontend Developer API Integration Guide

## 📋 Overview

This guide provides comprehensive information for frontend developers to integrate with the Swaraj backend API. The API follows REST principles and uses JWT authentication.

**Base URL:** `http://localhost:3000/api` (development) | `https://your-domain.com/api` (production)

## 📖 Interactive API Documentation

### Swagger UI

We provide interactive API documentation through Swagger UI where you can:

- **Explore all endpoints** with detailed request/response schemas
- **Test API calls directly** from the browser
- **View real-time examples** and try different parameters
- **Understand authentication** requirements for each endpoint

**🔗 Access Swagger Documentation:**

- **Development:** `http://localhost:3000/api/docs`
- **Production:** `https://your-domain.com/api/docs`
- **JSON Spec:** `http://localhost:3000/api/docs.json`

### Key Swagger Features:

- ✅ **Try it out** - Execute API calls directly from the documentation
- ✅ **Authentication** - Built-in JWT token testing
- ✅ **Schema validation** - See exact request/response formats
- ✅ **Error examples** - Understanding error responses
- ✅ **Code generation** - Generate client code in multiple languages

> 💡 **Pro Tip:** Use Swagger UI to test authentication flow and understand response structures before implementing in your frontend code.

---

## 🔐 Authentication System

### JWT Token Management

- **Token Storage:** Store JWT token in localStorage or secure httpOnly cookies
- **Token Header:** Include in requests as `Authorization: Bearer <token>`
- **Token Expiry:** Tokens expire in 24 hours, implement refresh logic
- **Token Format:** JWT with user data: `{id, email, name, isVerified, subscription}`

### Authentication Flow

```javascript
// Example: Login and store token
const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
    return data.user;
  }
  throw new Error(data.message);
};

// Example: Authenticated request
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};
```

---

## 📚 API Endpoints

### 👤 Authentication Endpoints

#### 1. **User Registration**

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "Registration successful. Please check your email for verification.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "isVerified": false
  },
  "verificationLink": "http://localhost:3000/verify-email/token123"
}
```

#### 2. **User Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "isVerified": true,
    "subscription": {
      "plan": "premium",
      "status": "active"
    }
  }
}
```

#### 3. **Logout**

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Logout successful"
}
```

#### 4. **Google OAuth Login**

```http
GET /api/auth/google
```

- Redirects to Google OAuth consent screen
- After consent, redirects to `/api/auth/google/callback`
- Frontend should handle the callback and extract tokens

#### 5. **Forgot Password**

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "message": "Password reset email sent"
}
```

#### 6. **Reset Password**

```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

#### 7. **Verify Email**

```http
GET /api/auth/verify-email/:token
```

#### 8. **Resend Verification Email**

```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

### 💳 Subscription Endpoints

#### 1. **Get Subscription Plans**

```http
GET /api/subscriptions/plans
```

**Response (200):**

```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free Plan",
      "price": 0,
      "features": ["10 AI queries/month", "Basic support"],
      "queryLimit": 10
    },
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": 29.99,
      "features": [
        "1000 AI queries/month",
        "Priority support",
        "Advanced analytics"
      ],
      "queryLimit": 1000
    }
  ]
}
```

#### 2. **Get Current Subscription** 🔒

```http
GET /api/subscriptions/my-subscription
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "subscription": {
    "id": 1,
    "plan": "premium",
    "status": "active",
    "startDate": "2024-01-15T10:30:00Z",
    "endDate": "2024-02-15T10:30:00Z",
    "autoRenew": true
  }
}
```

#### 3. **Subscribe to Plan** 🔒

```http
POST /api/subscriptions/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "premium",
  "paymentMethod": "stripe_token_123"
}
```

#### 4. **Cancel Subscription** 🔒

```http
PUT /api/subscriptions/cancel
Authorization: Bearer <token>
```

#### 5. **Upgrade Subscription** 🔒

```http
PUT /api/subscriptions/upgrade
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "enterprise"
}
```

#### 6. **Get Usage Statistics** 🔒

```http
GET /api/subscriptions/usage
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "usage": {
    "queriesUsed": 45,
    "queriesLimit": 1000,
    "resetDate": "2024-02-15T10:30:00Z"
  }
}
```

#### 7. **Get Remaining Quota** 🔒

```http
GET /api/subscriptions/quota
Authorization: Bearer <token>
```

---

### 🤖 AI Query Endpoints

#### 1. **Submit AI Query** 🔒

```http
POST /api/ai/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "Explain quantum computing in simple terms",
  "context": "educational",
  "maxTokens": 500
}
```

**Response (200):**

```json
{
  "response": "Quantum computing is a revolutionary technology that...",
  "usage": {
    "promptTokens": 15,
    "completionTokens": 342,
    "totalTokens": 357
  },
  "queryId": "query_123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. **Get Query Logs** 🔒

```http
GET /api/ai/logs?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "logs": [
    {
      "id": "query_123",
      "query": "Explain quantum computing...",
      "response": "Quantum computing is...",
      "timestamp": "2024-01-15T10:30:00Z",
      "tokensUsed": 357,
      "success": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8
  }
}
```

#### 3. **Get Query Analytics** 🔒

```http
GET /api/ai/analysis
Authorization: Bearer <token>
```

#### 4. **Get Incidents/Errors** 🔒

```http
GET /api/ai/incidents
Authorization: Bearer <token>
```

---

## 🚨 Error Handling

### HTTP Status Codes

- **200** - Success
- **201** - Created successfully
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **429** - Rate Limited
- **500** - Internal Server Error

### Error Response Format

```json
{
  "error": true,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Rate Limiting

- **Authentication endpoints:** 5 requests per minute
- **AI query endpoint:** Based on subscription plan
- **General API:** 100 requests per minute per IP
- **Rate limit headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 🛠️ Frontend Integration Examples

### React Integration

```jsx
// hooks/useAuth.js
import { useState, useContext, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### API Client Setup

```javascript
// utils/apiClient.js
class ApiClient {
  constructor(baseURL = "/api") {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // AI methods
  submitQuery(query) {
    return this.request("/ai/query", {
      method: "POST",
      body: JSON.stringify(query),
    });
  }

  // Subscription methods
  getPlans() {
    return this.request("/subscriptions/plans");
  }

  getMySubscription() {
    return this.request("/subscriptions/my-subscription");
  }
}

export default new ApiClient();
```

---

## 🔧 Environment Configuration

### Required Environment Variables (Frontend)

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend Environment Variables

- `JWT_SECRET` - Secret for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `FRONTEND_URL` - Frontend URL for email links
- `GEMINI_API_KEY` - AI API key

---

## 📱 Mobile/PWA Considerations

- **Token Storage:** Use secure storage (Keychain/Android Keystore)
- **Deep Links:** Handle OAuth callbacks and email verification links
- **Offline Support:** Cache user data and sync when online
- **Push Notifications:** For subscription updates and AI query results

---

## 🧪 Testing

### Swagger UI Testing

1. **Open Swagger UI:** Navigate to `http://localhost:3000/api/docs`
2. **Authenticate:** Click "Authorize" and enter your JWT token
3. **Test endpoints:** Use "Try it out" on any endpoint
4. **View responses:** See real API responses with proper formatting

### API Testing Script

Use the included `api-tester.js` script:

```bash
node api-tester.js
```

### Test User Credentials

```
Email: testuser@example.com
Password: password123
```

### Testing Workflow Example

```javascript
// 1. First, test registration via Swagger UI or:
const testRegistration = async () => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    }),
  });
  const data = await response.json();
  console.log("Registration:", data);
  return data.token; // Use this token for authenticated requests
};

// 2. Test authenticated endpoints
const testAuthenticatedEndpoint = async (token) => {
  const response = await fetch("/api/subscriptions/my-subscription", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log("Subscription:", data);
};
```

---

## 🔍 Common Integration Patterns

### 1. **Authentication Guard**

```jsx
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};
```

### 2. **API Error Handling**

```javascript
const handleApiError = (error) => {
  if (error.status === 401) {
    // Redirect to login
    logout();
  } else if (error.status === 429) {
    // Show rate limit message
    showToast("Too many requests. Please try again later.");
  }
};
```

### 3. **Loading States**

```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiClient.submitQuery(query);
  } finally {
    setLoading(false);
  }
};
```

---

## 📞 Support & Resources

### 📖 Documentation Resources

- **📄 This Guide** - Comprehensive frontend integration guide
- **🔍 Swagger UI** - Interactive API documentation at `/api/docs`
- **📋 API Endpoints** - Quick reference in `API_ENDPOINTS.md`
- **✅ Production Checklist** - Deployment guide in `PRODUCTION_CHECKLIST.md`
- **📘 Main README** - General project setup in `README.md`

### 🛠️ Development Tools

- **Swagger UI** - Test APIs interactively
- **API Tester Script** - `node api-tester.js`
- **Postman Collection** - Import from `http://localhost:3000/api/docs.json`

### 💬 Getting Help

- **Documentation Issues:** Create an issue in the repository
- **API Questions:** Contact the backend team
- **Environment Setup:** Check the main README.md file
- **Swagger Issues:** Verify endpoint at `/api/docs`

### 🔧 Quick Setup Checklist

- [ ] Backend server running on `http://localhost:3000`
- [ ] Environment variables configured
- [ ] Swagger UI accessible at `/api/docs`
- [ ] Test user account created
- [ ] JWT token obtained for testing
- [ ] Frontend CORS configured correctly

---

**🔗 Related Files:**

- `API_ENDPOINTS.md` - Simple endpoint list
- `PRODUCTION_CHECKLIST.md` - Deployment requirements
- `README.md` - General project setup
- `/api/docs` - Interactive Swagger documentation
