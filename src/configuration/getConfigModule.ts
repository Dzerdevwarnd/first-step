//add 2 lines before all to correct parsing of process.env in all modules
import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';
import { envFilePath } from './detect-env-file';
export const getConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePath,
  load: [getConfiguration],
});
