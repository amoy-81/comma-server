import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { PaginationQueryDto } from '../post/dto/pagination-dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  find(@Query() paginationQuery: PaginationQueryDto) {
    const { page = 1, pageSize = 10 } = paginationQuery;
    return this.boardService.find(page, pageSize);
  }
}
