import { InputType, Field, PartialType } from '@nestjs/graphql';
import { PaginationInput } from './pagination-inputs';

@InputType()
export class GetPostsInputs extends PartialType(PaginationInput) {
  @Field(() => String, { nullable: true })
  userId: string;

  @Field(() => String, { nullable: true })
  searchText: string;
}
