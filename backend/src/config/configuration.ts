export interface Config {
  NODE_ENV: string
  PORT: number
  DATABASE_URL: string
  REDIS_URL: string
  CORS_ORIGIN: string
  COINGECKO_API_KEY: string
  BINANCE_API_KEY: string
  BINANCE_API_SECRET: string
}

export const configuration = (): Config => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'CORS_ORIGIN',
  ]

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  )

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    )
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3001', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://pokemon_user:pokemon_password@postgres:5432/pokemon_timeline',
    REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
    BINANCE_API_KEY: process.env.BINANCE_API_KEY || '',
    BINANCE_API_SECRET: process.env.BINANCE_API_SECRET || '',
  }
}
