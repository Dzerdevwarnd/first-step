import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Blog,
  BlogDocument,
  blogDBType,
  blogViewType,
  blogsPaginationType,
} from './blogs.scheme.types';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsReposittory: PostsRepository,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}
  async returnAllBlogs(query: any): Promise<blogsPaginationType> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchNameTerm: string = query.searchNameTerm || '';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const blogs = await this.blogModel
      .find(
        { name: { $regex: searchNameTerm, $options: 'i' } },
        { projection: { _id: 0 } },
      )
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .lean();
    const totalCount = await this.blogModel.countDocuments({
      name: { $regex: searchNameTerm, $options: 'i' },
    });
    const pagesCount = Math.ceil(totalCount / pageSize);
    const blogsPagination = {
      pagesCount: pagesCount,
      page: Number(page),
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
    return blogsPagination;
  }
  async findBlog(params: { id: string }): Promise<blogViewType | undefined> {
    const blog: Blog | null = await this.blogModel.findOne({
      id: params.id,
    });
    if (!blog) {
      return;
    }
    const blogView = {
      createdAt: blog.createdAt,
      description: blog.description,
      id: blog.id,
      isMembership: blog.isMembership,
      name: blog.name,
      websiteUrl: blog.websiteUrl,
    };
    return blogView;
  }
  async findPostsByBlogId(
    params: {
      id: string;
    },
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType | undefined> {
    return this.postsRepository.findPostsByBlogId(params, query, userId);
  }
  async createBlog(body: {
    name: string;
    description: string;
    websiteUrl: string;
  }): Promise<blogViewType> {
    const createdDate = new Date();
    const newBlog: blogDBType = {
      id: String(Date.now()),
      name: body.name,
      description: body.description,
      websiteUrl: body.websiteUrl,
      createdAt: createdDate,
      isMembership: false,
    };
    await this.blogModel.insertMany(newBlog);
    const { _id, ...blogWithout_Id } = newBlog;
    return blogWithout_Id;
  }
  async updateBlog(
    id: string,
    body: { name: string; description: string; websiteUrl: string },
  ): Promise<boolean> {
    const result = await this.blogModel.updateOne(
      { id: id },
      {
        $set: {
          name: body.name,
          description: body.description,
          websiteUrl: body.websiteUrl,
        },
      },
    );
    return result.matchedCount === 1;
  }
  async deleteBlog(params: { id: string }): Promise<boolean> {
    const result = await this.blogModel.deleteOne({ id: params.id });
    return result.deletedCount === 1;
  }
}
