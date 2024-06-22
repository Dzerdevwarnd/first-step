import { UsersService } from '@app/src/endPointsEntities/users/users.service';
import { UserDbType } from '@app/src/endPointsEntities/users/users.types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from '../test.utils';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Auth - /Auth (e2e)', () => {
  let startTestObject;
  let app: INestApplication;
  let moduleFixture;
  let userService: UsersService;
  let user3: UserDbType;

  let confirmationCode: string;

  const createUser1InputData = {
    login: 'warnd',
    password: '123321',
    email: 'dzerdevwarnd@gmail.com',
  };

  const user1ViewData = {
    id: expect.any(String),
    login: 'warnd',
    email: 'dzerdevwarnd@gmail.com',
    createdAt: expect.any(Date),
  };
  let createdUser1Id: string;

  const createUser2InputData = {
    login: 'dzerdev',
    password: 'qwerty',
    email: 'dzerdevwarnd1@gmail.com',
  };

  const user2ViewData = {
    id: expect.any(String),
    login: 'dzerdev',
    email: 'dzerdevwarnd1@gmail.com',
    createdAt: expect.any(Date),
  };
  let createdUser2Id: string;

  const registrationUser3InputData = {
    login: 'string',
    password: 'zk1O61ah-g',
    email: 'dzerdevwarnd2@gmail.com',
  };

  beforeAll(async () => {
    startTestObject = await getAppAndCleanDB();
    app = startTestObject.app;
    moduleFixture = startTestObject.moduleFixture;
    userService = moduleFixture.get(UsersService);
  });

  it('Should Create User1]', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createUser1InputData)
      .expect(201)
      .then(({ body }) => {
        body.createdAt = new Date(body.createdAt);
        expect(body).toEqual(user1ViewData);
        createdUser1Id = body.id;
      });
  });

  it('Should Create User2]', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createUser2InputData)
      .expect(201)
      .then(({ body }) => {
        body.createdAt = new Date(body.createdAt);
        expect(body).toEqual(user2ViewData);
        createdUser2Id = body.id;
      });
  });

  it('Should return status code 400 with incorrect data', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send({ login: '', password: '123321', email: 'dzerdevwarnd@gmail.com' })
      .expect(400);
  });

  it('Should login user and return status code 200 ]', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createUser1InputData.login,
        password: createUser1InputData.password,
      })
      .expect(200)
      .catch((error) => {
        console.error('Request failed:', error.message);
        throw error;
      });
  });

  it('should return error if passed wrong login or password; status 401 ]', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: 'a',
        password: createUser1InputData.password,
      })
      .expect(401);
  });

  it('should send email with new code if user exists but not confirmed yet; status 204 ]', () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send(registrationUser3InputData)
      .expect(204);
  });

  it(' should return error if email or login already exist; status 400; ]', () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send(registrationUser3InputData)
      .expect(400);
  });

  it(' should send email with new code if user exists but not confirmed yet; status 204 ]', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: registrationUser3InputData.email,
      })
      .expect(204);
    user3 = await userService.findUser(registrationUser3InputData.email);
    expect(user3).toBeDefined();
    expect(user3.accountData.email).toBe(registrationUser3InputData.email);
  });

  it(' should confirm registration by email; status 204;]', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: user3.emailConfirmationData.confirmationCode,
      })
      .expect(204);
  });

  it('should return error if code already confirmed; status 400;', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: user3.emailConfirmationData.confirmationCode,
      })
      .expect(400);

    it('should return error if email already confirmed; status 400;', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: registrationUser3InputData.email,
        })
        .expect(400);
    });
  });

  it('should sign in user; status 200; content: JWT token;', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: registrationUser3InputData.email,
        password: registrationUser3InputData.password,
      })
      .expect(200);
  });

  it('should return error if passed body is incorrect; status 400; ]', () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        email: '',
        login: '12345',
        password: 'string',
      })
      .expect(400);
  });

  it(' should return error if code doesnt exist; status 400;]', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '12345',
      })
      .expect(400);
  });

  it('should return error if user email doesnt exist; status 400;', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: '12345@gmail.com',
      })
      .expect(400);
  });
});
/////////
