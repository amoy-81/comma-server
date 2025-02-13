import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForbiddenWord } from './entities/forbidden-word.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForbiddenWord])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
