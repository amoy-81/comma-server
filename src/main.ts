import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import session from 'express-session';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NowApiHandler } from '@vercel/node';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());

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

  await app.init();
  return app;
}

const appPromise = bootstrap();

const handler: NowApiHandler = async (req, res) => {
  const app = await appPromise;
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
};

export default handler;
