import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from './users.mongo.scheme';
import { UserDbType, userViewType, usersPaginationType } from './users.types';

@Injectable()
export class UsersMongoRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findUser(id: string): Promise<UserDbType | null> {
    return this.usersRepository.findOneBy({ id: id });
  }

  async returnUsersWithPagination(query: any): Promise<usersPaginationType> {
    const pageSize = Number(query.pageSize) || 10;
    const page = Number(query.pageNumber) || 1;
    const sortBy: string = query.sortBy || 'createdAt';
    const searchLoginTerm: string = query.searchLoginTerm || '';
    const searchEmailTerm: string = query.searchEmailTerm || '';
    let sortDirection = query.sortDirection || 'desc';
    if (sortDirection === 'desc') {
      sortDirection = -1;
    } else {
      sortDirection = 1;
    }
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (searchLoginTerm || searchEmailTerm) {
      queryBuilder.where(
        'user.login ILIKE :searchLoginTerm OR user.email ILIKE :searchEmailTerm',
        {
          searchLoginTerm: `%${searchLoginTerm}%`,
          searchEmailTerm: `%${searchEmailTerm}%`,
        },
      );
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, sortDirection)
      .addOrderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const users = await queryBuilder.getMany();
    const totalCount = await queryBuilder.getCount();

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
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :loginOrEmail', { loginOrEmail })
      .orWhere('user.login = :loginOrEmail', { loginOrEmail })
      .getOne();
    return user;
  }

  async createUser(newUser: UserDbType): Promise<userViewType> {
    const user = this.usersRepository.create(newUser);
    const result = await this.usersRepository.save(user);
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
    const result = await this.usersRepository.update(
      { accountData: { email } },
      { accountData: { recoveryCode } },
    );
    return result.affected == 1;
  }

  async updateUserSaltAndHash(
    recoveryCode: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const result = await await this.usersRepository.update(
      { accountData: { recoveryCode } },
      { accountData: { passwordSalt, passwordHash } },
    );
    return result.affected == 1;
  }

  async deleteUser(params: { id: string }): Promise<boolean> {
    const result = await this.usersRepository.delete({ id: params.id });
    return result.affected === 1;
  }

  async userEmailConfirmationAccept(confirmationCode: any): Promise<boolean> {
    const resultOfUpdate = await this.usersRepository
      .createQueryBuilder()
      .update(User)
      // @ts-expect-error TypeOrm не может определить точно ли вложенные свойства есть у сущности
      .set({ 'User.emailConfirmationData.isConfirmed': 'true' })
      .where('EmailConfirmationData.confirmationCode = :confirmationCode', {
        confirmationCode,
      })
      .execute();

    return resultOfUpdate.affected === 1; // Проверяем количество обновленных записей
  }
}
