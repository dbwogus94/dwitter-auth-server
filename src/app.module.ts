import {
  HttpException,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { AuthGuard } from './auth.guard';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { Environment, validate } from './env.validation';
import { ErrorsInterceptor } from './error.interceptor';
import { HttpExceptionFilter } from './http-exception.filter';
import { ResponseInterceptor } from './response.interceptor';
import { TestPipe } from './test.pipe';
import { User } from './user/entities/User.entity';
import { UserModule } from './user/user.module';

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

    /* typeOrm 모듈 설정 
        => useFactory를 사용해 모듈 동적 생성 */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: +config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        // 엔티티 적용
        entities: [User],
        // 마이그래이션 파일 위치
        migrations: ['migration/*.ts'],
        cli: {
          migrationsDir: 'migration',
        },
        // 시작시 엔티티에 따라 테이블 create
        synchronize: true,
        // 시작시 모든 테이블 drop
        dropSchema: true,
        // 한국 시간
        timezone: '+09:00',
      }),
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
      useClass: MorganInterceptor(
        process.env.NODE_ENV === Environment.Production ? 'tiny' : 'dev',
      ),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
    /* 전역 예외 filter 설정 */
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    /* 전역 Pipe 설정 
      - intercept 호출 이후 호출된다.
      - Pipe는 controller 호출 전에 호출된다.
    */
    {
      provide: APP_PIPE,
      useClass: TestPipe,
    },
    /* 전역 Guard 설정 */
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    /* # 실행 순서 정리 
      - 미들웨어 => 가드 => 인터셉터 => 파이프 => 라우터(컨트롤러) => 인터셉터 => 몰간
      - 에러필터는 에러가 발생하는 모든 지점 이후에 실행된다.
      - 만약 예외 인터셉터가 있다면 예외 인터셉터가 먼저 호출되고 이후 예외 필터가 호출 된다.
        ex) controller에서 에러 발생
        - 미들웨어 => 가드 => 예외 인터셉터 => 파이프 => 라우터(컨트롤러) => 예외 인터셉터 => 예외 필터 => 몰간
      
      ## 정상 요청   
        Request
          => middleware(LoggerMiddleware) 
          => AuthGuard
          => ResponseInterceptor 전 
          => ErrorsInterceptor 전
          => TestPipe
          => Controller 
          => ResponseInterceptor 후   -- 에러 없으면 호출
          => MorganInterceptor 
        Response

        Q) 같은 Provider이 여러개 사용된다면
        - 전역스코프부터 지역 스코프로 호출되며, 
        - 전역스코프에 여러개를 선언하여 사용 중 이라면
        - 선언된 순서대로 실행된다.

      --------------------------------------------------------------   
      # 에러 발생 위치별 실행 순서

      ## Controller에서 에러 발생시
        Request
          => middleware(LoggerMiddleware)
          => AuthGuard 
          => ResponseInterceptor 전 
          => ErrorsInterceptor 전
          => TestPipe
          => Controller              -- 에러 발생!!
          => ErrorsInterceptor 후    -- 에러 발생시 호출
          => HttpExceptionFilter     -- 에러 발생시 호출
          => MorganInterceptor 
        Response

        ## middleware에서 에러 발생시
        Request
          => middleware(LoggerMiddleware) -- 에러 발생!!
          => HttpExceptionFilter          -- 에러 발생시 호출
        Response

        ## ResponseInterceptor에서 에러 발생시
        Request
          => middleware(LoggerMiddleware)
          => AuthGuard 
          => ResponseInterceptor 전      -- 에러 발생!! 
          => HttpExceptionFilter         -- 에러 발생시 호출
        Response


      ## 정리
      ### Interceptor 에러 헨들링
      - controller 전/후로 실행되는 인터셉터는 controller이후 로직에 대한 에러만 처리할 수 있다.
      ### Filter 에러 헨들링
      - 예외 필터는 Nest의 모든 실행 컨텍스트에서 예외를 처리할 수 있다.
    */
  ],
})
export class AppModule implements NestModule {
  /* 전역 미들웨어 설정 */
  configure(consumer: MiddlewareConsumer) {
    if (process.env.NODE_ENV === Environment.Development) {
      consumer //
        .apply(LoggerMiddleware)
        .forRoutes({ path: '/*', method: RequestMethod.ALL });
    }
  }
  //constructor(private connection: Connection) {}
}
