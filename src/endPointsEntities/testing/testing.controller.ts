/* eslint-disable prefer-const */
import {
  BlacklistToken,
  BlacklistTokenDocument,
} from '@app/src/DBEntities/blacklistTokens/blacklistTokens.scheme.types';
import {
  RefreshTokenMeta,
  RefreshTokenMetaDocument,
} from '@app/src/DBEntities/refreshTokenMeta/refreshTokenMeta.scheme.types';
import { Comment } from '@app/src/comments/comments.mongo.scheme';
import {
  Blog,
  BlogDocument,
} from '@app/src/endPointsEntities/blogs/blogs.mongo.scheme';
import { Post, PostDocument } from '@app/src/posts/posts.mongo.scheme';
import { Controller, Delete, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { Model } from 'mongoose';
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);

    try {
      await queryRunner.startTransaction();

      for (const table of tables) {
        await queryRunner.query(
          `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    res.sendStatus(204);
    return;
  }
}
//
