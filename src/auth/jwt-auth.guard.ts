import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
// JwtAuthGuard클래스는 AuthGuard('jwt')상속으로 JwtStrategy 클래스를 내부적으로 사용한다.
// jwt: 내부적으로 Passport가 passport-jwt 전략을 사용하는 클래스를 호출한다.
// passport-jwt 전략을 구현한 클래스는 PassportStrategy(Strategy)를 상속한 JwtStrategy 클래스이다.
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  /**
   * JwtAuthGuard가 사용할 커스텀 인증 로직을 여기에 구현한다.
   * 1. 인증헤더 확인
   * 2. Bearer + jwt 확인
   * 3. jwt 디코딩
   * 4. 블랙리스트 jwt 확인
   * @param context
   * @returns
   * @throws UnauthorizedException
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    const requset: Request = context.switchToHttp().getRequest();
    const authorization = requset.headers.authorization;
    if (!authorization) {
      return this.authService.throwAuthException();
    }
    const accessToken = this.authService.getAccessToken(authorization);
    const { id } = this.authService.deCodeAccessToken(accessToken);
    const isBlacklist = await this.authService.isBlacklistToken(id.toString(), accessToken);
    if (isBlacklist) {
      return this.authService.throwAuthException();
    }

    /* ### JwtAuthGuard라이프 사이클에서 "return super.canActivate(context)" 의미
      1. nest는 빌드시점에 JwtStrategy를 생성한다.
      2. 요청이 들어와 @UseGuards에 의해 JwtAuthGuard가 호출되면 canActivate 메소드를 실행한다.
      3. canActivate에서 return super.canActivate(context); 실행되면 생성해둔 JwtStrategy를 호출한다.
      4. JwtStrategy가 호출되면 생성자에 선언된 super({...}) 설정 값으로
      5. jwt를 헤더에서 추출하고, secretOrKey를 사용하여 디코딩한다.
      6. 성공적으로 jwt를 디코딩하면, 그 결과를 payload에 담아 JwtStrategy의 메서드 validate를 호출한다.
      7. 디코딩시 에러가 발생하면 this.handleRequest가 호출된다.
    */
    return super.canActivate(context);
  }

  /**
   * Passport-jwt 전략에서 범용적으로 사용되는 응답 헨들러
   * - 호촐 조건
   * 1. 소스에서 직접 호출
   * 2. 디코딩 실패시
   *    => super.canActivate(context)가 리턴되고, JwtStrategy가 jwt를 디코딩시 실패하면 호출
   * 3. 디코딩 성공시
   *    => 디코딩 성공 후 호출되는 validate 메서드에서 리턴이 호출될 때
   * @param err
   * @param user
   * @param info
   * @returns
   */
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
