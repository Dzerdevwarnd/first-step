/* eslint-disable prefer-const */
import { Controller, Delete, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { Comment } from 'src/comments/comments.mongo.scheme';
import {
  Blog,
  BlogDocument,
} from 'src/endPointsEntities/blogs/blogs.mongo.scheme';
import { Post, PostDocument } from 'src/posts/posts.mongo.scheme';
import { User, UserDocument } from '../users/users.mongo.scheme';

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
