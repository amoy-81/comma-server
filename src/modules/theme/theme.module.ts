import { Module } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poster } from './entities/poster.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poster])],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
