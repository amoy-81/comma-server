import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// import { CreatePostInput } from './dto/create-post.dto';
// import { saveInStorage } from '../../common/firebase/firebase.util';
import { PostService } from './post.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { saveInStorage } from '../../common/firebase/firebase.util';
import { CreatePostInput } from './dto/createPostInput';
import { PaginationQueryDto } from './dto/pagination-dto';
import { PostsPaginationQueryDto } from './dto/get-posts-dto';
import { SearchPostQueryDto } from './dto/search-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('image_content'))
  async createNewPost(
    @Req() req: any,
    @Body() createPostInput: CreatePostInput,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    // Save the file in storage and get its download URL
    const picturePath = imageFile ? await saveInStorage(imageFile) : null;

    // Add the image download URL to the input data & userID
    createPostInput.user_id = req.user.id;
    createPostInput.image_content = picturePath;

    // Create new Post and return message
    return this.postService.createPost(createPostInput);
  }

  // getFollowersPost and get a userID Post
  @Get()
  @UseGuards(JwtAuthGuard)
  getUserPosts(@Req() req: any, @Query() query: PostsPaginationQueryDto) {
    const { userId, page = 1, pageSize = 5 } = query;
    if (userId) {
      return this.postService.getUserPosts(req.user.id, userId, page, pageSize);
    } else {
      return this.postService.getFollowingUserPosts(
        req.user.id,
        page,
        pageSize,
      );
    }
  }

  @Get('random')
  getRandomPosts(@Query() paginationQuery: PaginationQueryDto) {
    const { page = 1, pageSize = 6 } = paginationQuery;
    return this.postService.getRandomPosts(page, pageSize);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchPost(@Query() searchPostQueryDto: SearchPostQueryDto) {
    const { text, page = 1, pageSize = 5 } = searchPostQueryDto;
    return this.postService.searchPostByText(text, page, pageSize);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOnePost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getOnePostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('toggle-like/:postId')
  async toggleLike(
    @Req() req: any,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return this.postService.toggleLike(postId, req.user.id);
  }

  @Get('likers/:postId')
  async getPostLikes(
    @Param('postId') postId: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    const { page = 1, pageSize = 6 } = paginationQuery;
    return this.postService.getPostLikes(postId, page, pageSize);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deletePostById(@Req() req: any, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.deletePost(req.user.id, postId);
  }
}
