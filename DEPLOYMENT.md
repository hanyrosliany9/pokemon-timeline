# Deployment Guide - Pokemon Timeline & Expense Tracker

This guide covers deploying the Pokemon Timeline application to production using Docker and Cloudflare Tunnel.

## Prerequisites

- Docker and Docker Compose installed
- Git for version control
- Cloudflare account for tunneling
- Strong passwords (minimum 20 characters) for PostgreSQL and Redis
- API keys for CoinGecko and Binance (optional but recommended)

## Local Self-Hosted Production Setup

### 1. Prepare Environment Variables

```bash
# Copy production example
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Critical variables to set:**
- `POSTGRES_PASSWORD` - Strong random password (20+ characters)
- `REDIS_PASSWORD` - Strong random password (20+ characters)
- `COINGECKO_API_KEY` - Get from https://www.coingecko.com/en/api
- `CLOUDFLARE_TUNNEL_TOKEN` - Create tunnel first (see below)

### 2. Setup Cloudflare Tunnel

#### 2.1 Create Tunnel in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Login to your Cloudflare account
3. Navigate to **Zero Trust** → **Networks** → **Tunnels**
4. Click **Create a tunnel**
5. Choose a name (e.g., "pokemon-timeline-tunnel")
6. Choose **Docker** as the environment
7. Copy the tunnel token from the command shown

#### 2.2 Configure Tunnel Routes

After creating the tunnel:

1. Go to **Public Hostnames** section
2. Create new public hostname:
   - **Subdomain**: Choose your subdomain (e.g., "pokemon")
   - **Domain**: Select your domain
   - **Type**: HTTPS
   - **URL**: `http://frontend:80`

3. Create another for API (optional):
   - **Path**: `/api*`
   - **Type**: HTTPS
   - **URL**: `http://backend:3001`

### 3. Build and Start Production Stack

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 4. Initialize Database

On first run, the database needs to be set up:

```bash
# Run migrations
docker exec pokemon-timeline-backend-prod npx prisma migrate deploy

# Seed with sample data (optional)
docker exec pokemon-timeline-backend-prod npx prisma db seed
```

### 5. Verify Deployment

```bash
# Check health endpoints
curl http://localhost:3001/health
curl http://localhost/

# Check container logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs cloudflared
```

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
docker-compose -f docker-compose.prod.yml logs -f cloudflared
```

### Database Backup

```bash
# Backup PostgreSQL
docker exec pokemon-timeline-db-prod pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
docker exec -i pokemon-timeline-db-prod psql -U ${POSTGRES_USER} ${POSTGRES_DB} < backup.sql
```

### Database Maintenance

```bash
# Connect to database
docker exec -it pokemon-timeline-db-prod psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

# Run Prisma CLI commands
docker exec pokemon-timeline-backend-prod npx prisma studio
docker exec pokemon-timeline-backend-prod npx prisma migrate status
```

### Redis Management

```bash
# Connect to Redis CLI
docker exec -it pokemon-timeline-redis-prod redis-cli -a ${REDIS_PASSWORD}

# Check memory usage
docker exec pokemon-timeline-redis-prod redis-cli -a ${REDIS_PASSWORD} INFO memory

# Clear cache (careful!)
docker exec pokemon-timeline-redis-prod redis-cli -a ${REDIS_PASSWORD} FLUSHALL
```

### System Health Check

```bash
# Docker disk usage
docker system df

# Clean up unused data
docker system prune -a

# Check resource usage
docker stats
```

## Updating Deployment

### Pull Latest Changes

```bash
git pull origin main
```

### Rebuild and Restart

```bash
# Rebuild images
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Run migrations if schema changed
docker exec pokemon-timeline-backend-prod npx prisma migrate deploy
```

### Rolling Update (Zero Downtime)

```bash
# Rebuild specific service
docker-compose -f docker-compose.prod.yml build backend

# Update only that service
docker-compose -f docker-compose.prod.yml up -d backend

# Verify health
docker-compose -f docker-compose.prod.yml ps
```

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check database connection
docker exec pokemon-timeline-backend-prod npx prisma db push

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check credentials in .env.production
# Test connection
docker exec pokemon-timeline-db-prod psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1"
```

### WebSocket not working

1. Check Cloudflare tunnel configuration
2. Ensure WebSocket is enabled in route settings
3. Check browser console for connection errors
4. Verify backend logs: `docker logs pokemon-timeline-backend-prod`

### Cloudflare tunnel disconnected

```bash
# Check tunnel status
docker logs pokemon-timeline-tunnel

# Restart tunnel
docker-compose -f docker-compose.prod.yml restart cloudflared

# Check tunnel token is correct in .env.production
```

### High CPU/Memory Usage

```bash
# Check resource usage
docker stats

# Check for slow queries
docker exec pokemon-timeline-db-prod psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Restart service
docker-compose -f docker-compose.prod.yml restart backend
```

## Security Considerations

### Firewall

```bash
# Only expose to localhost (tunnel handles external access)
# In production, binding should be to 127.0.0.1
```

### Secrets Management

1. Never commit `.env.production` to git
2. Use strong passwords (20+ characters, mixed case, numbers, symbols)
3. Rotate API keys periodically
4. Keep Cloudflare token secure

### SSL/TLS

- Cloudflare Tunnel handles HTTPS automatically
- All traffic between your server and Cloudflare is encrypted
- No need for additional SSL certificates

### Regular Backups

```bash
# Automated daily backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/pokemon-timeline"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec pokemon-timeline-db-prod pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily execution
# 0 2 * * * /path/to/backup.sh
```

## Performance Optimization

### Database

```bash
# Run maintenance
docker exec pokemon-timeline-db-prod vacuumdb -U ${POSTGRES_USER} -d ${POSTGRES_DB} -v

# Check index usage
docker exec pokemon-timeline-db-prod psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;"
```

### Redis

```bash
# Check memory
docker exec pokemon-timeline-redis-prod redis-cli -a ${REDIS_PASSWORD} INFO memory

# Adjust maxmemory policy if needed
docker exec pokemon-timeline-redis-prod redis-cli -a ${REDIS_PASSWORD} CONFIG GET maxmemory-policy
```

### Caching

- Static assets cached for 1 year via Nginx
- API responses cached in Redis with 5-minute TTL
- Database queries optimized with indexes

## Scaling Considerations

For larger deployments:

1. **Database**: Consider managed PostgreSQL (RDS, PlanetScale)
2. **Redis**: Use managed Redis (ElastiCache, Redis Cloud)
3. **Load Balancing**: Use Cloudflare Load Balancing
4. **Multiple Instances**: Deploy multiple backend instances behind load balancer
5. **CDN**: Use Cloudflare CDN for static assets

## Support & Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## Rollback Procedures

### Rollback to Previous Version

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout HEAD~1

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# List migrations
docker exec pokemon-timeline-backend-prod npx prisma migrate status

# Revert to previous migration
docker exec pokemon-timeline-backend-prod npx prisma migrate resolve --rolled-back "migration_name"

# Re-run migrations
docker exec pokemon-timeline-backend-prod npx prisma migrate deploy
```

---

**Last Updated**: December 2025
**Version**: 1.0.0
