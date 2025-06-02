import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe()); // Automatically validate incoming requests based on DTOs
  app.setGlobalPrefix('api'); // Set a global prefix for all routes
  app.use(cookieParser()); // Use cookie parser middleware to handle cookies from http headers

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('REST API for boards, task‐groups, tasks and users')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // This name ('access-token') is how we reference the security scheme in @ApiSecurity/@ApiBearerAuth
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.startAllMicroservices(); // Start all microservices

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
