import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  postId: string;

  @Field(() => String)
  body: string;
}
