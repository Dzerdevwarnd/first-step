let user1AccessToken: string;
let user1RefreshToken: string;
let user3AccessToken: string;
let user3RefreshToken: string;
let user3InvalidRefreshToken: string;
let confirmationCode: string;

export const createUser1InputData = {
  login: 'warnd',
  password: '123321',
  email: 'dzerdevwarnd@gmail.com',
};

export const user1ViewData = {
  id: expect.any(String),
  login: 'warnd',
  email: 'dzerdevwarnd@gmail.com',
  createdAt: expect.any(Date),
};
export let createdUser1Id: string;

export const createUser2InputData = {
  login: 'dzerdev',
  password: 'qwerty',
  email: 'dzerdevwarnd1@gmail.com',
};

export const user2ViewData = {
  id: expect.any(String),
  login: 'dzerdev',
  email: 'dzerdevwarnd1@gmail.com',
  createdAt: expect.any(Date),
};
export let createdUser2Id: string;

export const createUser3InputData = {
  login: 'warnd3',
  password: '123321',
  email: 'dzerdevwarnd3@gmail.com',
};

export const user3ViewData = {
  id: expect.any(String),
  login: 'warnd3',
  email: 'dzerdevwarnd3@gmail.com',
  createdAt: expect.any(Date),
};
export let createdUser3Id: string;

export const registrationUser3InputData = {
  login: 'string',
  password: 'zk1O61ah-g',
  email: 'dzerdevwarnd2@gmail.com',
};

export const createQuestionDto1 = {
  body: 'ThisIsaSampleQuestion1',
  correctAnswers: ['SampleAnswer1'],
};

export const createQuestionDto2 = {
  body: 'ThisIsaSampleQuestion2',
  correctAnswers: ['SampleAnswer2'],
};

export const createQuestionDto3 = {
  body: 'ThisIsaSampleQuestion3',
  correctAnswers: ['SampleAnswer3'],
};

export const createQuestionDto4 = {
  body: 'ThisIsaSampleQuestion4',
  correctAnswers: ['SampleAnswer4'],
};

export const createQuestionDto5 = {
  body: 'ThisIsaSampleQuestion5',
  correctAnswers: ['SampleAnswer5'],
};

export const createQuestionArrayDto = [
  createQuestionDto1,
  createQuestionDto2,
  createQuestionDto3,
  createQuestionDto4,
  createQuestionDto5,
];

export const gameAfterUser1CreatedGame = {
  id: expect.any(String), // Для UUID используем проверку на строку
  firstPlayerProgress: {
    answers: [],
    player: {
      id: expect.any(String),
      login: createUser1InputData.login,
    },
    score: 0,
  },
  secondPlayerProgress: null,
  questions: null,
  status: 'PendingSecondPlayer',
  pairCreatedDate: expect.any(String), // Для даты используем проверку на тип Date
  startGameDate: null,
  finishGameDate: null,
};

export const gameAfterUser2ConnectedGame = {
  id: expect.any(String), // Для UUID используем проверку на строку
  firstPlayerProgress: {
    answers: [],
    player: {
      id: expect.any(String),
      login: createUser1InputData.login,
    },
    score: 0,
  },
  secondPlayerProgress: {
    answers: [],
    player: {
      id: expect.any(String),
      login: createUser2InputData.login,
    },
    score: 0,
  },
  questions: expect.arrayContaining([
    expect.objectContaining({
      id: expect.any(String),
      body: expect.any(String),
    }),
  ]),
  status: 'Active',
  pairCreatedDate: expect.any(String),
  startGameDate: expect.any(String),
  finishGameDate: null,
};

export const answerDto = {
  answer: 'SampleAnswer1',
};

export const answerData = {
  questionId: expect.any(String),
  answerStatus: expect.stringMatching(/^(Correct|Incorrect)$/),
  addedAt: expect.any(String),
};

export const allGamesByUser1 = {
  pagesCount: 0,
  page: 0,
  pageSize: 0,
  totalCount: 0,
  items: [
    {
      id: 'string',
      firstPlayerProgress: {
        answers: [
          {
            questionId: 'string',
            answerStatus: 'Correct',
            addedAt: '2024-10-08T08:10:16.618Z',
          },
        ],
        player: {
          id: 'string',
          login: 'string',
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [
          {
            questionId: 'string',
            answerStatus: 'Correct',
            addedAt: '2024-10-08T08:10:16.618Z',
          },
        ],
        player: {
          id: 'string',
          login: 'string',
        },
        score: 0,
      },
      questions: [
        {
          id: 'string',
          body: 'string',
        },
      ],
      status: 'PendingSecondPlayer',
      pairCreatedDate: '2024-10-08T08:10:16.618Z',
      startGameDate: '2024-10-08T08:10:16.618Z',
      finishGameDate: '2024-10-08T08:10:16.618Z',
    },
  ],
};
