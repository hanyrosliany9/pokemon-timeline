import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  })

  // Global interceptors
  app.useGlobalInterceptors(new DecimalSerializerInterceptor())

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Set global prefix
  app.setGlobalPrefix('/')

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Server is running on http://localhost:${port}`)
  console.log(`📊 Health check: http://localhost:${port}/health`)
}

bootstrap()
