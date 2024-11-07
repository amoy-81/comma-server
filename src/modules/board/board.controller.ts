import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { PaginationQueryDto } from '../post/dto/pagination-dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createBoardDto: CreateBoardDto) {
    createBoardDto.userId = req?.user?.id;
    return this.boardService.create(createBoardDto);
  }

  @Get()
  find(@Query() paginationQuery: PaginationQueryDto) {
    const { page = 1, pageSize = 10 } = paginationQuery;
    return this.boardService.find(page, pageSize);
  }
}
