import { Module } from '@nestjs/common';
import { NewsPaperService } from './news-paper.service';
import { NewsPaperController } from './news-paper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsPaper } from './entities/news-paper.entity';
import { NewsPaperSection } from './entities/news-paper-section.entity';
import { ThemeModule } from '../theme/theme.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsPaper, NewsPaperSection]),
    ThemeModule,
  ],
  controllers: [NewsPaperController],
  providers: [NewsPaperService],
})
export class NewsPaperModule {}
