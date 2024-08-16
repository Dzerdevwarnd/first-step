import {
  setCookieParser,
  setCors,
  setDependencyInjection,
  setGlobalFilters,
  setSwagger,
  setValidationPipe,
} from './app-settings';

export function applyAppSettings(app) {
  setCookieParser(app);
  setCors(app);
  setValidationPipe(app);
  setGlobalFilters(app);
  setDependencyInjection(app);
  setSwagger(app);
}
