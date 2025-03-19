import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { NewsPaperService } from './news-paper.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateNewsPaperSectionDto } from './dto/create-news-paper-section.dto';
import { saveInStorage } from '../../common/firebase/firebase.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationQueryDto } from '../post/dto/pagination-dto';
import { UpdateNewsPaperSectionDto } from './dto/update-news-paper-section.dto';
import { UpdateNewsPaperInfoDto } from './dto/update-news-paper-info.dto';
import { GetPastNewsPapersDto } from './dto/newspaper.dto';

@Controller('news-paper')
export class NewsPaperController {
  constructor(private readonly newsPaperService: NewsPaperService) {}

  @Get()
  getNewsPapers(@Query() paginationQuery: PaginationQueryDto) {
    const { page = 1, pageSize = 6 } = paginationQuery;
    return this.newsPaperService.getYesterdayNewsPapers(page, pageSize);
  }

  @Get('past/:id')
  getPastNewsPaperById(@Param('id', ParseIntPipe) id: number) {
    return this.newsPaperService.getPastNewsPaperById(id);
  }

  @Get('past')
  getPastNewsPapers(@Query() query: GetPastNewsPapersDto) {
    const { period, page = 1, pageSize = 6 } = query;
    return this.newsPaperService.getPastNewsPapers(period, page, pageSize);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any) {
    return this.newsPaperService.create(req.user.id);
  }

  @Put('info/:id')
  @UseGuards(JwtAuthGuard)
  async updateNewsPaperInfo(
    @Req() req: any,
    @Param('id', ParseIntPipe) newsPaperId: number,
    @Body() updateData: UpdateNewsPaperInfoDto,
  ) {
    return this.newsPaperService.updateNewsPaperInfo(
      req.user.id,
      newsPaperId,
      updateData,
    );
  }

  @Post('section')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async addSections(
    @Req() req: any,
    @Body() body: CreateNewsPaperSectionDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    const picturePath = imageFile
      ? await saveInStorage(imageFile)
      : '/newspaper/default.jpg';

    body.image = picturePath;

    return this.newsPaperService.addSections(body, req.user.id);
  }

  @Put('section/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async editSection(
    @Req() req: any,
    @Param('id', ParseIntPipe) sectionId: number,
    @Body() updateData: UpdateNewsPaperSectionDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    if (imageFile) {
      const picturePath = await saveInStorage(imageFile);
      if (picturePath.length) updateData.image = picturePath;
    } else {
      delete updateData.image;
    }

    return this.newsPaperService.editSection(
      sectionId,
      req.user.id,
      updateData,
    );
  }

  @Delete('section/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSection(
    @Req() req: any,
    @Param('id', ParseIntPipe) sectionId: number,
  ) {
    return this.newsPaperService.deleteSection(sectionId, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOneNewsPaper(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.newsPaperService.getNewsPaperById(id, req.user.id);
  }
}
