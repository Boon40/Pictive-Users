# User API

## Running the API locally

### Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)
- PostgreSQL (v15 or later)

### Installation
1. Clone the repository
2. Navigate to the user-api directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Running database with Docker

To run only the PostgreSQL database in a Docker container:

```bash
docker run -d \
  --name pictive-users-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pictive_users \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

## Running API and database with Docker

1. Make sure you have Docker and Docker Compose installed
2. Navigate to the user-api directory
3. Start the services:
   ```bash
   docker-compose up -d
   ```
   This command starts both the API and database services in detached mode (runs in the background)
4. To stop the services:
   ```bash
   docker-compose down
   ```
   This command stops and removes the containers, networks, and volumes

The API will be available at http://localhost:3002