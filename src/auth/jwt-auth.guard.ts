import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
// JwtAuthGuard클래스는 AuthGuard('jwt')상속으로 JwtStrategy 클래스를 내부적으로 사용한다.
// jwt: 내부적으로 Passport가 passport-jwt 전략을 사용하는 클래스를 호출한다.
// passport-jwt 전략을 사용하는 클래스는 PassportStrategy(Strategy)를 상속한 JwtStrategy 클래스이다.
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly config: ConfigService,
    private authService: AuthService,
  ) {
    super();
  }
  /**
   * get Requset
   * @param context
   * @returns requset
   */
  private getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
  /**
   * 요청 인증 헤더에서 jwt 가져오기
   * @param req
   * @returns jwt token
   * @throws UnauthorizedException
   */
  private getAuthorizationToken(req): string {
    const authHeader = req.headers.authorization;
    if (!(authHeader && authHeader.startsWith('Bearer'))) {
      throw new UnauthorizedException();
    }
    return authHeader.split(' ')[1];
  }
  /**
   * 요청한 jwt가 블랙 리스트로 등록된 토큰인지 확인
   * @param id
   * @param token
   * @throws UnauthorizedException
   */
  private async checkBlacklistToken(id: string, token: string): Promise<void> {
    const client = this.authService.getRedisClient();
    const result = await client.get(id);
    if (result && result === token) {
      throw new UnauthorizedException();
    }
  }

  /* JwtAuthGuard가 사용할 커스텀 인증 로직을 여기에 구현한다. */
  async canActivate(context: ExecutionContext): Promise<any> {
    // requset 가져오기
    const requset = this.getRequest(context);
    // 인증헤더에서 jwt 가져오기
    const token = this.getAuthorizationToken(requset);
    // jwt 디코딩
    const { id } = this.authService.deCodeAccessToken(token);
    // 블랙 리스트 토큰인지 확인
    await this.checkBlacklistToken(id, token);
    // 아니라면 다음 로직 호출 => JwtStrategy클래스의 validate메서드를 호출한다.
    return super.canActivate(context);
  }

  /* Passport-jwt를 구현한 JwtStrategy 클래스에서 jwt 디코딩시 에러가 발생하면 호출 */
  handleRequest(err: Error, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
