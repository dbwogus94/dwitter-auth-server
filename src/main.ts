import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  //app.use(csurf());

  /* 전역 Pipe 설정 */
  app.useGlobalPipes(
    /* requset body가 매핑되는 dto에 대한 전역 유효성 검사 설정  */
    new ValidationPipe({
      // true면 유효성 데코레이터를 사용하지 않는 속성이 값으로 들어오는 경우 제거한다.
      whitelist: true,
      // true면 whitlist에서 속성을 제거하는 대신 예외를 발생 => 리다이렉션 때문에 false로 변경
      forbidNonWhitelisted: false,
      // true면 요청 payload를 dto로 변환
      transform: true,
    }),
  );
  const config = app.get(ConfigService);
  await app.listen(config.get('PORT'));
}

bootstrap();
