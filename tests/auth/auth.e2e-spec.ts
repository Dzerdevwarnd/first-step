import { UsersService } from '@app/endPointsEntities/users/users.service';
import { UserDbType } from '@app/endPointsEntities/users/users.types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from '../test.utils';

describe('Users - /users (e2e)', () => {
  let startTestObject;
  let app: INestApplication;
  let moduleFixture;
  let userService: UsersService;
  let user3:UserDbType

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

  const createUser3RegistrationData = {
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
      .expect(200);
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
      .send(createUser3RegistrationData)
      .expect(204);
  });

  it(' should return error if email or login already exist; status 400; ]', () => {
    return request(app.getHttpServer())
      .post('/auth/registration')
      .send(createUser3RegistrationData)
      .expect(400);
  });

  it(' should send email with new code if user exists but not confirmed yet; status 204 ]',async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: createUser3RegistrationData.email,
      })
      .expect(204);  
      const user3 = await userService.findUser(createUser3RegistrationData.email);
      expect(user3).toBeDefined();
      expect(user3.accountData.email).toBe(createUser3RegistrationData.email);
      });
  });
  //
  it('Should return 2 users with pagination', () => {
    return request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin', 'qwerty')
      .expect(200)
      .then(({ body }) => {
        body.items[0].createdAt = new Date(body.createdAt);
        body.items[1].createdAt = new Date(body.createdAt);
        expect(body).toEqual({
          pagesCount: 1,
          page: 1,
          pageSize: 10,
          totalCount: 2,
          items: [user2ViewData, user1ViewData],
        });
      });
  });

  /*   it('Should return status code 401 with incorrect login ', () => {
    return request(app.getHttpServer())
      .get('/sa/users')
      .auth('admin1', 'qwerty')
      .send(createUser1InputData)
      .expect(401);
  }); */
  it('Delete one by Id', () => {
    return request(app.getHttpServer())
      .delete(`/sa/users/${createdUser1Id}`)
      .auth('admin', 'qwerty')
      .expect(204);
  });
  it('Should return status code 401 with incorrect login ', () => {
    return request(app.getHttpServer())
      .delete(`/sa/users/${createdUser2Id}`)
      .auth('admin1', 'qwerty')
      .send(createUser1InputData)
      .expect(401);
  });

  it('Should return status code 404,trying find deleted user', () => {
    return request(app.getHttpServer())
      .get(`/sa/users/${createdUser1Id}`)
      .auth('admin', 'qwerty')
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
