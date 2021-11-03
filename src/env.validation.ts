import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

export enum Environment {
  Development = 'dev',
  Production = 'prod',
  Test = 'test',
}

/**
 * env에 있는 데이터 유효성 검사 목록을 가진 클래스
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  /* DB */
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  /* JWT */
  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;

  /* bcrypt */
  @IsNumber()
  BCRYPT_SALT: number;

  /* redis */
  @IsString()
  REDIS_NAME: string;

  @IsString()
  REDIS_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvironmentVariables, //
    config,
    { enableImplicitConversion: true },
  );
  /* plainToClass(class, plain object, options)
    - plain object를 사용하여 class의 인스턴스를 생성한다.
   */

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // 필드값이 undefined, null인 경우도 검사하도록 옵션 설정.
  });
  /* validateSync(instance, options)
    - class에 선언된 class-validator모듈의 데코레이터를 통해 
    - 인자로 받은 instance의 유효성 검사를 실시한다.
    - validateSync는 비동기에 대한 유효성 검사는 실시하지 않는다.
   */

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
