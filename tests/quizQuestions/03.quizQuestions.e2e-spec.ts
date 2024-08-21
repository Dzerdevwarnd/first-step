import { Question } from '@app/src/features/QuizQuestions/Questions.entity';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from '../utils/test.utils';

describe('Quiz Questions (e2e)', () => {
  let startTestObject;
  let app: INestApplication;

  const createQuestionDto = {
    body: 'This is a sample question',
    correctAnswers: ['Sample answer 1', 'Sample answer 2'],
  };

  let question: Question;

  beforeAll(async () => {
    startTestObject = await getAppAndCleanDB();
    app = startTestObject.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/sa/quiz/questions (POST) should create a new quiz question', async () => {
    const response = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty') // Используйте аутентификацию, если она нужна
      .send(createQuestionDto);
    expect(response).toBeOk(201);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('body', createQuestionDto.body);
    expect(response.body).toHaveProperty('correctAnswers');
    expect(response.body.correctAnswers).toEqual(
      createQuestionDto.correctAnswers,
    );
    expect(response.body).toHaveProperty('published', false);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
  });

  it('/sa/quiz/questions (POST) should return 400 if input is invalid', async () => {
    const invalidCreateQuestionDto = {
      body: '', // Некорректный параметр
      correctAnswers: [],
    };

    const response = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .auth('admin', 'qwerty') // Используйте аутентификацию, если она нужна
      .send(invalidCreateQuestionDto);

    expect(response).toBeNotOk(400);
    expect(response.body).toHaveProperty('errorsMessages');
    expect(response.body.errorsMessages[0]).toHaveProperty('message');
    expect(response.body.errorsMessages[0]).toHaveProperty('field');
  });

  it('/sa/quiz/questions (POST) should return 401 if unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .post('/sa/quiz/questions')
      .send(createQuestionDto);

    expect(response).toBeNotOk(401);
  });

  it('/sa/quiz/questions (GET) should return quiz questions with pagination and filtering', async () => {
    const response = await request(app.getHttpServer())
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty')
      .query({
        bodySearchTerm: 'sample',
        publishedStatus: 'notPublished',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      });

    await expect(response).toBeOk(200);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('pagesCount');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items[0]).toEqual({
      //
      id: expect.any(Number),
      body: 'This is a sample question',
      correctAnswers: ['Sample answer 1', 'Sample answer 2'],
      published: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String), //
    });
    question = response.body.items[0];
    console.log(question);
  });

  it('/sa/quiz/questions (GET) should return unauthorized when no token provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/sa/quiz/questions')
      .expect(401);
    await expect(response).toBeNotOk(401);
  });

  it('/sa/quiz/questions/{id} (Delete) should delete question by id', async () => {
    console.log(question);
    const response = await request(app.getHttpServer())
      .delete(`/sa/quiz/questions/${question.id}`)
      .auth('admin', 'qwerty');
    await expect(response).toBeOk(204);
  });

  it('/sa/quiz/questions/{id} (Delete) should dont find question for delete', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/sa/quiz/questions/${question.id}`,
    );
    await expect(response).toBeNotOk(404);
  });
});
///
