import { Environment, validate } from '../env.validation';

export const ConfigModuleOptions: any = {
  envFilePath:
    process.env.NODE_ENV === Environment.Production //
      ? '.env'
      : '.env.dev',
  isGlobal: true,
  validate,
  // env.validation.ts에 정의된 validate를 호출하여 유효성 검사를 실행한다.
  // validate를 호출할때 env 정보를 object로 변환하여 인자로 전달한다.
};

export const ValidationPipeOptions: any = {
  // true면 유효성 데코레이터를 사용하지 않는 속성이 값으로 들어오는 경우 제거한다.
  whitelist: true,
  // true면 whitlist에서 속성을 제거하는 대신 예외를 발생
  forbidNonWhitelisted: false,
  // true면 요청 payload를 dto로 변환
  transform: true,
};
