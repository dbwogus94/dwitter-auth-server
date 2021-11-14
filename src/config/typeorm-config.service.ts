import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from 'src/user/entities/User.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.config.get('DB_HOST'),
      port: +this.config.get<number>('DB_PORT'),
      username: this.config.get('DB_USERNAME'),
      password: this.config.get('DB_PASSWORD'),
      database: this.config.get('DB_DATABASE'),
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
    };
  }
}
