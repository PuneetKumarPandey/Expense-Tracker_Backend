# Expense Tracker Backend

MERN stack backend for expense tracking application with JWT authentication, MongoDB aggregation, and protected API endpoints.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

3. **Run the Server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Expenses
- `POST /api/expenses` - Create expense (protected)
- `GET /api/expenses` - Get user expenses with filtering (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)
- `GET /api/expenses/summary` - Get spending summary with MongoDB aggregation (protected)

## Features

✅ JWT Authentication with bcrypt password hashing  
✅ Protected routes with middleware  
✅ MongoDB aggregation pipeline for expense summaries  
✅ Input validation with express-validator  
✅ CORS configuration for frontend integration  
✅ Error handling middleware  
✅ Expense filtering by category and date range  
✅ User authorization (users can only access their own data)

## Database Models

- **User**: name, email, password (hashed)
- **Expense**: description, amount, category, date, user reference

## Categories Supported
Food, Transport, Entertainment, Healthcare, Shopping, Bills, Others