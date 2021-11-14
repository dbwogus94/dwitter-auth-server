import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
    /*# super() 사용법
      - 기본 설정 필드 : { username, password }
      - 기본 설정 필드와 다른 필드를 사용한다면 super에 인자로 전달하여 매핑한다.
        super({
          usernameField: 'userId',
        }); 
      
      ** local 전략을 사용하는 가드는 
        기본으로 설정된 필드(username, password)에 한에 요청시 빈값 체크를 실행한다.
    */
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    return user;
    // 리턴된 값을 인자로 사용하여 AuthGaurd.handleRequest(null, user, ...)를 호출한다.
    // 호출된 AuthGaurd.handleRequest는 에러가 없으면 user를 최종적으로 리턴한다.
    // 최종적으로 리턴된 user는 request.user에 담겨 다음 계층으로 넘겨진다.
  }
}
