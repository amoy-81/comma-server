import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// import { CreatePostInput } from './dto/create-post.dto';
// import { saveInStorage } from '../../common/firebase/firebase.util';
import { PostService } from './post.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('image'))
  // async createNewPost(
  //   @Req() req: Request,
  //   @Body() createPostInput: CreatePostInput,
  //   @UploadedFile() imageFile: Express.Multer.File,
  // ) {
  //   // Save the file in storage and get its download URL
  //   const picturePath = imageFile ? await saveInStorage(imageFile) : null;

  //   // Add the image download URL to the input data
  //   createPostInput.image = picturePath;

  //   // Create new Post and return message
  //   return this.postService.create(createPostInput, req.user);
  // }

  @Post()
  async createNewPost(@Body() createPostInput: CreatePostDto) {
    return this.postService.createPost(createPostInput);
  }

  @Get('likes')
  async likes() {
    return this.postService.getLike();
  }

  @Post('like')
  async likepost(@Body() inpuut: { id: number }) {
    return this.postService.createLike(inpuut.id);
  }
}
