import { INestApplication } from '@nestjs/common';
import {
  setCookieParser,
  setCors,
  setDependencyInjection,
  setGlobalFilters,
  setSwagger,
  setValidationPipe,
} from './app-settings';

export const applyAppSettings = (app: INestApplication) => {
  setCookieParser(app);
  setCors(app);
  setValidationPipe(app);
  setGlobalFilters(app);
  setDependencyInjection(app);
  setSwagger(app);
};
