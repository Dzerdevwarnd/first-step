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
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);

    try {
      await queryRunner.startTransaction();

      for (const table of tables) {
        await queryRunner.query(
          `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    return { app, moduleFixture };
  } catch (error) {
    console.error('Error in getAppAndCleanDB:', error);
    throw error;
  }
};
