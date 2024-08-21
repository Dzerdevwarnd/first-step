import { CreateUserInputModelType } from '@app/src/features/users/users.types';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export class UsersTestManager {
  constructor(protected readonly app: INestApplication) {}
  expectCorrectModel(createModel: any, responseModel: any) {
    expect(createModel.name).toBe(responseModel.name);
    expect(createModel.email).toBe(responseModel.email);
    expect(createModel.lastName).toBe(responseModel.lastName);
  }

  async createUser(
    adminAccessToken: string,
    createModel: CreateUserInputModelType,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(CreateUserInputModelType)
      .expect(201);
  }

  async loginAndReturnAccessAndRefreshTokens(
    login: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login,
        password: password,
      })
      .expect(200);
    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0],
    };
  }
}
