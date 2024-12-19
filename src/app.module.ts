import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { BoardModule } from './modules/board/board.module';
import { NewsPaperModule } from './modules/news-paper/news-paper.module';
import { CacheModule } from '@nestjs/cache-manager';
import { NotifModule } from './modules/notif/notif.module';
import { ThemeModule } from './modules/theme/theme.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostModule,
    CommentModule,
    BoardModule,
    NewsPaperModule,
    NotifModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    ConfigModule.forRoot({
      cache: true,
    }),
    CacheModule.register({ isGlobal: true }),
    ThemeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
