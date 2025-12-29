# Pokemon Card Project Timeline & Expense Tracker

A real-time web application to monitor Pokemon card cropping and motion work project timeline and expenses, with support for USDT and IDR currencies with live exchange rates.

## Tech Stack

- **Frontend**: React 19.2, Vite, TailwindCSS, Zustand
- **Backend**: NestJS, PostgreSQL, Prisma 7, Redis
- **Real-time**: WebSocket (Socket.io), Redis Pub/Sub
- **Deployment**: Docker, Cloudflare Tunnel

## Project Structure

```
pokemon-timeline/
├── shared/          # Shared TypeScript types and enums
├── backend/         # NestJS API with WebSocket gateway
├── frontend/        # React 19 SPA with Vite
├── docker-compose.dev.yml    # Development environment
├── docker-compose.prod.yml   # Production environment
└── .env             # Environment configuration
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and install dependencies**
   ```bash
   cd pokemon-timeline
   npm install
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start development environment**
   ```bash
   npm run dev
   ```

   This will start:
   - PostgreSQL on `localhost:5432`
   - Redis on `localhost:6379`
   - Backend on `localhost:3001`
   - Frontend on `localhost:5173`

4. **View logs**
   ```bash
   npm run dev:logs
   ```

5. **Stop services**
   ```bash
   npm run dev:down
   ```

### Database Setup

After starting the dev environment:

```bash
# Run migrations
docker exec pokemon-timeline-backend-dev npx prisma migrate dev

# Optionally seed database
docker exec pokemon-timeline-backend-dev npx prisma db seed
```

### Access Database & Redis

**PostgreSQL:**
```bash
docker exec -it pokemon-timeline-db-dev psql -U pokemon_user -d pokemon_timeline
```

**Redis:**
```bash
docker exec -it pokemon-timeline-redis-dev redis-cli
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Vite HMR - changes reflect instantly
- **Backend**: Nodemon watches `src/` and `prisma/` directories

### Making Changes

1. **Shared Types** - Update `/shared/src/` then rebuild:
   ```bash
   cd shared && npm run build
   ```

2. **Backend** - Changes auto-reload via nodemon

3. **Frontend** - Changes auto-reload via Vite

## Configuration

### Environment Variables

Key variables in `.env`:

```env
# Database
POSTGRES_DB=pokemon_timeline
POSTGRES_USER=pokemon_user
POSTGRES_PASSWORD=dev_password_123

# Redis
REDIS_PASSWORD=redis_dev_password_123

# Currency APIs
COINGECKO_API_KEY=your_key_here
BINANCE_API_KEY=your_key_here

# Frontend URLs
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Features

### Timeline Management
- Create and manage project milestones and tasks
- Track progress (0-100%)
- Set task dependencies
- Color-coded status (Pending, In Progress, Completed, Delayed, Cancelled)

### Expense Tracking
- Log expenses in USDT or IDR
- Real-time currency conversion
- Categorize expenses (Cropping, Motion Work, Tools, etc.)
- View spending statistics and breakdowns
- Filter and sort expenses

### Real-time Updates
- Live expense and timeline updates across browser tabs/devices
- WebSocket-powered synchronization
- Redis pub/sub for scalable event distribution

### Currency Exchange
- Real-time rates via CoinGecko API (primary) with Binance fallback
- 3-layer caching strategy:
  - Redis (5-minute TTL)
  - PostgreSQL (1-hour TTL)
  - External API (fallback)
- Automatic updates every 5 minutes

## Deployment

### Production Deployment

1. **Build production images**
   ```bash
   npm run prod:build
   ```

2. **Start production stack**
   ```bash
   npm run prod:up
   ```

3. **Setup Cloudflare Tunnel**
   - Create tunnel in Cloudflare dashboard
   - Get tunnel token
   - Add to `.env.production`: `CLOUDFLARE_TUNNEL_TOKEN`
   - Configure DNS record

### Production Environment

See `.env.example` for production configuration variables.

## API Endpoints

### Timeline
- `GET /api/timeline` - List all events
- `GET /api/timeline/:id` - Get specific event
- `POST /api/timeline` - Create event
- `PATCH /api/timeline/:id` - Update event
- `DELETE /api/timeline/:id` - Delete event

### Expenses
- `GET /api/expense` - List all expenses
- `POST /api/expense` - Create expense
- `PATCH /api/expense/:id` - Update expense
- `DELETE /api/expense/:id` - Delete expense
- `GET /api/expense/stats` - Get spending statistics

### Currency
- `GET /api/currency/rate` - Get current exchange rate
- `POST /api/currency/convert` - Convert amount

## WebSocket Events

Real-time updates via WebSocket:

```
expense:created    - New expense added
expense:updated    - Expense modified
expense:deleted    - Expense removed
timeline:created   - New timeline event
timeline:updated   - Timeline event modified
timeline:deleted   - Timeline event removed
currency:refreshed - Exchange rates updated
```

## Performance

Target metrics:
- Initial load: < 2 seconds
- API response: < 200ms (95th percentile)
- WebSocket latency: < 100ms
- Frontend bundle: < 500KB gzipped

## Testing

### Running Tests

**Backend:**
```bash
npm run test          # Run tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage
```

**Frontend:**
```bash
npm run test
npm run test:watch
```

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL

# Kill the process
kill -9 <PID>
```

**Database connection errors:**
```bash
# Check if PostgreSQL is healthy
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Prisma Issues

**Schema generation errors:**
```bash
docker exec pokemon-timeline-backend-dev npx prisma generate
```

**Migration conflicts:**
```bash
docker exec pokemon-timeline-backend-dev npx prisma migrate reset
```

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make changes (frontend/backend auto-reload)
3. Test thoroughly
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/name`
6. Create Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Implementation Timeline

- **Phase 1**: Foundation & Docker (✅ In Progress)
- **Phase 2**: Database Schema
- **Phase 3**: Backend Services
- **Phase 4**: Currency Integration
- **Phase 5**: WebSocket Gateway
- **Phase 6**: Frontend Foundation
- **Phase 7**: Frontend Services
- **Phase 8**: Frontend Components
- **Phase 9**: Production Deployment

Estimated: 3-4 weeks for MVP
