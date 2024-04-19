let envFilePath = '.env';
switch (process.env.Node_ENV) {
  case 'production':
    envFilePath = '.env.production';
    break;
  case 'testing':
    envFilePath = '.env.production';
    break;
}
export { envFilePath };
