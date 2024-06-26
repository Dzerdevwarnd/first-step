/*import { Injectable } from '@nestjs/common';
import { PostsMongoRepository } from '@app/src/posts/posts.repository';
import { postsByBlogIdPaginationType } from '@app/src/posts/posts.types';
import { BlogsRepository } from './blogs.repository';
import { blogDBType, blogViewType, blogsPaginationType } from './blogs.types';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsMongoRepository,
  ) {}
  async returnBlogsWithPagination(query: any): Promise<blogsPaginationType> {
    return this.blogsRepository.returnBlogsWithPagination(query);
  }
  async findBlog(params: { id: string }): Promise<blogViewType | undefined> {
    return await this.blogsRepository.findBlog(params);
  }
  async findPostsByBlogId(
    params: {
      id: string;
    },
    query: any,
    userId: string,
  ): Promise<postsByBlogIdPaginationType | undefined> {
    return await this.postsRepository.findPostsByBlogId(params, query, userId);
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
    const newBlogWithout_id = this.blogsRepository.createBlog(newBlog);
    return newBlogWithout_id;
  }
  async updateBlog(
    id: string,
    body: { name: string; description: string; websiteUrl: string },
  ): Promise<boolean> {
    const resultBoolean = this.blogsRepository.updateBlog(id, body);
    return resultBoolean;
  }
  async deleteBlog(params: { id: string }): Promise<boolean> {
    const resultBoolean = await this.blogsRepository.deleteBlog(params);
    return resultBoolean;
  }
}
*/
