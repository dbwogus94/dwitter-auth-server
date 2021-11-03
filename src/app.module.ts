import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { validate, Environment } from './env.validation';

@Module({
  imports: [
    AuthModule,
    UserModule,
    /* ConfigModule으로 환경설정 => dotenv 모듈을 내부적으로 사용한다. */
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === Environment.Production //
          ? '.env'
          : '.env.dev',
      isGlobal: true,
      validate,
      // env.validation.ts에 정의된 validate를 호출하여 유효성 검사를 실행한다.
      // validate를 호출할때 env 정보를 object로 변환하여 인자로 전달한다.
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
