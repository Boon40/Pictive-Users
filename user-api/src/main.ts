import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    transform: true, // Transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
  }));

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
