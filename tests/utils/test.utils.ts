import { AppModule } from '@app/src/app.module';
import { applyAppSettings } from '@app/src/settings/apply-app-settings';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { dropSqlDataBase } from './dropSqlDataBase';
import { UsersTestManager } from './users-test-manager';

export const getAppAndCleanDB = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  try {
    const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule(
      {
        imports: [AppModule],
      },
    );
    /*       .overrideProvider(UsersService)
      .useValue(UserServiceMockObject);
 */
    if (addSettingsToModuleBuilder) {
      addSettingsToModuleBuilder(testingModuleBuilder);
    }

    const testingAppModule = await testingModuleBuilder.compile();
    const app: INestApplication = testingAppModule.createNestApplication();
    await applyAppSettings(app);
    await app.init();

    await dropSqlDataBase(app);

    /*     const databaseConnection = app.get<Connection>(getConnectionToken()); */
    const httpServer = app.getHttpServer();
    const userTestManger = new UsersTestManager(app);

    return {
      app,
      /*       databaseConnection, */
      testingAppModule,
      httpServer,
      userTestManger,
    };
  } catch (error) {
    console.error('Error in getAppAndCleanDB:', error);
    throw error;
  }
};
