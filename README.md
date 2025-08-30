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

Create the database:
```bash
createdb venue_finder_crm
createdb venue_finder_crm_test  # for testing
```

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
├── database/
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

The application uses PostgreSQL with the following main entities:

- **Users**: System users with role-based access
- **Clients**: Customer information and contact details
- **Venues**: Venue database with commission rates
- **Proposals**: Client proposals with multiple venue options
- **Bookings**: Booking workflow management
- **Commission Claims**: Commission tracking and payment status

See `database/schema.prisma` for the complete schema definition.

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

### Authentication Endpoints

- `POST /auth/google` - Google OAuth callback
- `POST /auth/microsoft` - Microsoft OAuth callback
- `POST /auth/logout` - User logout
- `GET /auth/me` - Current user profile

### Core API Endpoints

- `GET /api/clients` - List clients with pagination/search
- `POST /api/clients` - Create new client
- `GET /api/venues` - List venues with pagination/search
- `POST /api/venues` - Create new venue
- `GET /api/proposals` - List proposals with filters
- `POST /api/proposals` - Create new proposal
- `GET /api/bookings` - List bookings with filters
- `POST /api/bookings` - Create booking from proposal

See the design document for complete API specification.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists and user has permissions

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