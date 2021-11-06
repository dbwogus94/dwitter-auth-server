import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationPipeOptions } from './common/options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  //app.use(csurf());

  /* 전역 Pipe 설정 */
  app.useGlobalPipes(
    /* requset body가 매핑되는 dto에 대한 전역 유효성 검사 설정  */
    new ValidationPipe(ValidationPipeOptions),
  );
  const config = app.get(ConfigService);
  await app.listen(config.get('PORT'));
}

bootstrap();
