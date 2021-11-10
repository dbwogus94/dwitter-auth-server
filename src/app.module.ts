import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { Environment, validate } from './config/env.validation';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { UserModule } from './user/user.module';
import { ConfigModuleOptions } from './config/options/config-module.options';
import { RedisModule } from 'nestjs-redis';
import { TypeOrmConfigService } from './config/typeorm-config.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    /* ConfigModule으로 환경설정 => dotenv 모듈을 내부적으로 사용한다. */
    ConfigModule.forRoot(ConfigModuleOptions),

    /* redis 모듈 설정  
      TODO : nestjs-redis 정식 버전 에러 발생!!
      - 임시로 개인이 수정한 라이브러리 추가 
      - https://github.com/GyanendroKh/nestjs-redis 에서 직접 추가하여 실행하였음
    */
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        name: config.get('REDIS_NAME'),
        url: config.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),

    /* typeOrm 모듈 설정 
        => useFactory를 사용해 모듈 동적 생성 */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
      inject: [ConfigService],
    }),
    // morgan 모듈 DI
    MorganModule,
  ],
  controllers: [],
  providers: [
    /* 전역 Interceptor 
      - MorganInterceptor는 가장 마지막에 실행된다.
    */
    {
      // morgan 전역 설정
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor(process.env.NODE_ENV === Environment.Production ? 'tiny' : 'dev'),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    /* 전역 Pipe 설정 */
    // {
    //   provide: APP_PIPE,
    //   useValue: new ValidationPipe(ValidationPipeOptions),
    // },
    /* 전역 예외 filter 설정 */
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  /* 전역 미들웨어 설정 */
  configure(consumer: MiddlewareConsumer) {
    // 개발모드에서만 사용
    if (process.env.NODE_ENV === Environment.Development) {
      consumer //
        .apply(LoggerMiddleware)
        .forRoutes({ path: '/*', method: RequestMethod.ALL });
    }
  }
  //constructor(private connection: Connection) {}
}
