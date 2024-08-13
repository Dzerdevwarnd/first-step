import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from '../test.utils';

describe('Quiz Questions (e2e)', () => {
  let startTestObject;
  let app: INestApplication;

  beforeAll(async () => {
    startTestObject = await getAppAndCleanDB();
    app = startTestObject.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/hometask_25/api/sa/quiz/questions (GET) should return quiz questions with pagination and filtering', async () => {
    const response = await request(app.getHttpServer())
      .get('/hometask_25/api/sa/quiz/questions')
      .auth('admin', 'qwerty')
      .query({
        bodySearchTerm: 'example',
        publishedStatus: 'published',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      })
      .expect(200);

    expect(response.body).toHaveProperty('pagesCount');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
  });

  it('/hometask_25/api/sa/quiz/questions (GET) should return unauthorized when no token provided', async () => {
    await request(app.getHttpServer())
      .get('/hometask_25/api/sa/quiz/questions')
      .expect(401);
  });
});
