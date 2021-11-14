import { BadRequestException, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * local 전략 커스텀 인증 로직
   * - 요청 body를 loginDto에 매핑 => 유효성 검사 실행
   * - => 성공 => 다음 로직 실행
   * - => 실패 => 400 응답 처리
   * @param context
   * @returns
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    // dto = body 매핑
    const validateConfig = plainToClass(
      LoginDto, //
      request.body,
      { enableImplicitConversion: true },
    );
    // 유효성 검사 실행
    const errors = validateSync(
      validateConfig, //
      { skipMissingProperties: false },
    );

    if (errors.length > 0) {
      // 메세지만 추출
      const messages = errors.map((error) => {
        const constraints = error.constraints;
        return Object.keys(constraints) //
          .map((key) => constraints[key])
          .reduce((perv, cur) => perv.concat(cur));
      });

      // AuthGuard의 handleRequest를 사용하여 에러를 헨들링 한다.
      super.handleRequest(new BadRequestException(messages), null, null, null);
    }

    // 위의 커스텀 인증 로직이 모두 통과하면 AuthGuard의 canActivate를 호출한다.
    return super.canActivate(context);
  }
}
