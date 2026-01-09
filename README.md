# SaByeJai - Stress Management Web Application

A full-stack stress management web application with three core features: Mental Box (store worries), Worry Window (schedule worry time), and Grounding Techniques (breathing exercises).

## Tech Stack

### Backend
- **Language**: Rust
- **Framework**: Axum 0.7
- **Database**: PostgreSQL with SQLx
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: SeraUI (shadcn/ui based)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: React Context API + @tanstack/react-query
- **Routing**: React Router v6
- **i18n**: react-i18next (Thai + English)
- **Forms**: react-hook-form + zod

## Project Structure

```
sabyejai/
├── backend/                     # Rust backend
│   ├── src/
│   │   ├── config/             # Configuration management
│   │   ├── database/           # Database connection
│   │   ├── handlers/           # Request handlers
│   │   ├── middleware/         # Auth middleware
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic
│   │   ├── utils/              # JWT, password utilities
│   │   └── main.rs             # Server entry point
│   ├── migrations/             # Database migrations
│   ├── Cargo.toml              # Rust dependencies
│   └── .env                    # Environment variables
│
└── frontend/                    # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── ui/             # SeraUI components
    │   │   ├── layout/         # Layout components
    │   │   ├── auth/           # Auth components
    │   │   ├── mental-box/     # Mental Box components
    │   │   ├── worry-window/   # Worry Window components
    │   │   └── grounding/      # Breathing exercise
    │   ├── pages/              # Page components
    │   ├── context/            # React contexts
    │   ├── hooks/              # Custom hooks
    │   ├── services/           # API services
    │   ├── types/              # TypeScript types
    │   └── lib/                # Utilities
    ├── public/locales/         # i18n translations
    ├── components.json         # SeraUI config
    └── .env                    # Frontend env vars
```

## 🐳 Docker Deployment (Recommended)

The easiest way to run the entire application is using Docker Compose:

### Quick Start with Docker

```bash
# Build and start all services (database, backend, frontend)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

### Using Helper Scripts

**Windows (Batch Script):**
```cmd
docker.bat up      # Start all services
docker.bat logs    # View logs
docker.bat down    # Stop all services
```

**Linux/Mac (Makefile):**
```bash
make up           # Start all services
make logs         # View logs
make down         # Stop all services
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md)

### What Docker Compose Does

✅ Sets up PostgreSQL database automatically
✅ Builds and runs the Rust backend
✅ Builds and runs the React frontend
✅ Runs database migrations automatically
✅ Configures networking between services
✅ Handles service dependencies
✅ Uses `env_file` to load environment variables from `.env` files

No need to install PostgreSQL, Rust, or Node.js locally!

---

## Features

### 1. Mental Box (กล่องเก็บปัญหา)
- Write and store worries/problems
- View all stored entries
- Edit and delete entries
- Full CRUD with backend persistence
- **AI-Powered Stress Reframing**: Get cognitive reframes using Google Gemini 2.5 Flash
  - Stoic perspective: Focus on what you can control
  - Optimist perspective: Find the silver lining
  - Realist perspective: Balanced, practical view
  - Results are cached to reduce API token usage
  - Responds in the same language as your input (Thai/English)

### 2. Worry Window (ช่วงเวลาเครียด)
- Schedule specific time slots for thinking about problems
- Calendar view of scheduled worry windows
- Set start and end times
- Mark windows as completed
- View today's active worry windows

### 3. Grounding Techniques (เทคนิคดึงสติ)
- Interactive 4-7-8 breathing exercise
- Visual animated circle guide
- Phase indicators (Breathe In, Hold, Breathe Out)
- Timer countdown
- Start/pause/reset controls

### 4. Authentication
- User registration and login
- JWT-based authentication
- Protected routes
- User session management

### 5. Internationalization
- Thai and English language support
- Language switcher
- All UI text translated

### 6. Dark Mode
- Light and dark theme support
- Theme toggle
- All components support both themes
- Persistent theme preference

## Prerequisites

Before running the application, make sure you have installed:

- **Node.js** (v20.x or higher)
- **npm** (v10.x or higher)
- **Rust** (latest stable via rustup)
- **PostgreSQL** (v14 or higher)
- **cargo-sqlx** (for database migrations): `cargo install sqlx-cli`

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sabyejai;

# Exit psql
\q
```

### 2. Backend Setup

```bash
cd backend

# Copy and configure environment variables
# Edit .env file and update DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
sqlx database create
sqlx migrate run

# Build and run the backend
cargo build
cargo run

# The server will start on http://localhost:8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/sabyejai
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=900              # 15 minutes
REFRESH_TOKEN_EXPIRATION=604800 # 7 days
RUST_LOG=info
SERVER_HOST=127.0.0.1           # Use 0.0.0.0 for Docker
SERVER_PORT=8000
CORS_ORIGIN=http://localhost:5173
OPENROUTER_API_KEY=your-openrouter-api-key  # Required for AI reframing
```

**Important**: Change `JWT_SECRET` and `DATABASE_URL` password in production!

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT)
- `GET /api/auth/me` - Get current user info

### Mental Box (Protected)
- `POST /api/mental-box` - Create entry
- `GET /api/mental-box` - List all user's entries
- `GET /api/mental-box/:id` - Get specific entry
- `PUT /api/mental-box/:id` - Update entry
- `DELETE /api/mental-box/:id` - Delete entry

### Worry Window (Protected)
- `POST /api/worry-window` - Create schedule
- `GET /api/worry-window` - List all user's schedules
- `GET /api/worry-window/:id` - Get specific schedule
- `PUT /api/worry-window/:id` - Update schedule
- `DELETE /api/worry-window/:id` - Delete schedule
- `GET /api/worry-window/today` - Get today's schedules

### Stress Reframe (Protected)
- `POST /api/stress-reframe` - Create AI-powered reframe (returns cached result if exists)
- `GET /api/stress-reframe` - List all user's reframes

### Health
- `GET /health` - Health check

## Development Commands

### Backend

```bash
cd backend
cargo run                       # Start development server
cargo build --release           # Build for production
cargo test                      # Run tests
sqlx migrate run                # Run migrations
sqlx migrate revert             # Revert last migration
```

### Frontend

```bash
cd frontend
npm run dev                     # Start development server
npm run build                   # Build for production
npm run preview                 # Preview production build
npm run lint                    # Lint code
```

## Database Schema

### users
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- username (VARCHAR)
- preferred_language (VARCHAR) - 'en' or 'th'
- preferred_theme (VARCHAR) - 'light' or 'dark'
- created_at, updated_at (TIMESTAMPTZ)

### mental_box_entries
- id (UUID, PK)
- user_id (UUID, FK → users)
- title (VARCHAR)
- content (TEXT)
- created_at, updated_at (TIMESTAMPTZ)

### worry_windows
- id (UUID, PK)
- user_id (UUID, FK → users)
- title (VARCHAR)
- description (TEXT)
- scheduled_date (DATE)
- start_time (TIME)
- end_time (TIME)
- is_completed (BOOLEAN)
- created_at, updated_at (TIMESTAMPTZ)

## Current Progress

✅ Backend foundation setup
✅ Frontend foundation setup
✅ Database migrations created
✅ Directory structure created
✅ Tailwind CSS configured
✅ Path aliases configured
✅ Environment variables setup
✅ Docker Compose configuration
✅ i18n configuration and translation files (English + Thai)
✅ ThemeContext for dark mode
✅ AuthContext and authentication services
✅ SeraUI components (Button, Card, Input, Form, Dialog)
✅ Header and Layout components
✅ Authentication pages (Login, Register)
✅ Mental Box feature (full CRUD functionality)
✅ Worry Window feature (scheduling and completion)
✅ Breathing Exercise component (4-7-8 technique)
✅ Dashboard page
✅ Routing with protected routes

## Development Status

All core features have been implemented! The application is ready for development testing.

To test the application:
1. Start services with Docker Compose: `docker-compose up --build`
2. Access the frontend at http://localhost:3000
3. Register a new account or login
4. Test all three features:
   - Mental Box: Store and manage your worries
   - Worry Window: Schedule worry time slots
   - Grounding: Practice 4-7-8 breathing exercises

## Contributing

This is a portfolio project for KMUTT 4th year.

## License

MIT
