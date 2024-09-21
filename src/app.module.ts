import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
// import { join } from 'path';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { GraphQLModule } from '@nestjs/graphql';
// import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { PostModule } from './modules/post/post.module';
// import { CommentModule } from './modules/comment/comment.module';
// import { ChatModule } from './modules/chat/chat.module';
// import { AudioCallModule } from './modules/audio-call/audio-call.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PostModule,
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   path: 'master',
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   playground: true,
    //   context: ({ req, res }) => ({ req, res }),
    //   // plugins: [ApolloServerPluginLandingPageLocalDefault()],
    //   // cors: true,
    //   // introspection: true,
    //   // cache: 'bounded',
    // }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const options: MongooseModuleOptions = {
    //       uri: configService.get<string>('DB_URL'),
    //     };

    //     return options;
    //   },
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: +process.env.PG_PORT,
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      cache: true,
    }),
    // PostModule,
    CommentModule,
    ChatModule,
    // AudioCallModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
