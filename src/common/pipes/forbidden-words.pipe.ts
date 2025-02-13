import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { AdminService } from 'src/modules/admin/admin.service';

@Injectable()
export class ForbiddenWordsPipe implements PipeTransform {
  constructor(private readonly adminService: AdminService) {}

  async transform(value: any) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Invalid input data');
    }

    const { containsForbiddenWords, words } =
      await this.adminService.checkForbiddenWordsSentence(value);

    if (containsForbiddenWords) {
      throw new BadRequestException(
        `Your input contains forbidden words: ${words.join(', ')}`,
      );
    }

    return value;
  }
}
