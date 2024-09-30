//import cookieParser from 'cookie-parser';

export const dbName = 'homeWorks';
export const settings = {
  MONGO_URL:
    process.env.MONGO_URL ||
    `mongodb+srv://admin:qwerty123@cluster0.hzh4nyr.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  JWT_SECRET: process.env.JWT_SECRET || '123',
  accessTokenLifeTime: process.env.ACCESS_TOKEN_LIFE_TIME || '10000000',
  refreshTokenLifeTime: process.env.REFRESH_TOKEN_LIFE_TIME || '20000000',
  recoveryCodeLifeTime: process.env.RECOVERY_CODE_LIFE_TIME || '1000000',
  basicAuthLogin: process.env.BASIC_AUTH_LOGIN || 'admin',
  basicAuthPassword: process.env.BASIC_AUTH_PASSWORD || 'qwerty',
}; //

/*export const routersPaths = {
  auth: '/auth',
  blogs: '/blogs',
  posts: '/posts',
  users: '/users',
  testing: '/testing',
  comments: '/comments',
  security: '/security',
};

app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', true);

app.use(routersPaths.auth, authRouter);
app.use(routersPaths.blogs, blogsRouter);
app.use(routersPaths.posts, postsRouter);
app.use(routersPaths.users, usersRouter);
app.use(routersPaths.testing, testingRouter);
app.use(routersPaths.comments, commentsRouter);
app.use(routersPaths.security, securityRouter);
*/
