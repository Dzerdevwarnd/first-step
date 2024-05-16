import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors();
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
  app.useGlobalFilters(
    /*new ErrorExceptionFilter()*/ new HttpExceptionFilter(),
  );
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3004);
}
bootstrap();
