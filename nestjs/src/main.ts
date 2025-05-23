import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe()); // Automatically validate incoming requests based on DTOs
  app.setGlobalPrefix('api'); // Set a global prefix for all routes

  await app.startAllMicroservices(); // Start all microservices

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
