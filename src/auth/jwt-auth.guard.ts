import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// JwtAuthGuard클래스는 AuthGuard('jwt')상속으로 JwtStrategy 클래스를 내부적으로 사용한다.
// jwt: 내부적으로 Passport가 passport-jwt 전략을 사용하는 클래스를 호출한다.
// passport-jwt 전략을 사용하는 클래스는 PassportStrategy(Strategy)를 상속한 JwtStrategy 클래스이다.
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 블랙리스트 검증

    return super.canActivate(context);
    // => JwtStrategy클래스의 validate메서드를 호출한다.
  }

  // jwt
  handleRequest(err: Error, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
