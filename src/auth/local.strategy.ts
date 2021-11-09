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
        }); */
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    return user;
    // 리턴 값은에 req.user에 담긴다.
  }
}
