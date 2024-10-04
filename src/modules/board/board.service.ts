import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) private readonly boardRepo: Repository<Board>,
  ) {}
  async create(createBoardDto: CreateBoardDto) {
    const countOfBoardItems = await this.boardRepo.count();

    if (countOfBoardItems >= 10) {
      const olderItem = await this.boardRepo.findOne({
        where: {},
        order: { createdAt: 'ASC' },
      });

      await this.boardRepo.delete(olderItem.id);
    }

    const newItem = this.boardRepo.create(createBoardDto);

    return await this.boardRepo.save(newItem);
  }

  async find(page: number, pageSize: number) {
    const board = await this.boardRepo.find({
      relations: ['user'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return plainToInstance(Board, board);
  }
}
