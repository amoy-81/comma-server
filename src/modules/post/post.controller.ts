import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { saveInStorage } from 'src/common/firebase/firebase.util';
import { PostService } from './post.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createNewPost(
    @Req() req: Request,
    @Body() createPostInput: CreatePostInput,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    // Save the file in storage and get its download URL
    const picturePath = imageFile ? await saveInStorage(imageFile) : null;

    // Add the image download URL to the input data
    createPostInput.image = picturePath;

    // Create new Post and return message
    return this.postService.create(createPostInput, req.user);
  }
}
