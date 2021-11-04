import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { Environment, validate } from './env.validation';
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
    /* 전역 Interceptor 설정:  morgan 전역 설정 */
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor(
        process.env.NODE_ENV === Environment.Production ? 'tiny' : 'dev',
      ),
    },
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
