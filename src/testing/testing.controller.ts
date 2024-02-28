/* eslint-disable prefer-const */
import { Controller, Delete, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from 'src/blogs/blogs.scheme.types';
import { Comment } from 'src/comments/comments.scheme.types';
import { Post, PostDocument } from 'src/posts/posts.scheme.types';
import { User, UserDocument } from 'src/users/users.scheme.types';

@Controller('testing')
export class TestController {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<BlogDocument>,
  ) {}

  @Delete('all-data')
  async deleteAllData(@Res() res: Response) {
    let resultOfDeleteBlogs = await this.blogModel.deleteMany({});

    let resultOfDeletePosts = await this.postModel.deleteMany({});

    let resultOfDeleteUsers = await this.userModel.deleteMany({});

    let resultOfDeleteComments = await this.commentModel.deleteMany({});
    /*let resultOfDeleteBlacklistTokens = await BlacklistTokensModel.deleteMany({})
	let resultOfDeleteIpRequests = await ipRequestModel.deleteMany({})
	let resultOfDeleteRefreshTokenMeta = await refreshTokensMetaModel.deleteMany(		{}
	)*/
    res.sendStatus(204);
    return;
  }
}
