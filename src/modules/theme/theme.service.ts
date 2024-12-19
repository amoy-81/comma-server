import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Poster } from './entities/poster.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ThemeService {
  constructor(
    @InjectRepository(Poster)
    private readonly posterRepository: Repository<Poster>,
  ) {}

  async findAllPoster(page: number, pageSize: number) {
    return this.posterRepository
      .createQueryBuilder('poster')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  }
}
