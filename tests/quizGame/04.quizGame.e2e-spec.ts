import { QuizGame } from '@app/src/features/QuizGame/QuizGame.entity';
import { Question } from '@app/src/features/QuizQuestions/Questions.entity';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getAppAndCleanDB } from '../utils/test.utils';
import {
  answerData,
  answerDto,
  createQuestionArrayDto,
  createUser1InputData,
  createUser2InputData,
  createUser3InputData,
  gameAfterUser1CreatedGame,
  gameAfterUser2ConnectedGame,
  user1ViewData,
  user2ViewData,
  user3ViewData,
} from './quizGame.testData';

describe('Quiz Game (e2e)', () => {
  let user1AccessToken: string;
  let user1RefreshToken: string;
  let user2AccessToken: string;
  let user2RefreshToken: string;
  let user3AccessToken: string;
  let user3RefreshToken: string;
  let game1Data: QuizGame;
  let game2Data: QuizGame;
  let game1Id: string;
  let game2Id: string;

  let startTestObject;
  let app: INestApplication;

  let question: Question;

  beforeAll(async () => {
    startTestObject = await getAppAndCleanDB();
    app = startTestObject.app;
  });

  afterAll(async () => {
    await app.close();
  });
  // Создание и логирование двух пользователей, а также сохранение их access и refresh токенов
  it('/sa/users (POST) Should Create User1]', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createUser1InputData)
      .expect(201)
      .then(({ body }) => {
        body.createdAt = new Date(body.createdAt);
        expect(body).toEqual(user1ViewData);
      });
  });

  it('/sa/users (POST) Should Create User2]', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createUser2InputData)
      .expect(201)
      .then(({ body }) => {
        body.createdAt = new Date(body.createdAt);
        expect(body).toEqual(user2ViewData);
      });
  });

  it('/sa/users (POST) Should Create User3]', () => {
    return request(app.getHttpServer())
      .post('/sa/users')
      .auth('admin', 'qwerty')
      .send(createUser3InputData)
      .expect(201)
      .then(({ body }) => {
        body.createdAt = new Date(body.createdAt);
        expect(body).toEqual(user3ViewData);
      });
  });

  it('/auth/login (POST) Should login user1 and return status code 200 ]', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createUser1InputData.login,
        password: createUser1InputData.password,
      })
      .expect(200);
    user1AccessToken = response.body.accessToken;
    user1RefreshToken = response.headers['set-cookie'][0];
  });

  it('/auth/login (POST) Should login user2 and return status code 200 ]', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createUser2InputData.login,
        password: createUser2InputData.password,
      })
      .expect(200);
    user2AccessToken = response.body.accessToken;
    user2RefreshToken = response.headers['set-cookie'][0];
  });

  it('/auth/login (POST) Should login user3 and return status code 200 ]', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createUser3InputData.login,
        password: createUser3InputData.password,
      })
      .expect(200);
    user3AccessToken = response.body.accessToken;
    user3RefreshToken = response.headers['set-cookie'][0];
  });

  //// Добавление 5 вопросов в пул вопросов
  it('/sa/quiz/questions (POST) should create multiple quiz questions', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer())
        .post('/sa/quiz/questions')
        .auth('admin', 'qwerty')
        .send(createQuestionArrayDto[i]);

      if (i === 0) {
        // Выполняем проверку только для первого запроса
        expect(response).toBeOk(201);
        expect(response.body).toEqual({
          id: expect.any(String),
          body: createQuestionArrayDto[i].body,
          correctAnswers: createQuestionArrayDto[i].correctAnswers,
          published: false,
          createdAt: expect.any(String),
          updatedAt: null,
        });
      } else {
        // Для остальных запросов проверяем только статус 201
        expect(response).toBeOk(201);
      }
    }
  });
  //Проверка my-current когда нет активной игры
  it('/pair-game-quiz/pairs/my-current (Get) should return 200 and current game of player', async () => {
    const response = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeNotOk(404);
  });

  //Проверка my-current answer когда нет активной игры

  it('/pair-game-quiz/pairs/my-current/answers (Post) should return 200 and answer info', async () => {
    const response = await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set('Authorization', `Bearer ${user2AccessToken}`)
      .send(answerDto);

    expect(response).toBeOk(403);
  });

  //////// Проверка  создания игры

  it('/pair-game-quiz/pairs/connection (POST) should create game, connect to game, and return game', async () => {
    const response = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${user1AccessToken}`);

    expect(response).toBeOk(200);
    expect(response.body).toEqual(gameAfterUser1CreatedGame);
    game1Id = response.body.id;
  });

  //Проверка нахождения игры по id, в которой не состоит игрок
  it('/pair-game-quiz/pairs/{id} (Get) should return 403, If current user tries to get pair in which user is not participant', async () => {
    const response = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game1Id}`)
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeOk(403);
  });

  //Проврека подключения к созднанной игре
  it('/pair-game-quiz/pairs/connection (POST) return 401,cause no auth token', async () => {
    const response = await request(app.getHttpServer()).post(
      '/pair-game-quiz/pairs/connection',
    );

    expect(response).toBeNotOk(401);
  });

  it('/pair-game-quiz/pairs/connection (POST) return 403,cause player already in game', async () => {
    const response = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${user1AccessToken}`);

    expect(response).toBeNotOk(403);
  });

  it('/pair-game-quiz/pairs/connection (POST) should  connect to created game, and return game', async () => {
    const response = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeOk(200);
    expect(response.body).toEqual(gameAfterUser2ConnectedGame);
  });

  // my-current проверки
  it('/pair-game-quiz/pairs/my-current (Get) should return 200 and current game of player', async () => {
    const response = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeOk(200);
    expect(response.body).toEqual(gameAfterUser2ConnectedGame);
  });

  it('/pair-game-quiz/pairs/my-current (Get) should return 401 if no Authorization', async () => {
    const response = await request(app.getHttpServer()).get(
      '/pair-game-quiz/pairs/my-current',
    );
    expect(response).toBeNotOk(401);
  });

  //проверки get по id игры
  it('/pair-game-quiz/pairs/{id} (Get) should return 200 and player game by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game1Id}`)
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeOk(200);
    expect(response.body).toEqual(gameAfterUser2ConnectedGame);
  });

  /* Валидация params:id???
  it('/pair-game-quiz/pairs/{id} (Get) should return 401, if id has invalid format', async () => {
    const response = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/12345`)
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeOk(401);
  }); */

  it('/pair-game-quiz/pairs/{id} (Get) should return 401, if unauthorized', async () => {
    const response = await request(app.getHttpServer()).get(
      `/pair-game-quiz/pairs/${game1Id}`,
    );

    expect(response).toBeOk(401);
  });

  it('/pair-game-quiz/pairs/{id} (Get) should return 404, if Not found', async () => {
    const response = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/string`)
      .set('Authorization', `Bearer ${user2AccessToken}`);

    expect(response).toBeOk(404);
  });

  it('/pair-game-quiz/pairs/my-current/answers (Post) should return 401, if unauthorized', async () => {
    const response = await request(app.getHttpServer())
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .send(answerDto);

    expect(response).toBeNotOk(401);
  }); //

  // проверка my-current answers,
  it('/pair-game-quiz/pairs/my-current/answers (POST) should create multiple quiz answers', async () => {
    for (let i = 0; i < 6; i++) {
      const response = await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(answerDto);

      if (i === 0) {
        // Выполняем проверку только для первого запроса
        expect(response).toBeOk(200);
        expect(response.body).toEqual(answerData);
      } else if (i === 5) {
        expect(response).toBeNotOk(403);
      } else {
        // Для остальных запросов проверяем только статус 201
        expect(response).toBeOk(200);
      }
    }
  });

  it('/pair-game-quiz/pairs/my-current/answers (POST) should create multiple quiz answers', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await request(app.getHttpServer())
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(answerDto);

      if (i === 0) {
        // Выполняем проверку только для первого запроса
        expect(response).toBeOk(200);
        expect(response.body).toEqual(answerData);
      } else {
        // Для остальных запросов проверяем только статус 201
        expect(response).toBeOk(200);
      }
    }
  });

  //Проверка, что у пользователя больше нет активной игры
  it('/pair-game-quiz/pairs/my-current (Get) should return 404, if player dont have active pair', async () => {
    const response = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${user1AccessToken}`);

    expect(response).toBeNotOk(404);
  });

  //Создание и подключение второй игры для пользователей 1 и 3

  it('/pair-game-quiz/pairs/connection (POST) should create game, connect to game, and return game', async () => {
    const response = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${user1AccessToken}`);

    expect(response).toBeOk(200);
    game2Id = response.body.id;
  });

  it('/pair-game-quiz/pairs/connection (POST) should create game, connect to game, and return game', async () => {
    const response = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${user3AccessToken}`);

    expect(response).toBeOk(200);
  });
  //Проверка получения всех игр пользователя 1

  it('/pair-game-quiz/pairs/my (POST) return all games by user 1', async () => {
    const responseGame1 = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game1Id}`)
      .set('Authorization', `Bearer ${user1AccessToken}`);
    game1Data = responseGame1.body;

    const responseGame2 = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${game2Id}`)
      .set('Authorization', `Bearer ${user1AccessToken}`);
    game2Data = responseGame2.body;

    const response = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my')
      .set('Authorization', `Bearer ${user1AccessToken}`);
    //
    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [game2Data, game1Data],
    });
    expect(response).toBeOk(200);
  });

  it('/pair-game-quiz/pairs/my (POST) return all games by user 1 sort by finishGameDate, sort = asc', async () => {
    const response = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my?sortBy=finishGameDate&sortDirection=asc')
      .set('Authorization', `Bearer ${user1AccessToken}`);
    ///
    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [game1Data, game2Data],
    });
    expect(response).toBeOk(200);
  });
});
