# Venue Finder CRM

A comprehensive venue finding agency CRM and booking management system designed to help venue finding consultants manage clients, venues, create proposals, handle bookings, and track commissions.

## 🚀 Features

- **Client Management**: Centralized client database with contact information and communication history
- **Venue Database**: Comprehensive venue management with location, contact details, and commission rates
- **Proposal Builder**: Create detailed proposals with multiple venue options and charge lines
- **Booking Workflow**: Manage the complete booking process from proposal to completion
- **Commission Tracking**: Generate and track commission claims with payment status
- **Dashboard & Reporting**: Real-time metrics and pipeline analysis
- **Document Generation**: Automated PDF generation for proposals, confirmations, and invoices
- **Authentication**: Secure Google/Microsoft SSO integration
- **Role-based Access**: Admin and Consultant user roles with appropriate permissions

## 🛠 Technology Stack

### Frontend

- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **React Query** for state management and API caching
- **React Hook Form** with Zod validation
- **Vite** for build tooling

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Passport.js** for authentication (Google/Microsoft OAuth)
- **JWT** for session management
- **PDFKit** for document generation

### Database

- **PostgreSQL 14+**
- **Prisma** for database operations and migrations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd venue-finder-crm
```

### 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

Install client dependencies:

```bash
cd src/client
npm install
cd ../..
```

### 3. Environment Setup

Create environment files:

**.env** (root directory):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/venue_finder_crm"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - Microsoft
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

**.env.test** (for testing):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/venue_finder_crm_test"
NODE_ENV=test
JWT_SECRET=test-jwt-secret
```

### 4. Database Setup

#### Install PostgreSQL

On macOS using Homebrew:

```bash
brew install postgresql@14
brew services start postgresql@14
```

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Databases

Create the main database and test database:

```bash
# On macOS (after installing via Homebrew)
export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
createdb venue_finder_crm
createdb venue_finder_crm_test

# On Linux (using default postgres user)
sudo -u postgres createdb venue_finder_crm
sudo -u postgres createdb venue_finder_crm_test
```

#### Configure Database Connection

Update your `.env` file with the correct database URL:

```env
# For macOS with Homebrew PostgreSQL
DATABASE_URL="postgresql://yourusername@localhost:5432/venue_finder_crm"

# For Linux with default PostgreSQL setup
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/venue_finder_crm"
```

#### Initialize Database Schema

Generate Prisma client:

```bash
npm run db:generate
```

Run database migrations:

```bash
npm run db:migrate
```

Seed the database with sample data:

```bash
npm run db:seed
```

#### Setup Test Database

For running tests, set up the test database:

```bash
npm run db:test-setup
```

#### Verify Database Setup

Run the database verification script:

```bash
npm run db:verify
```

This will check:

- Database connection
- Schema integrity (all 7 tables)
- Sample data presence

### 5. Start Development Servers

Start both frontend and backend in development mode:

```bash
npm run dev
```

Or start them separately:

Backend only:

```bash
npm run dev:server
```

Frontend only:

```bash
npm run dev:client
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📁 Project Structure

```
venue-finder-crm/
├── src/
│   ├── client/                 # React frontend application
│   │   ├── src/
│   │   │   ├── components/     # Reusable React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API service functions
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   ├── utils/          # Utility functions
│   │   │   └── test/           # Test utilities and setup
│   │   ├── package.json        # Client dependencies
│   │   └── vite.config.ts      # Vite configuration
│   ├── server/                 # Node.js backend application
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic services
│   │   ├── utils/              # Server utility functions
│   │   ├── test/               # Server test files
│   │   └── index.ts            # Server entry point
│   └── shared/                 # Shared types and utilities
│       └── types/              # Shared TypeScript types
├── prisma/
│   ├── schema.prisma           # Prisma database schema
│   └── seed.ts                 # Database seed script
├── dist/                       # Built application files
├── coverage/                   # Test coverage reports
├── .env                        # Environment variables
├── .env.test                   # Test environment variables
├── package.json                # Root dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
├── .eslintrc.js                # ESLint configuration
├── .prettierrc                 # Prettier configuration
└── README.md                   # This file
```

## 🧪 Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run client tests:

```bash
cd src/client
npm run test
```

Run client tests in watch mode:

```bash
cd src/client
npm run test:watch
```

## 🏗 Building for Production

Build the entire application:

```bash
npm run build
```

Build server only:

```bash
npm run build:server
```

Build client only:

```bash
npm run build:client
```

Start production server:

```bash
npm start
```

## 🔧 Development Tools

### Code Quality

Format code with Prettier:

```bash
npm run format
```

Check code formatting:

```bash
npm run format:check
```

Lint code with ESLint:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

### Database Operations

Create a new migration:

```bash
npx prisma migrate dev --name migration-name
```

Reset database:

```bash
npx prisma migrate reset
```

View database in Prisma Studio:

```bash
npx prisma studio
```

## 🔐 Authentication Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` file

### Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration
4. Add redirect URIs:
   - `http://localhost:5000/auth/microsoft/callback` (development)
   - `https://yourdomain.com/auth/microsoft/callback` (production)
5. Generate a client secret
6. Copy Application ID and Client Secret to your `.env` file

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. The database schema includes the following main entities:

### Core Tables

#### Users

- **Purpose**: System authentication and user management
- **Key Fields**: email, name, role (admin/consultant), OAuth provider info
- **Relations**: One-to-many with all other entities as creator

#### Clients

- **Purpose**: Customer information and contact management
- **Key Fields**: name, company, contact details, notes
- **Relations**: One-to-many with proposals and bookings
- **Constraints**: Cannot be deleted if active proposals/bookings exist

#### Venues

- **Purpose**: Venue database with commission and contact information
- **Key Fields**: name, location, contact details, standard commission rate
- **Relations**: Many-to-many with proposals, one-to-many with bookings
- **Constraints**: Cannot be deleted if active proposals/bookings exist

#### Proposals

- **Purpose**: Client proposals with multiple venue options
- **Key Fields**: client reference, status, total value, expected commission
- **Relations**: Belongs to client, many-to-many with venues via proposal_venues
- **Status Values**: draft, sent

#### Proposal Venues (Junction Table)

- **Purpose**: Links proposals to venues with specific charge lines
- **Key Fields**: charge lines (JSON), commission override, notes
- **Relations**: Links proposals and venues
- **Data**: Stores itemized charges (room hire, F&B, AV, etc.)

#### Bookings

- **Purpose**: Booking workflow management from proposal to completion
- **Key Fields**: status, option expiry, total value, commission amount, signed documents
- **Relations**: References proposal, client, venue, and user
- **Status Values**: draft, proposal_sent, option, confirmed, completed

#### Commission Claims

- **Purpose**: Commission tracking and payment management
- **Key Fields**: amount, status, sent/paid dates, invoice number
- **Relations**: Belongs to booking and user
- **Status Values**: draft, sent, paid, overdue

### Database Features

- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Soft Delete Protection**: Prevents deletion of records with dependencies
- **Audit Trail**: Created/updated timestamps on all records
- **JSON Storage**: Flexible charge lines and document storage
- **Decimal Precision**: Accurate financial calculations with proper decimal types

### Schema Location

The complete schema definition is located at:

- **Schema**: `prisma/schema.prisma`
- **Seed Data**: `prisma/seed.ts`

### Database Utilities

The application includes several database utilities:

- **Connection Management**: `src/server/lib/database.ts`
- **Pagination Helpers**: `src/server/lib/db-utils.ts`
- **Error Handling**: Prisma error conversion to user-friendly messages
- **Transaction Support**: Wrapper functions for complex operations
- **Health Checks**: Database connectivity testing

### Migration Commands

```bash
# Generate Prisma client
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Verify database setup and health
npm run db:verify

# Setup test database schema
npm run db:test-setup

# Reset database (development only)
npx prisma migrate reset

# View data in Prisma Studio
npx prisma studio

# Create a new migration manually
npx prisma migrate dev --name migration-name

# Deploy migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## 🚀 Deployment

### Environment Variables for Production

Ensure all environment variables are properly set for production:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret
CLIENT_URL=https://your-production-domain.com
```

### Production Checklist

- [ ] Set up production PostgreSQL database
- [ ] Configure OAuth applications for production domain
- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Build the application
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and formatting checks
- Update documentation as needed

## 📝 API Documentation

### Core API Infrastructure

The Venue Finder CRM API is built with Express.js and TypeScript, featuring comprehensive middleware for security, validation, error handling, and logging.

#### API Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

#### Health Check

- `GET /health` - Returns server status and timestamp

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Response Format

All API responses follow a consistent structure:

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "meta": {
    /* pagination/metadata (optional) */
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "field": "fieldName", // for validation errors
    "details": {
      /* additional error details */
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

#### Security Features

- **CORS**: Configured for allowed origins with credentials support
- **Helmet**: Security headers including CSP, XSS protection, and frame options
- **Rate Limiting**:
  - General API: 100 requests per 15 minutes
  - Authentication: 10 requests per 15 minutes
  - File uploads: 20 requests per hour
- **Request Size Limits**: 10MB maximum payload size
- **Security Headers**: Custom headers for API versioning and request tracking

#### Error Handling

The API provides comprehensive error handling with specific error codes:

- `BAD_REQUEST` (400) - Invalid request data or malformed JSON
- `UNAUTHORIZED` (401) - Authentication required or invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict (e.g., duplicate entries)
- `UNPROCESSABLE_ENTITY` (422) - Validation errors
- `PAYLOAD_TOO_LARGE` (413) - Request body exceeds size limit
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

#### Request Validation

All API endpoints use Joi schema validation for:

- **Request Body**: JSON payload validation
- **Query Parameters**: Search, pagination, and filter validation
- **Route Parameters**: ID and path parameter validation

Common validation schemas:

- ID validation: Positive integers
- Pagination: Page (min 1), limit (1-100), search strings
- Sorting: Field names and order (asc/desc)

#### Logging

The API uses Winston for structured logging:

- **HTTP Requests**: Method, URL, status, duration, IP, user agent
- **Errors**: Stack traces, request context, user information
- **Security Events**: Rate limiting, CORS violations, authentication failures
- **Log Levels**: error, warn, info, http, debug

**Development**: Console output with colors
**Production**: File-based logging with rotation (error.log, combined.log)

#### Authentication Endpoints

- `POST /auth/google` - Google OAuth callback
- `POST /auth/microsoft` - Microsoft OAuth callback
- `POST /auth/logout` - User logout
- `GET /auth/me` - Current user profile

#### Core API Endpoints

- `GET /api/clients` - List clients with pagination/search
- `POST /api/clients` - Create new client
- `GET /api/venues` - List venues with pagination/search
- `POST /api/venues` - Create new venue
- `GET /api/proposals` - List proposals with filters
- `POST /api/proposals` - Create new proposal
- `GET /api/bookings` - List bookings with filters
- `POST /api/bookings` - Create booking from proposal

#### Pagination

List endpoints support pagination with the following query parameters:

- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `search` - Search term for filtering
- `sortBy` - Field to sort by
- `sortOrder` (default: desc) - Sort direction (asc/desc)

**Response Headers:**

- `X-Total-Count` - Total number of items
- `X-Page-Count` - Total number of pages

#### API Testing

The API includes comprehensive test coverage:

- **Unit Tests**: Business logic and utilities
- **Integration Tests**: API endpoints with test database
- **Security Tests**: Rate limiting, CORS, validation
- **Error Handling Tests**: All error scenarios

Run API tests:

```bash
npm test -- --testPathPattern=server
```

#### Development Tools

**API Testing with curl:**

```bash
# Health check
curl http://localhost:5000/health

# Test rate limiting
for i in {1..15}; do curl http://localhost:5000/api; done

# Test validation
curl -X POST http://localhost:5000/api/test \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

**Using with Postman:**

1. Import the API collection (if available)
2. Set base URL to `http://localhost:5000`
3. Configure authentication headers
4. Test endpoints with various payloads

See the design document for complete API specification and data models.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues:**

- Ensure PostgreSQL is running:
  - macOS: `brew services list | grep postgresql`
  - Linux: `sudo systemctl status postgresql`
- Check DATABASE_URL in .env file matches your PostgreSQL setup
- Verify database exists: `psql -l` (list all databases)
- Test connection: `npm run db:verify`
- For permission issues, ensure your user has database creation privileges
- If using default PostgreSQL setup, you may need to create a password for the postgres user

**OAuth Authentication Issues:**

- Verify OAuth client IDs and secrets
- Check redirect URIs match exactly
- Ensure OAuth applications are properly configured

**Build Issues:**

- Clear node_modules and reinstall dependencies
- Check Node.js and npm versions
- Verify TypeScript configuration

**Port Already in Use:**

- Change PORT in .env file
- Kill existing processes: `lsof -ti:5000 | xargs kill -9`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Happy coding! 🎉**
