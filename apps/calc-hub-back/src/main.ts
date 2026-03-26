import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import { type NextFunction, type Request, type Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance() as {
    set?: (key: string, value: unknown) => void;
  };
  expressApp.set?.('trust proxy', 1);
  app.use(helmet());
  app.use(compression());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header('x-request-id') ?? randomUUID();
    res.setHeader('x-request-id', requestId);
    next();
  });
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Calc Hub Backend')
    .setDescription('SaaS calculation engine API')
    .setVersion('1.0.0')
    .setExternalDoc('Swagger JSON', '/swagger.json')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, doc, {
    jsonDocumentUrl: '/swagger.json',
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
