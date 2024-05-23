import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserDbType, userViewType, usersPaginationType } from './users.types';

@Injectable()
export class UsersPgSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findUser(id: string): Promise<UserDbType | null> {
    const user = await this.dataSource.query(
      `SELECT "id", "email", "login", "createdAt"
		FROM public."Users" u
	WHERE u.id = $1`,
      [id],
    );
    return user[0] || undefined;
  }

  async returnUsersWithPagination(query: any): Promise<usersPaginationType> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchLoginTerm: string = query.searchLoginTerm || '%';
    const searchEmailTerm: string = query.searchEmailTerm || '%';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const users = await this.dataSource.query(
      `
      SELECT id,login,email,"createdAt" FROM "Users"
      WHERE login ILIKE $1 OR email ILIKE $2
      ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}
      OFFSET $3 LIMIT $4
  `,
      [
        `%${searchLoginTerm}%`,
        `%${searchEmailTerm}%`,
        (page - 1) * pageSize,
        pageSize,
      ],
    );
    const totalCountQuery = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM "Users"
    WHERE login ILIKE $1 OR email ILIKE $2
`,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`],
    );
    const totalCount = parseInt(totalCountQuery[0].count, 10);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const usersPagination = {
      pagesCount: pagesCount,
      page: Number(page),
      pageSize: pageSize,
      totalCount: totalCount,
      items: users,
    };
    return usersPagination;
  }

  async findDBUser(loginOrEmail: string): Promise<UserDbType | undefined> {
    const user = await this.dataSource.query(
      `
    SELECT * FROM "Users"
    WHERE email = $1 OR login = $1
    LIMIT 1
`,
      [loginOrEmail],
    );
    return user[0] || undefined;
  }

  async createUser(newUser: UserDbType): Promise<userViewType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO "Users" ("id", "login", "email", "createdAt", "passwordSalt", "passwordHash", "confirmationCode", "expirationDate", "isConfirmed")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`,
      [
        newUser.id,
        newUser.accountData.login,
        newUser.accountData.email,
        newUser.accountData.createdAt.toISOString(),
        newUser.accountData.passwordSalt,
        newUser.accountData.passwordHash,
        newUser.emailConfirmationData.confirmationCode,
        newUser.emailConfirmationData.expirationDate,
        newUser.emailConfirmationData.isConfirmed,
      ],
    );

    const userView = {
      id: newUser.id,
      login: newUser.accountData.login,
      email: newUser.accountData.email,
      createdAt: newUser.accountData.createdAt,
    };
    return userView;
  }

  async updateRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE "Users"
    SET recoveryCode = $1
    WHERE email = $2
  `,
      [recoveryCode, email],
    );
    return result.rowCount == 1;
  }

  async updateUserSaltAndHash(
    recoveryCode: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const result = await this.dataSource.query(
      `
    UPDATE "Users"
    SET "passwordSalt" = $1, "passwordHash" = $2
    WHERE "recoveryCode" = $3
  `,
      [passwordSalt, passwordHash, recoveryCode],
    );
    return result.rowCount == 1;
  }
  async deleteUser(params: { id: string }): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM "Users"
    WHERE id = $1
  `,
      [params.id],
    );
    return result[1] === 1;
  }

  async userEmailConfirmationAccept(confirmationCode: any): Promise<boolean> {
    const resultOfUpdate = await this.dataSource.query(
      `
    UPDATE "Users"
    SET "isConfirmed" = true
    WHERE "confirmationCode" = $1
  `,
      [confirmationCode],
    );
    return resultOfUpdate[1] === 1;
  }

  async userConfirmationCodeUpdate(email: string) {
    const confirmationCode = await uuidv4();
    const resultOfUpdate = await this.dataSource.query(
      `
    UPDATE "Users"
    SET "confirmationCode" = $1
    WHERE email = $2
  `,
      [confirmationCode, email],
    );
    if (resultOfUpdate.rowCount === 1) {
      return confirmationCode;
    } else {
      return;
    }
  }
  async findDBUserByConfirmationCode(confirmationCode: any) {
    const user = await this.dataSource.query(
      `
    SELECT * FROM "Users"
    WHERE "confirmationCode" = $1
    LIMIT 1
`,
      [confirmationCode],
    );
    return user[0] || undefined;
  }
}
//
