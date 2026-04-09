import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const logger = new Logger('HTTP');

  // Middleware de logging para todas las peticiones
  app.use((req: any, res: any, next: () => void) => {
    const { method, url } = req;
    const start = Date.now();

    res.on('finish', () => {
      const status: number = res.statusCode;
      const ms = Date.now() - start;
      const color =
        status >= 500 ? '\x1b[31m' : // rojo
        status >= 400 ? '\x1b[33m' : // amarillo
        '\x1b[32m';                   // verde
      const reset = '\x1b[0m';
      logger.log(`${color}${method} ${url} ${status} — ${ms}ms${reset}`);
    });

    next();
  });

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
