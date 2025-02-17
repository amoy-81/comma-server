import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AddForbiddenWordsDto, CheckForbiddenWordsDto } from './dto/admin.dto';
import { JwtAuthAdminGuard } from 'src/common/guards/jwt-auth-admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // forbidden words
  @Post('forbidden-word/add')
  @UseGuards(JwtAuthAdminGuard)
  async addForbiddenWords(@Body() { words }: AddForbiddenWordsDto) {
    return this.adminService.addForbiddenWords(words);
  }

  @Get('forbidden-word')
  @UseGuards(JwtAuthAdminGuard)
  async getForbiddenWords() {
    return this.adminService.getForbiddenWords();
  }

  @Post('forbidden-word/check')
  @HttpCode(200)
  async checkSentence(@Body() { sentence }: CheckForbiddenWordsDto) {
    return this.adminService.checkForbiddenWordsSentence(sentence);
  }

  // Statistics
  //     - all user
  //     - posts user
  //     - active users "sessions"
  //     - count of login in this week

  // report a post -> user
  // veiw and handling report (delete post || change report status) -> admin
}
