import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription(
      'Dokumentacja REST API do zarządzania tablicami i zadaniami',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Wprowadź JWT w formacie: Bearer <token>',
        in: 'header',
      },
      'jwt-auth', // key
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    // exclude: [InternalModule],
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe()); // Automatically validate incoming requests based on DTOs
  app.setGlobalPrefix('api'); // Set a global prefix for all routes
  app.use(cookieParser()); // Use cookie parser middleware to handle cookies from http headers

  await app.startAllMicroservices(); // Start all microservices

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
