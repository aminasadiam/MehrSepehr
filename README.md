# Kasra - E-Commerce Platform

A full-stack e-commerce application built with Go (backend) and SolidJS (frontend).

## Features

- User authentication (JWT-based)
- Product management
- Category management
- Order management with wallet integration
- Role-based access control
- RESTful API

## Tech Stack

### Backend
- Go 1.22
- GORM (ORM)
- PostgreSQL
- JWT for authentication

### Frontend
- SolidJS
- TypeScript
- Vite
- TailwindCSS

## Setup

### Prerequisites
- Go 1.22 or later
- PostgreSQL
- Node.js 18+ and npm/pnpm

### Backend Setup

1. Install Go dependencies:
```bash
go get github.com/golang-jwt/jwt/v5
go mod tidy
```

2. Create a `.env` file in the root directory:
```env
PORT=:8080
DSN=host=localhost user=postgres password=postgres dbname=kasra port=5432 sslmode=disable
JWT_SECRET=your-secret-key-change-this-in-production
```

3. Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE kasra;
```

4. Run the backend:
```bash
make run
# or
go run cmd/main.go
```

The backend will automatically run migrations on startup.

### Frontend Setup

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (protected)
- `PUT /api/products/{id}` - Update product (protected)
- `DELETE /api/products/{id}` - Delete product (protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/categories/slug/{slug}` - Get category by slug
- `POST /api/categories` - Create category (protected)
- `PUT /api/categories/{id}` - Update category (protected)
- `DELETE /api/categories/{id}` - Delete category (protected)

### Orders
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/{id}` - Get order by ID (protected)
- `POST /api/orders` - Create order (protected)
- `PUT /api/orders/{id}` - Update order (protected)
- `DELETE /api/orders/{id}` - Delete order (protected)

### Wallet
- `GET /api/wallet` - Get user's wallet (protected)
- `POST /api/wallet/add` - Add balance to wallet (protected)
- `GET /api/wallet/{id}` - Get wallet by ID (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/{id}` - Get user by ID (protected)
- `PUT /api/users/{id}` - Update user (protected)
- `DELETE /api/users/{id}` - Delete user (protected)

## Project Structure

```
.
├── cmd/              # Application entry point
├── config/           # Configuration management
├── database/         # Database connection and migrations
├── handler/          # HTTP handlers
├── middleware/       # HTTP middleware (CORS, auth, error handling)
├── models/           # Data models
├── repository/       # Data access layer
├── router/           # Route definitions
├── utils/            # Utility functions
└── web/              # Frontend application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   └── utils/
    └── ...
```

## Development

### Running Tests
```bash
make test
# or
go test ./...
```

### Building
```bash
make build
# or
go build -o ./bin/app ./cmd/main.go
```

## License

MIT

