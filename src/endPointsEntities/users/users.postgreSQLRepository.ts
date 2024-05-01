import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserDbType, userViewType, usersPaginationType } from './users.types';

@Injectable()
export class UsersPgSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findUser(id: string): Promise<UserDbType | null> {
    const user = await this.dataSource.query(
      `SELECT id, email, login, "createdAt"
		FROM public."Users" u
	WHERE u.id = $1`,
      [id],
    );
    return user;
  }

  async returnUsersWithPagination(query: any): Promise<usersPaginationType> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchLoginTerm: string = query.searchLoginTerm || '';
    const searchEmailTerm: string = query.searchEmailTerm || '';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
    }
    const users = await this.dataSource.query(
      `
      SELECT * FROM users
      WHERE login ILIKE $1 OR email ILIKE $2
      ORDER BY $3  $4
      OFFSET $5 LIMIT $6
  `,
      [
        searchLoginTerm,
        searchEmailTerm,
        sortBy,
        sortDirection,
        (page - 1) * pageSize,
        pageSize,
      ],
    );
    const totalCount = await this.dataSource.query(
      `
    SELECT COUNT(*) FROM users
    WHERE accountData.login ILIKE $1 OR accountData.email ILIKE $2
`,
      [searchLoginTerm, searchEmailTerm],
    );
    const pagesCount = Math.ceil(totalCount / pageSize);
    const usersView = users.map(({ id, accountData }) => ({
      id,
      login: accountData.login,
      email: accountData.email,
      createdAt: accountData.createdAt,
    }));
    const usersPagination = {
      pagesCount: pagesCount,
      page: Number(page),
      pageSize: pageSize,
      totalCount: totalCount,
      items: usersView,
    };
    return usersPagination;
  }

  async findDBUser(loginOrEmail: string): Promise<UserDbType | undefined> {
    const user = await this.dataSource.query(
      `
    SELECT * FROM users
    WHERE accountData.email = $1 OR accountData.login = $1
    LIMIT 1
`,
      [loginOrEmail],
    );
    return user;
  }

  async createUser(newUser: UserDbType): Promise<userViewType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO users (id, login, email, createdAt, passwordSalt, passwordHash, confirmationCode, expirationDate, isConfirmed)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`,
      [
        newUser.id,
        newUser.accountData.login,
        newUser.accountData.email,
        newUser.accountData.createdAt,
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
    UPDATE users
    SET accountData.recoveryCode = $1
    WHERE accountData.email = $2
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
    UPDATE users
    SET passwordSalt = $1, passwordHash = $2
    WHERE recoveryCode = $3
  `,
      [passwordSalt, passwordHash, recoveryCode],
    );
    return result.rowCount == 1;
  }
  async deleteUser(params: { id: string }): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM users
    WHERE id = $1
  `,
      [params.id],
    );
    return result.rowCount === 1;
  }
  async userEmailConfirmationAccept(confirmationCode: any): Promise<boolean> {
    const resultOfUpdate = await this.userModel.updateOne(
      { 'emailConfirmationData.confirmationCode': confirmationCode },
      { $set: { 'emailConfirmationData.isConfirmed': true } },
    );
    return resultOfUpdate.modifiedCount === 1;
  }

  async userConfirmationCodeUpdate(email: string) {
    const confirmationCode = await uuidv4();
    const resultOfUpdate = await this.userModel.updateOne(
      { 'accountData.email': email },
      { $set: { 'emailConfirmationData.confirmationCode': confirmationCode } },
    );
    if (resultOfUpdate.matchedCount === 1) {
      return confirmationCode;
    } else {
      return;
    }
  }
  async findDBUserByConfirmationCode(confirmationCode: any) {
    const user = await this.userModel.findOne({
      'emailConfirmationData.confirmationCode': confirmationCode,
    });
    return user;
  }
}
