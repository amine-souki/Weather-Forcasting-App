# Running the Weather App with Docker

This guide shows you how to run the Weather Forecast App using Docker, which will set up all required services (app, PostgreSQL, Redis) automatically.

## Prerequisites

- Docker and Docker Compose installed on your system
- Your RapidAPI Weather API key

## Getting Started

1. First, create a `.env` file with your environment variables:

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your values, especially your API key
nano .env
```

2. Build and start the Docker containers:

```bash
# Build the images
docker-compose build

# Start the services in the background
docker-compose up -d
```

3. Check if the containers are running:

```bash
docker-compose ps
```

4. Push database schema to PostgreSQL (first time only):

```bash
docker-compose exec app npm run db:push
```

5. Access the application:
   - The app will be available at: http://localhost:5000

## Stopping the Application

```bash
# Stop the containers
docker-compose down

# To remove volumes (database data) as well
docker-compose down -v
```

## Viewing Logs

```bash
# View logs from all containers
docker-compose logs

# View logs from a specific container
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f app
```

## Scaling the Application (Optional)

For production environments, you might want to scale the app:

```bash
# Scale to 3 instances of the app
docker-compose up -d --scale app=3
```

Note: You would need additional load balancing setup for this to work properly.