import { AppModule } from '@app/src/app.module';
import { HttpExceptionFilter } from '@app/src/exception.filter';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';

export const getAppAndCleanDB = async () => {
  try {
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nodejs',
      password: 'nodejs', //
      database: 'Homework1',
      autoLoadEntities: true,
      synchronize: true,
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app: INestApplication = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const errorsForResposnse = [];
          errors.forEach((e) => {
            const constraintsKeys = Object.keys(e.constraints);
            constraintsKeys.forEach((ckey) => {
              errorsForResposnse.push({
                message: e.constraints[ckey],
                field: e.property,
              });
            });
          });
          throw new BadRequestException(errorsForResposnse);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), {
      fallbackOnErrors: true,
    });
    await app.init();

    const dataSource = await app.resolve(DataSource);
    await dataSource.query(`CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
statements CURSOR FOR
		SELECT tablename FROM pg_tables
		WHERE tableowner = username AND schemaname = 'public';
BEGIN
FOR stmt IN statements LOOP
		EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
END LOOP;
END;
$$ LANGUAGE plpgsql;
SELECT truncate_tables('nodejs');`);
    return { app, moduleFixture };
  } catch (error) {
    console.error('Error in getAppAndCleanDB:', error);
    throw error;
  }
};
