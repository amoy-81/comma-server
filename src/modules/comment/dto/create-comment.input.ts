import { Field } from '@nestjs/graphql';

export class CreateCommentInput {
  @Field(() => String)
  postId: string;

  @Field(() => String)
  body: string;
}
