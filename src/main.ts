import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import session from 'express-session';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  config();

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    credentials: true,
  });

  const sessionSecretKey = process.env.SESSION_SECRET_KEY;
  app.use(cookieParser());
  app.use(
    session({
      secret: sessionSecretKey,
      saveUninitialized: true,
      resave: true,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
