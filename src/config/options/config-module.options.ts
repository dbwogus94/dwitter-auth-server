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
