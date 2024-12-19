import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('poster')
  @UseGuards(JwtAuthGuard)
  getPosters(@Query() paginationQuery: PaginationDto) {
    const { page = 1, pageSize = 5 } = paginationQuery;

    return this.themeService.findAllPoster(page, pageSize);
  }
}
