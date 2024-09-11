import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from './users.entity';
import { UserDbType, userViewType, usersPaginationType } from './users.types';

@Injectable()
export class UsersTypeOrmRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
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
      sortDirection = 'DESC';
    } else {
      sortDirection = 'ASC';
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

    if (sortBy === 'login' || sortBy === 'email') {
      queryBuilder.addOrderBy(`user.${sortBy} COLLATE "C"`, sortDirection);
    } else {
      queryBuilder.addOrderBy(`user.${sortBy}`, sortDirection);
    }

    queryBuilder
      .addOrderBy('user.createdAt', sortDirection)
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
    const user = await this.usersRepository.findOne({
      where: { accountData: { email: email } },
    });

    if (!user) {
      return false;
    }

    user.accountData.recoveryCode = recoveryCode;

    await this.usersRepository.save(user);

    return true;
  }

  async updateUserSaltAndHash(
    recoveryCode: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { accountData: { recoveryCode: recoveryCode } },
    });

    if (!user) {
      return false;
    }

    user.accountData.passwordSalt = passwordSalt;
    user.accountData.passwordHash = passwordHash;

    await this.usersRepository.save(user);

    return true;
  }

  async deleteUser(params: { id: string }): Promise<boolean> {
    const result = await this.usersRepository.delete({ id: params.id });
    return result.affected === 1;
  }

  async userEmailConfirmationAccept(confirmationCode: any): Promise<boolean> {
    //Пример сложного аптейта
    const resultOfUpdate = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({ emailConfirmationData: { isConfirmed: true } })
      .where('emailConfirmationData.confirmationCode = :confirmationCode', {
        confirmationCode,
      })
      .execute();

    return resultOfUpdate.affected === 1;
  }
  async userConfirmationCodeUpdate(email: string) {
    const confirmationCode = await uuidv4();
    const resultOfUpdate = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({ emailConfirmationData: { confirmationCode: confirmationCode } })
      .where('accountData.email = :email', { email })
      .execute();

    if (resultOfUpdate.affected === 1) {
      return confirmationCode;
    } else {
      return undefined;
    }
  }

  async updateUserQuizGameCurrentId(
    userId: string,
    currentGameId: string | null,
  ): Promise<boolean> {
    const updateResult = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({ quizGameDate: { currentGameId: currentGameId } })
      .where({ id: userId })
      .execute();
    return updateResult.affected === 1;
  }

  async updateUserQuizGameScore(
    userId: string,
    totalScore: number,
  ): Promise<boolean> {
    const updateResult = await this.usersRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set({ quizGameDate: { score: totalScore } })
      .where({ id: userId })
      .execute();
    return updateResult.affected === 1;
  }

  async findDBUserByConfirmationCode(confirmationCode: any) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where(
        'user.emailConfirmationData.confirmationCode = :confirmationCode',
        { confirmationCode },
      )
      .getOne();
    return user;
  }
}
