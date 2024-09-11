import { Question } from '@app/src/features/QuizQuestions/Questions.entity';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from '../utils/test.utils';

describe('Quiz Questions (e2e)', () => {
  let startTestObject;
  let app: INestApplication;

  const createQuestionDto = {
    body: 'ThisIsaSampleQuestion',
    correctAnswers: ['SampleAnswer1', 'SampleAnswer2'],
  };
  const updateQuestionDto = {
    body: 'ThisIsaSampleQuestionUPDATE',
    correctAnswers: ['SampleAnswer1UPDATE', 'SampleAnswer2UPDATE'],
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
    expect(response.body).toEqual({
      id: expect.any(Number),
      body: createQuestionDto.body,
      correctAnswers: createQuestionDto.correctAnswers,
      published: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
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
        bodySearchTerm: createQuestionDto.body,
        publishedStatus: 'notPublished',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      });

    await expect(response).toBeOk(200); ///

    expect(response.body.items[0]).toEqual({
      id: expect.any(Number),
      body: createQuestionDto.body,
      correctAnswers: createQuestionDto.correctAnswers,
      published: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    question = response.body.items[0];
  });

  it('/sa/quiz/questions (GET) should return unauthorized when no token provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/sa/quiz/questions')
      .expect(401);
    await expect(response).toBeNotOk(401);
  });

  it('/sa/quiz/questions/{id} (Put) should return 204 , should update question', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}`)
      .auth('admin', 'qwerty')
      .send(updateQuestionDto);
    await expect(response).toBeOk(204);
  });

  it('/sa/quiz/questions/{id} (Put) should return 400 , incorrect input data', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}`)
      .auth('admin', 'qwerty')
      .send({
        body: '',
        correctAnswers: ['Sample answer 1', 'Sample answer 2'],
      });
    await expect(response).toBeNotOk(400);
  });

  it('/sa/quiz/questions/{id} (Put) should return 404 , Not found question', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/5`)
      .auth('admin', 'qwerty')
      .send(updateQuestionDto);
    await expect(response).toBeNotOk(404);
  });

  it('/sa/quiz/questions/{id} (Put) should return 401 , Unauthorized user', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}`)
      .send(updateQuestionDto);
    await expect(response).toBeNotOk(401);
  });
  //
  it('/sa/quiz/questions (GET) should return quiz questions with pagination and filtering with UPDATE Data ', async () => {
    const response = await request(app.getHttpServer())
      .get('/sa/quiz/questions')
      .auth('admin', 'qwerty');

    await expect(response).toBeOk(200);

    expect(response.body.items[0]).toEqual({
      //
      id: expect.any(Number),
      body: updateQuestionDto.body,
      correctAnswers: updateQuestionDto.correctAnswers,
      published: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String), ///
    });
    question = response.body.items[0];
  });

  it('/sa/quiz/questions/{id}/publish (Put) should return 204 , should update question publish status', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}/publish`)
      .auth('admin', 'qwerty')
      .send({ published: true });
    await expect(response).toBeOk(204);
  });
  //
  it('/sa/quiz/questions/{id}/publish (Put) should return 400 , incorrect input data', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}/publish`)
      .auth('admin', 'qwerty')
      .send({ published: 'notBoolean' });
    await expect(response).toBeNotOk(400);
  });

  it('/sa/quiz/questions/{id}/publish (Put) should return 401 , Unauthorized user', async () => {
    const response = await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}/publish`)
      .send(updateQuestionDto);
    await expect(response).toBeNotOk(401);
  });

  it('/sa/quiz/questions/{id} (Delete) should return 401 if unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/sa/quiz/questions/${question.id}`)
      .auth('admin1', 'qwerty');
    await expect(response).toBeNotOk(401);
  });

  it('/sa/quiz/questions/{id} (Delete) should delete question by id', async () => {
    console.log(question);
    const response = await request(app.getHttpServer())
      .delete(`/sa/quiz/questions/${question.id}`)
      .auth('admin', 'qwerty');
    await expect(response).toBeOk(204);
  });

  it('/sa/quiz/questions/{id} (Delete) should return 404 dont find question for delete', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/sa/quiz/questions/${question.id}`)
      .auth('admin', 'qwerty');
    await expect(response).toBeNotOk(404);
  });
});
////w
