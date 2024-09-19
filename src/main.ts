import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-settings';

const serverUrl = 'http://localhost:3004';
const appPort = process.env.APP_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await applyAppSettings(app);

  await app.listen(appPort);
}
bootstrap();
////
