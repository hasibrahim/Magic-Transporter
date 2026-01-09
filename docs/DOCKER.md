# Docker Guide

Comprehensive guide to using Docker with the Magic Transporters API.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Docker Images](#docker-images)
- [Docker Compose](#docker-compose)
- [Environment Configuration](#environment-configuration)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project includes complete Docker support with:

- 🐳 **Multi-stage builds** for optimized production images
- 🔧 **Separate dev/prod** configurations
- 📦 **Docker Compose** for full stack orchestration
- 🔒 **Security** best practices (non-root user, minimal image)
- 🚀 **Hot reload** in development mode
- 💾 **MongoDB** with persistent volumes
- 🎛️ **MongoDB Express** for database administration

---

## Quick Start

### Production

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

**Access:**
- API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- MongoDB Express: http://localhost:8081

### Development

```bash
# Start with hot reload
npm run docker:up:dev

# View logs
npm run docker:logs:dev

# Stop services
npm run docker:down:dev
```

---

## Docker Images

### Production Image (`Dockerfile.prod`)

**Features:**
- Multi-stage build (builder → production)
- Node 22 Alpine (minimal size)
- Non-root user for security
- Health checks
- Optimized layer caching

**Build Process:**

```dockerfile
# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn install --production --frozen-lockfile

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Image Size:** ~150MB (vs ~800MB without multi-stage)

### Development Image (`Dockerfile.dev`)

**Features:**
- Hot reload with nodemon
- Debug port exposed (9229)
- Volume mounting for source code
- All devDependencies included

```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN npm install -g nodemon
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
EXPOSE 3000 9229
CMD ["yarn", "dev"]
```

### Building Images

```bash
# Production image
npm run docker:build
# or
docker build -f Dockerfile.prod -t transporters-backend:latest .

# Development image
npm run docker:build:dev
# or
docker build -f Dockerfile.dev -t transporters-backend:dev .
```

---

## Docker Compose

### Production (`docker-compose.yml`)

Services:
1. **MongoDB** - Database
2. **Mongo Express** - DB admin UI
3. **App** - API server

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:7
    container_name: transporters_mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: transporters_backend
    depends_on:
      mongodb:
        condition: service_healthy
    ports:
      - "3000:3000"
```

### Development (`docker-compose.dev.yml`)

Additional features:
- **Volume mounting** for hot reload
- **Debug port** exposed
- **Development** environment variables

```yaml
services:
  app:
    build:
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src          # Hot reload
      - /app/node_modules        # Prevent overwrite
    ports:
      - "3000:3000"
      - "9229:9229"              # Debug port
```

### Commands

```bash
# Start services
docker-compose up -d

# Start with build
docker-compose up --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart app

# View service status
docker-compose ps
```

---

## Environment Configuration

### Environment Variables

Create `.env.docker` (copy from `docker.env.example`):

```env
# Application
NODE_ENV=production
PORT=3000

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
MONGO_DB_NAME=transporters_db
MONGO_PORT=27017

# MongoDB Express
MONGO_EXPRESS_USER=admin
MONGO_EXPRESS_PASSWORD=your_secure_password
MONGO_EXPRESS_PORT=8081

# Application
LOG_FORMAT=combined
ORIGIN=*
CREDENTIALS=true
```

### Using Environment Files

```bash
# Use specific env file
docker-compose --env-file .env.docker up

# Or in docker-compose.yml
services:
  app:
    env_file:
      - .env.docker
```

### Environment Hierarchy

1. Shell environment variables
2. `.env.docker` file
3. `docker-compose.yml` defaults
4. Dockerfile ENV instructions

---

## Development Workflow

### Hot Reload Setup

1. **Start development environment:**
```bash
npm run docker:up:dev
```

2. **Edit source files:**
```bash
# Changes in ./src are automatically detected
vim src/services/magicItem.service.ts
```

3. **View changes:**
- Server automatically restarts
- No need to rebuild image

### Debugging

**VS Code `launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Node",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}"
    }
  ]
}
```

**Steps:**
1. Start dev environment: `npm run docker:up:dev`
2. In VS Code, press F5 to attach debugger
3. Set breakpoints and debug

### Database Access

**MongoDB Shell:**
```bash
# Access MongoDB container
docker exec -it transporters_mongodb mongosh

# Or with auth
docker exec -it transporters_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

**MongoDB Express:**
- URL: http://localhost:8081
- Username: admin
- Password: admin123

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Follow from timestamp
docker-compose logs --since 2024-01-01T00:00:00 app
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Set secure passwords in `.env.docker`
- [ ] Configure proper ORIGIN for CORS
- [ ] Set NODE_ENV=production
- [ ] Review MongoDB credentials
- [ ] Set up backup strategy
- [ ] Configure monitoring/logging
- [ ] Set resource limits

### Deployment Steps

1. **Prepare environment:**
```bash
# Create production env file
cp docker.env.example .env.production
# Edit with production values
vim .env.production
```

2. **Build production image:**
```bash
npm run docker:build
```

3. **Deploy with compose:**
```bash
docker-compose --env-file .env.production up -d
```

4. **Verify deployment:**
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f app

# Test API
curl http://localhost:3000/
```

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Health Checks

Production Dockerfile includes health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' transporters_backend
```

### Backup Strategy

**MongoDB Backup:**
```bash
# Backup database
docker exec transporters_mongodb mongodump \
  --username=admin \
  --password=admin123 \
  --authenticationDatabase=admin \
  --out=/backup

# Copy backup to host
docker cp transporters_mongodb:/backup ./backup
```

**Automated Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DATE"

docker exec transporters_mongodb mongodump \
  --username=admin \
  --password=admin123 \
  --authenticationDatabase=admin \
  --out=/backup/$DATE

docker cp transporters_mongodb:/backup/$DATE $BACKUP_DIR
echo "Backup completed: $BACKUP_DIR"
```

---

## Advanced Configuration

### Custom Networks

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

services:
  app:
    networks:
      - frontend
      - backend
  
  mongodb:
    networks:
      - backend  # Only accessible to app
```

### Secrets Management

**Using Docker Secrets:**

```yaml
secrets:
  mongo_password:
    file: ./secrets/mongo_password.txt

services:
  mongodb:
    secrets:
      - mongo_password
    environment:
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_password
```

### Scaling

```bash
# Scale app service
docker-compose up -d --scale app=3

# With load balancer
services:
  app:
    deploy:
      replicas: 3
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs app
```

**Common issues:**
1. Port already in use
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Kill process or change port in .env.docker
   ```

2. MongoDB connection failed
   ```bash
   # Check MongoDB is running
   docker-compose ps mongodb
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

3. Build errors
   ```bash
   # Clear cache and rebuild
   docker-compose build --no-cache app
   ```

### Database Connection Issues

**Test MongoDB connection:**
```bash
# From host
mongosh mongodb://admin:admin123@localhost:27017

# From app container
docker exec -it transporters_backend sh
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://admin:admin123@mongodb:27017/test?authSource=admin').then(() => console.log('Connected')).catch(err => console.error(err))"
```

### Permission Errors

**File permissions:**
```bash
# If using Linux, fix ownership
sudo chown -R $USER:$USER .
```

**Container permissions:**
```bash
# Check user inside container
docker exec -it transporters_backend whoami

# Should be 'nodejs' not 'root'
```

### Performance Issues

**Check resource usage:**
```bash
docker stats transporters_backend
```

**Optimize:**
1. Increase memory limit
2. Use volume for node_modules
3. Reduce log verbosity
4. Enable MongoDB indexing

### Clean Up

```bash
# Remove all containers
npm run docker:clean

# Or manually
docker-compose down -v
docker system prune -af
docker volume prune -f
```

---

## Best Practices

### 1. Use .dockerignore

Exclude unnecessary files from build context:
```
node_modules
dist
logs
*.log
.git
.env
```

### 2. Multi-stage Builds

Separate build and runtime stages for smaller images.

### 3. Non-root User

Always run containers as non-root:
```dockerfile
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
```

### 4. Health Checks

Add health checks for production:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
    CMD node healthcheck.js
```

### 5. Logging

Use structured logging:
```typescript
logger.info('Server started', { port: 3000, env: 'production' });
```

### 6. Secrets

Never commit secrets:
- Use environment variables
- Use Docker secrets
- Use external secret management (AWS Secrets Manager, Vault)

### 7. Resource Limits

Set CPU and memory limits in production.

### 8. Monitoring

Add monitoring tools:
- Prometheus
- Grafana
- ELK Stack

---

## Docker Compose Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service]

# Execute command
docker-compose exec app sh

# Scale services
docker-compose up -d --scale app=3

# Pull latest images
docker-compose pull

# Remove volumes
docker-compose down -v

# View service status
docker-compose ps

# Build without cache
docker-compose build --no-cache
```

---

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Best Practices for Docker](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Need Help?** Open an issue on GitHub!

