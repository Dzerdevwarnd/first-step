/* eslint-disable prefer-const */
import { Controller, Delete, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { Model } from 'mongoose';
import {
  BlacklistToken,
  BlacklistTokenDocument,
} from 'src/DBEntities/blacklistTokens/blacklistTokens.scheme.types';
import {
  RefreshTokenMeta,
  RefreshTokenMetaDocument,
} from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.scheme.types';
import { Comment } from 'src/comments/comments.mongo.scheme';
import {
  Blog,
  BlogDocument,
} from 'src/endPointsEntities/blogs/blogs.mongo.scheme';
import { Post, PostDocument } from 'src/posts/posts.mongo.scheme';
import { DataSource } from 'typeorm';
import { User, UserDocument } from '../users/users.mongo.scheme';

@Controller('testing')
export class TestController {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<BlogDocument>,
    @InjectModel(BlacklistToken.name)
    private blacklistTokenModel: Model<BlacklistTokenDocument>,
    @InjectModel(RefreshTokenMeta.name)
    private refreshTokensMetaModel: Model<RefreshTokenMetaDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  @Delete('all-data')
  async deleteAllData(@Res() res: Response) {
    let resultOfDeleteBlogs = await this.blogModel.deleteMany({});

    let resultOfDeletePosts = await this.postModel.deleteMany({});

    let resultOfDeleteUsers = await this.userModel.deleteMany({});

    let resultOfDeleteComments = await this.commentModel.deleteMany({});
    let resultOfDeleteBlacklistTokens =
      await this.blacklistTokenModel.deleteMany({});
    // let resultOfDeleteIpRequests = await ipRequestModel.deleteMany({});
    let resultOfDeleteRefreshTokenMeta =
      await this.refreshTokensMetaModel.deleteMany({});
    res.sendStatus(204);
    67716;

    const tables = [
      'Users',
      'Blogs',
      'Posts',
      'PostLikes',
      'Comments',
      'CommentsLikes',
    ];
    for (const table of tables) {
      await this.dataSource.query(`DELETE FROM "${table}"`);
    }
    return;
  }
}
