import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { validate, Environment } from './env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/User.entity';
import { Connection } from 'typeorm';

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

    /* typeOrm 모듈 설정 => useFactory를 사용해 모듈 동적 생성 */
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  //constructor(private connection: Connection) {}
}
