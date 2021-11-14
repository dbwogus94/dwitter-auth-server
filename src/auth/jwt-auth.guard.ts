import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from 'src/user/entities/User.entity';
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
   * 1. 인증헤더 확인(Bearer + jwt 확인)
   * 2. jwt 디코딩 확인
   * 3. 블랙리스트 jwt 확인
   * @param context
   * @returns
   * @throws UnauthorizedException
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    const requset: Request = context.switchToHttp().getRequest();
    const authorization: string | undefined = requset.headers.authorization;

    try {
      const accessToken: string | null = this.authService.getAccessToken(authorization);
      if (!accessToken) {
        this.authService.throwAuthException('accessToken이 잘못된 형식입니다.');
      }
      const { id }: User = this.authService.deCodeAccessToken(accessToken);
      const blacklistToken: string | null = await this.authService.getBlacklistToken(id.toString());
      if (blacklistToken && blacklistToken === accessToken) {
        this.authService.throwAuthException('만료된 토큰입니다.');
      }
      // 성공시
      return super.canActivate(context);
    } catch (error) {
      // 실패시
      return this.handleRequest(error, void 0, void 0, void 0);
    }
    /* ### JwtAuthGuard라이프 사이클에서 "return super.canActivate(context)" 의미
      1. nest는 빌드시점에 JwtStrategy를 생성한다.
      2. 요청이 들어와 @UseGuards에 의해 JwtAuthGuard가 호출되면 canActivate 메소드를 실행한다.
      3. canActivate에서 return super.canActivate(context); 실행되면 생성해둔 JwtStrategy를 호출한다.
      4. JwtStrategy가 호출되면 생성자에 선언된 super({...})에 설정 추출기(jwtFromRequest)로 jwt를 인증 헤더에서 추출한다.
      6. 추출기에 의해 성공적으로 추출한 jwt는 설정된 secretOrKey로 디코딩한다.

      5. 성공적으로 jwt를 디코딩하면, 
        1) 디코딩 결과를 payload에 담아 JwtStrategy.validate(payload)를 호출한다.
        2) validate에서 user 리턴되면 user를 파라미터로 하여
        3) JwtAuthGuard.handleRequest(err, user, info)가 호출된다.
        4) JwtAuthGuard.handleRequest가 구현되어 있지 않다면 super이 AuthGuard.handleRequest가 호출된다.
        5) JwtAuthGuard.handleRequest(err, user, info) 파라미터로 받은 user가 리턴되면, 
          nestjs는 requset.user에 리턴된 user를 할당하여 다음 로직(계층)을 호출한다`.
          (다음 로직:  interceptor => Pipe => controller ...)

      6. 디코딩시 에러가 발생하면, 
        - JwtAuthGuard.handleRequest(err, user, info) 호출한다.
        - 호출 파라미터 user에 false를 담아 호출하여, 에러를 발생시킨다(UnauthorizedException).
        - JwtAuthGuard.handleRequest가 구현되어 있지 않다면 super이 AuthGuard.handleRequest가 호출된다.
    */
  }

  /**
   * Passport-jwt 전략에서 범용적으로 사용되는 응답 헨들러
   * - 상속받은 자식에서 구현하지 않았으면 AuthGuard.handleRequest가 호출되어 사용된다.
   * - 호촐 조건
   * 1. controller
   * 2. 소스에서 직접 호출
   * 3. 디코딩 실패시
   *    => super.canActivate(context)가 리턴되고, JwtStrategy가 jwt를 디코딩시 실패하면 호출
   * 4. 디코딩 성공시
   *    => 디코딩 성공 후 호출되는 validate 메서드에서 리턴이 호출될 때
   * @param err
   * @param user
   * @param info
   * @param status
   * ```js
   * status = {
   *  getRequest: "요청 객체",
   *  getResponse: "응답 객체",
   *  contructorRef: "Controller 인스턴스",
   *  handler: "controller.method",
   *  ...
   * }
   * ```
   * @returns
   */
  handleRequest(err, user, info, status) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    // accessToken을 req.user객체에 담아 다음 계층에서 사용할 수 있도록 설정한다.
    const authorization = status.getRequest().headers.authorization;
    const accessToken: string = this.authService.getAccessToken(authorization);
    return { ...user, accessToken };
  }
}
