import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://192.168.3.38:5173',
      'http://localhost:3000',
      'http://192.168.67.18:5173',
      'http://89.167.20.163:8082',
    ],
    credentials: true,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Pipes de validación globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
  console.log('🚀 Servidor corriendo en http://localhost:3000');
  console.log('📚 API disponible en http://localhost:3000/api');
}
bootstrap();
