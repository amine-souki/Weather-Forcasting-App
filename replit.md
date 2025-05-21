# Weather Forecast App

This application allows users to search for real-time weather data for cities around the world, with a beautiful UI that changes based on current weather conditions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

This project follows a full-stack architecture using React on the frontend and Express.js on the backend:

1. **Frontend**: React application with TypeScript and TailwindCSS for styling, using shadcn/ui components
2. **Backend**: Express.js server with TypeScript
3. **Database**: PostgreSQL with Drizzle ORM
4. **State Management**: React Query for data fetching and cache management
5. **API Integration**: Weather API integration via an external service

The application is structured as a monorepo with shared types across frontend and backend. The server handles API requests, manages user authentication, and implements caching for weather data to minimize external API calls.

## Key Components

### Frontend Components

1. **App.tsx**: The main application component with the router setup
2. **Home.tsx**: The primary landing page showing weather information
3. **SearchBar**: Component for searching cities
4. **WeatherDisplay**: Component for displaying weather information
5. **UI Components**: Using shadcn/ui library for consistent styling

### Backend Components

1. **server/index.ts**: Main Express server setup
2. **server/routes.ts**: API route definitions
3. **server/weather-api.ts**: External weather API integration
4. **server/redis-cache.ts**: In-memory cache for weather data (simulated Redis)
5. **server/storage.ts**: User data storage abstraction

### Shared Components

1. **shared/schema.ts**: Shared TypeScript types and Zod validation schemas

## Data Flow

1. User enters a city name in the search bar
2. Frontend sends a request to the backend API
3. Backend first checks the cache for existing weather data
4. If not in cache, the backend retrieves data from the external weather API
5. Results are cached to reduce API calls
6. Data is returned to the frontend
7. UI updates to display weather information with appropriate styling

## External Dependencies

1. **Weather API**: The app uses an external weather API (WeatherAPI.com) for real-time weather data
2. **PostgreSQL**: Database for user storage (via Drizzle ORM)
3. **Shadcn/UI**: Component library for UI elements
4. **TailwindCSS**: For styling

## Deployment Strategy

The application is set up for deployment on Replit:

1. **Development Mode**: `npm run dev` - Runs the application with Vite's dev server for the frontend and Express for the backend
2. **Production Build**: `npm run build` - Builds the frontend with Vite and compiles the server with esbuild
3. **Production Start**: `npm run start` - Runs the compiled server which serves the static frontend files

The application uses environment variables for configuration, particularly `DATABASE_URL` for the database connection and `WEATHER_API_KEY` for external API access.

## Database Schema

The application uses Drizzle ORM with the following schema:

```typescript
// Users table for basic authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
```

## Caching Strategy

The application implements an in-memory cache that mimics Redis functionality:

1. Weather data is cached using city/location as the key
2. Default TTL of 5 minutes to ensure fresh data
3. Cache is checked before making external API requests

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `WEATHER_API_KEY`: API key for WeatherAPI.com
- `NODE_ENV`: Environment setting (development/production)

## Future Enhancements

Potential enhancements that could be implemented:

1. User authentication with JWT
2. Saved favorite locations
3. Historical weather data visualization
4. Weather alerts and notifications
5. Multi-day forecasts