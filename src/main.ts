import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './utils/exceptions/http.exception';
import { AppConstants } from './utils/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['debug', 'log'] });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI });
  await app.listen(AppConstants.PORT);
}
bootstrap();
