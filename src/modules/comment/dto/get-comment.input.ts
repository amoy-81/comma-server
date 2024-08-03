import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetCommentInput {
  @Field(() => String)
  postId: string;

  @Field(() => Number, { nullable: true })
  page: number;

  @Field(() => Number, { nullable: true })
  pageSize: number;
}
