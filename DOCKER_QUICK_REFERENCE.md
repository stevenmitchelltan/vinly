# 🐳 Docker Quick Reference for Vinly

Essential Docker commands for day-to-day development.

---

## 🚀 Starting & Stopping

### Start Everything
```bash
# Start all services (backend + frontend + MongoDB)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start and rebuild images
docker-compose up --build

# Start with database tools (Mongo Express)
docker-compose --profile tools up
```

### Stop Everything
```bash
# Stop all services (Ctrl+C if in foreground, then:)
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

---

## 🔍 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Status
```bash
# List running containers
docker-compose ps

# List all containers
docker ps -a

# Check resource usage
docker stats
```

---

## 🛠️ Container Management

### Access Container Shell
```bash
# Backend container
docker exec -it vinly-backend bash

# Once inside:
python scripts/smart_scraper.py pepijn.wijn
python scripts/check_wines.py
exit

# Frontend container
docker exec -it vinly-frontend sh

# MongoDB container
docker exec -it vinly-mongodb mongosh
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart mongodb
```

---

## 🗄️ Database Operations

### Access MongoDB
```bash
# Using Mongo Express (web UI)
docker-compose --profile tools up
# Visit: http://localhost:8081
# Login: admin/admin

# Using mongosh CLI
docker exec -it vinly-mongodb mongosh -u admin -p vinly-local-dev --authenticationDatabase admin

# Common queries:
use vinly
db.wines.find()
db.tiktok_videos.count()
db.influencers.find()
```

### Backup Database
```bash
# Backup to file
docker exec vinly-mongodb mongodump --uri="mongodb://admin:vinly-local-dev@localhost:27017/vinly?authSource=admin" --archive > backup.dump

# Restore from file
docker exec -i vinly-mongodb mongorestore --uri="mongodb://admin:vinly-local-dev@localhost:27017/vinly?authSource=admin" --archive < backup.dump
```

---

## 🔨 Building & Rebuilding

### Rebuild Images
```bash
# Rebuild all images
docker-compose build

# Rebuild without cache (fresh build)
docker-compose build --no-cache

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and start
docker-compose up --build
```

---

## 🧹 Cleanup

### Remove Containers & Images
```bash
# Remove stopped containers
docker-compose rm

# Remove all containers, networks, volumes
docker-compose down -v

# Remove unused Docker resources
docker system prune

# Remove everything (including images)
docker system prune -a

# Remove specific image
docker rmi vinly-backend
```

### Free Up Space
```bash
# See disk usage
docker system df

# Remove unused containers, networks, images
docker system prune -a

# Remove volumes
docker volume prune
```

---

## 📦 Volume Management

### List Volumes
```bash
# List all volumes
docker volume ls

# Inspect specific volume
docker volume inspect vinly_mongodb_data
```

### Backup Volumes
```bash
# Backup MongoDB data volume
docker run --rm \
  -v vinly_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore MongoDB data volume
docker run --rm \
  -v vinly_mongodb_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

---

## 🔧 Development Workflows

### Run Python Scripts
```bash
# Access backend container
docker exec -it vinly-backend bash

# Run scripts
python scripts/smart_scraper.py pepijn.wijn
python scripts/transcribe_videos.py
python scripts/extract_wines.py
python scripts/check_wines.py
python scripts/enrich_wine_images.py
```

### Update Dependencies
```bash
# Backend: Update requirements.txt, then:
docker-compose build backend
docker-compose up -d backend

# Frontend: Update package.json, then:
docker-compose build frontend
docker-compose up -d frontend
```

### Environment Variables
```bash
# Edit .env file, then restart:
docker-compose down
docker-compose up -d

# Or just restart affected service:
docker-compose restart backend
```

---

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Check what's using port 8000
# Windows:
netstat -ano | findstr :8000

# Linux/Mac:
lsof -i :8000

# Change port in docker-compose.yml if needed
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up backend

# Remove and recreate
docker-compose rm backend
docker-compose up backend
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up

# List networks
docker network ls

# Inspect network
docker network inspect vinly_vinly-network
```

### Reset Everything
```bash
# Nuclear option - fresh start
docker-compose down -v
docker system prune -a
docker volume prune
docker-compose up --build
```

---

## 📊 Useful One-Liners

```bash
# Quick restart after code changes
docker-compose restart backend && docker-compose logs -f backend

# Check if backend is healthy
docker exec vinly-backend curl -f http://localhost:8000/health || echo "Backend not healthy"

# Count wines in database
docker exec vinly-mongodb mongosh -u admin -p vinly-local-dev --authenticationDatabase admin --eval "db.wines.countDocuments()" vinly

# View last 50 backend logs
docker-compose logs --tail=50 backend

# Follow backend logs only
docker-compose logs -f backend 2>&1 | grep -v "GET /health"

# Restart backend and frontend together
docker-compose restart backend frontend

# Check container sizes
docker ps --size

# Export database to JSON
docker exec vinly-mongodb mongoexport -u admin -p vinly-local-dev --authenticationDatabase admin -d vinly -c wines --jsonArray --pretty --out /tmp/wines.json
```

---

## 🎯 Common Scenarios

### Scenario 1: Code Changes
```bash
# Backend code changes (hot reload enabled)
# Just save the file - automatic restart!

# Frontend code changes
docker-compose restart frontend
# Or rebuild for production build
docker-compose build frontend && docker-compose up -d frontend
```

### Scenario 2: Dependency Updates
```bash
# Updated requirements.txt or package.json
docker-compose build --no-cache
docker-compose up -d
```

### Scenario 3: Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Or backup first
docker exec vinly-mongodb mongodump --uri="mongodb://admin:vinly-local-dev@localhost:27017/vinly?authSource=admin" --archive > backup.dump
docker-compose down -v
docker-compose up -d
# Restore if needed
```

### Scenario 4: Production Deploy
```bash
# Ensure everything works locally
docker-compose up

# Push to GitHub
git add .
git commit -m "Deploy with Docker"
git push origin main

# Render auto-deploys from render.yaml
```

---

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Full deployment guide
- [README.md](./README.md) - Project overview

---

**Quick Help:**
- **Start**: `docker-compose up`
- **Stop**: `docker-compose down`
- **Logs**: `docker-compose logs -f`
- **Shell**: `docker exec -it vinly-backend bash`
- **Rebuild**: `docker-compose up --build`

**Made with 🍷 and 🐳!**

