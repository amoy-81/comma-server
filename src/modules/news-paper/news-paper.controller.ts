import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { NewsPaperService } from './news-paper.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateNewsPaperSectionDto } from './dto/create-news-paper-section.dto';
import { saveInStorage } from 'src/common/firebase/firebase.util';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('news-paper')
export class NewsPaperController {
  constructor(private readonly newsPaperService: NewsPaperService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any) {
    return this.newsPaperService.create(req.user.id);
  }

  @Post('section')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async addSections(
    @Req() req: any,
    @Body() body: CreateNewsPaperSectionDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    const picturePath = imageFile ? await saveInStorage(imageFile) : null;

    body.image = picturePath;

    return this.newsPaperService.addSections(body, req.user.id);
  }

  @Get()
  findAll() {
    return this.newsPaperService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsPaperService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsPaperService.remove(+id);
  }
}
