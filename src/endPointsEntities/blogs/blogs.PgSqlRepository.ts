import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { blogDBType, blogViewType, blogsPaginationType } from './blogs.types';

@Injectable()
export class BlogsPgSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
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
    const blogs = await this.dataSource.query(
      `
      SELECT id,name,description,"websiteUrl","createdAt","isMembership" FROM "Blogs"
      WHERE name ILIKE $1
      ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
      OFFSET $2 LIMIT $3
  `,
      [`%${searchNameTerm}%`, (page - 1) * pageSize, pageSize],
    );
    const totalCountQuery = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM "Blogs"
    WHERE name ILIKE $1 
`,
      [`%${searchNameTerm}%`],
    );
    const totalCount = parseInt(totalCountQuery[0].count, 10);
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
  async findBlog(params: { id: string }): Promise<blogViewType | null> {
    const blog = await this.dataSource.query(
      `
      SELECT id,name,description,"websiteUrl","createdAt","isMembership" FROM "Blogs"
      WHERE id ILIKE $1
  `,
      [params.id],
    );
    return blog[0] || undefined;
  }

  async createBlog(newBlog: blogDBType): Promise<blogDBType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO "Blogs" (id,name,description,"websiteUrl","createdAt","isMembership")
    VALUES ($1, $2, $3, $4, $5, $6)
`,
      [
        newBlog.id,
        newBlog.name,
        newBlog.description,
        newBlog.websiteUrl,
        newBlog.createdAt.toISOString(),
        newBlog.isMembership,
      ],
    );
    const blogView = {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      createdAt: newBlog.createdAt,
      websiteUrl: newBlog.websiteUrl,
      isMembership: newBlog.isMembership,
    };
    return blogView;
  }
  async updateBlog(
    id: string,
    body: { name: string; description: string; websiteUrl: string },
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
			UPDATE "Blogs"
			SET "name" = $2,
					"description" = $3,
					"websiteUrl" = $4
			WHERE "id" = $1
			RETURNING *
			`,
      [id, body.name, body.description, body.websiteUrl],
    );
    return result[0] === 1;
  }
  async deleteBlog(params: { id: string }): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "Blogs"
    WHERE id = $1
  `,
      [params.id],
    );
    return result[1] === 1;
  }
}
//
