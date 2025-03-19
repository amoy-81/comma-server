import { IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetPastNewsPapersDto extends PaginationDto {
  @IsIn(['week', 'month', 'year'], {
    message: 'period must be one of: week, month, year',
  })
  period: 'week' | 'month' | 'year';
}
