import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from 'src/jwt/jwtService';
import { PostsService } from 'src/posts/posts.service';
import {
  CreateBlogInputModelType,
  UpdateBlogInputModelType,
  blogsPaginationType,
} from './blogs.scheme.types';
import { BlogsService } from './blogs.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected jwtService: JwtService,
  ) {}
  @Get()
  async getBlogsWithPagination(@Query() query: { object }) {
    const blogsPagination: blogsPaginationType =
      await this.blogsService.returnAllBlogs(query);
    return blogsPagination;
  }
  @Get(':id')
  async getBlogById(
    @Query() query: { object },
    @Param() params: { id: string },
    @Res() res: Response,
  ) {
    const foundBlog = await this.blogsService.findBlog(params);
    if (!foundBlog) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(foundBlog);
      return;
    }
  }
  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() query: { object },
    @Param() params: { id: string },
    @Res() res: Response,
    @Headers() headers: { authorization: string },
  ) {
    let userId = undefined;
    if (headers.authorization) {
      userId = await this.jwtService.verifyAndGetUserIdByToken(
        headers.authorization.split(' ')[1],
      );
    }
    const foundPosts = await this.blogsService.findPostsByBlogId(
      params,
      query,
      userId,
    );
    if (!foundPosts) {
      res.sendStatus(404);
      return;
    } else {
      res.status(200).send(foundPosts);
      return;
    }
  }
  @Post()
  async postBlog(
    @Body()
    body: CreateBlogInputModelType,
    @Res() res: Response,
  ) {
    const newBlog = await this.blogsService.createBlog(body);
    res.status(201).send(newBlog);
    return;
  }
  @Post(':id/posts')
  async createPostByBlogId(
    @Param() params: { id: string },
    @Body() body: { title: string; shortDescription: string; content: string },
    @Res() res: Response,
  ) {
    const createdPost = await this.blogsService.findBlog(params);
    if (!createdPost) {
      res.sendStatus(404);
      return;
    }
    const newPost = await this.postsService.createPostByBlogId(body, params.id);
    res.status(201).send(newPost);
    return;
  }
  @Put(':id')
  async updateBlog(
    @Param() params: { id: string },
    @Body() body: UpdateBlogInputModelType,
    @Res() res: Response,
  ) {
    const resultOfUpdateBlog = await this.blogsService.updateBlog(
      params.id,
      body,
    );
    if (!resultOfUpdateBlog) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
  @Delete(':id')
  async deleteBlogByID(@Param() params: { id }, @Res() res: Response) {
    const ResultOfDeleteBlog = await this.blogsService.deleteBlog(params);
    if (!ResultOfDeleteBlog) {
      res.sendStatus(404);
      return;
    } else {
      res.sendStatus(204);
      return;
    }
  }
}
