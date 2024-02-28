import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  UserDbType,
  UserDocument,
  userViewType,
  usersPaginationType,
} from './users.scheme.types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findUser(id: string): Promise<UserDbType | null> {
    const user = await this.userModel.findOne({ id: id });
    return user;
  }

  async returnAllUsers(query: any): Promise<usersPaginationType> {
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
    const users = await this.userModel
      .find({
        $or: [
          { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
          { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
        ],
      })
      .skip((page - 1) * pageSize)
      .sort({ [sortBy]: sortDirection })
      .limit(pageSize)
      .lean();
    const totalCount = await this.userModel.countDocuments({
      $or: [
        { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },
        { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } },
      ],
    });
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
    const user = await this.userModel.findOne({
      $or: [
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
      ],
    });
    return user;
  }

  async createUser(newUser: UserDbType): Promise<userViewType> {
    const result = await this.userModel.insertMany(newUser);
    const userView = {
      id: newUser.id,
      login: newUser.accountData.login,
      email: newUser.accountData.login,
      createdAt: newUser.accountData.createdAt,
    };
    return userView;
  }

  async updateRecoveryCode(
    email: string,
    recoveryCode: string,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { 'accountData.email': email },
      {
        $set: {
          'accountData.recoveryCode': recoveryCode,
        },
      },
    );
    return result.matchedCount == 1;
  }

  async updateUserSaltAndHash(
    recoveryCode: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const result = await this.userModel.updateOne(
      { 'accountData.recoveryCode': recoveryCode },
      {
        $set: {
          'accountData.passwordSalt': passwordSalt,
          'accountData.passwordHash': passwordHash,
        },
      },
    );
    return result.matchedCount == 1;
  }
  async deleteUser(params: { id: string }): Promise<boolean> {
    const result = await this.userModel.deleteOne({ id: params.id });
    return result.deletedCount === 1;
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
//
