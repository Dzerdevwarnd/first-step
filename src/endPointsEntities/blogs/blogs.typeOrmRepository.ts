import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsEntity } from './blogs.entity';
import { blogDBType, blogViewType, blogsPaginationType } from './blogs.types';

@Injectable()
export class BlogsTypeOrmRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    private readonly blogsRepository: Repository<BlogsEntity>,
  ) {}

  async findBlog(id: string): Promise<blogViewType | null> {
    const blogDB = await this.blogsRepository.findOneBy({ id: id });
    if (!blogDB) {
      return null;
    }
    const blogView = {
      //
      createdAt: blogDB.createdAt,
      description: blogDB.description,
      id: blogDB.id,
      isMembership: blogDB.isMembership,
      name: blogDB.name,
      websiteUrl: blogDB.websiteUrl,
    };
    return blogView;
  }

  async returnBlogsWithPagination(query: any): Promise<blogsPaginationType> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchNameTerm: string = query.searchNameTerm || '';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const queryBuilder = this.blogsRepository.createQueryBuilder('blog');

    if (searchNameTerm) {
      queryBuilder.where('blog.name ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      });
    }

    if (
      sortBy === 'name' ||
      sortBy === 'description' ||
      sortBy === 'websiteUrl'
    ) {
      queryBuilder.addOrderBy(`blog.${sortBy} COLLATE "C"`, sortDirection);
    } else {
      queryBuilder.addOrderBy(`blog.${sortBy}`, sortDirection);
    }

    queryBuilder
      .addOrderBy('blog.createdAt', sortDirection)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const blogs = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

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

  async createBlog(newBlog: blogDBType): Promise<blogViewType> {
    const blog = this.blogsRepository.create(newBlog);
    const result = await this.blogsRepository.save(blog);
    return blog;
  }

  async updateBlog(
    id: string,
    body: { name: string; description: string; websiteUrl: string },
  ): Promise<boolean> {
    //Пример сложного аптейта
    const resultOfUpdate = await this.blogsRepository
      .createQueryBuilder()
      .update(BlogsEntity)
      .set({
        name: body.name,
        description: body.description,
        websiteUrl: body.websiteUrl,
      })
      .where('id = :id', {
        id,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }

  async deleteBlog(params: { id: string }): Promise<boolean> {
    const result = await this.blogsRepository.delete({ id: params.id });
    return result.affected === 1;
  }
}
