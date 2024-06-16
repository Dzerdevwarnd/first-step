import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RefreshTokensMetaModule } from 'src/DBEntities/refreshTokenMeta/refreshTokenMeta.module';
import { myJwtModule } from 'src/application/jwt/jwt.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/endPointsEntities/users/users.module';
import { settings } from 'src/settings';
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
      imports: [
        TypeOrmModule.forRoot(options),
        MongooseModule.forRoot(
          settings.MONGO_URL, //|| `mongodb://0.0.0.0:27017/${1}`,
          //  { dbName: 'hm13' },
        ),
        AuthModule,
        UsersModule,
        RefreshTokensMetaModule,
        myJwtModule,
      ],
      providers: [],
    }).compile();
    const app: INestApplication = moduleFixture.createNestApplication();
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
    return app;
  } catch (error) {
    console.error('Error in getAppAndCleanDB:', error);
    throw error;
  }
};
