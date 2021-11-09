import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationPipeOptions } from './common/options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(helmet());
  //app.use(csurf());
  //app.setGlobalPrefix('/api/v1');

  const config = app.get(ConfigService);

  /* swagger 설정 */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Dwitter Auth API')
    .setDescription('dwitter : Auth API')
    .setVersion('1.0')
    //.addTag('auth')
    .addBearerAuth() // @ApiBearerAuth를 사용하기 위한 설정
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document);

  /* 전역 Pipe 설정 */
  app.useGlobalPipes(
    /* requset body가 매핑되는 dto에 대한 전역 유효성 검사 설정  */
    new ValidationPipe(ValidationPipeOptions),
  );

  await app.listen(config.get('PORT'));
}

bootstrap();
