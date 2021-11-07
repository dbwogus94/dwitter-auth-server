import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      // 인증 헤더에서 Bearer가 붙은 토큰을 가져오는 추출기 설정 <jwt | null>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // true면 토큰 만료를 확인하지 않음, false면 만료된 토큰 401 Unauthorized 리턴
      ignoreExpiration: false,
      // 정의된 경우 토큰 발행자(iss)가 이 값인지 확인한다.
      issuer: config.get<string>('JWT_ISSUER'),
      // 엑세스 토큰을 확인하기 위한 비밀 키
      secretOrKey: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  /* validate 메서드 호출 시점
    1. jwt-strategy전략을 사용하는 Passport는 설정한 JWT의 서명을 사용하여 jwt를 디코딩 합니다.
    2. 성공적으로 디코딩 되었다면? 
    3. 결과 json(payload)을 인자로 하여 validate메서드를 호출합니다.
    4. super에서 설정한 것 처럼 [인증헤더가 없던가? 유효하지 않던가? 디코딩에 실패 했다면?]
    5. new UnauthorizedException()을 던진다.
    
    Q) AuthGuard('jwt')를 상속하는 가드가 있다면?
    A) validate()가 호출되기 전에 AuthGuard('jwt')를 상속하는 
       클래스 JwtAuthGuard의 메서드가 먼저 호출된다.
    
    Q) 성공적으로 디코딩 되었다면? 
    A) JwtAuthGuard클래스의 canActivate()를 호출한다.
       => canActivate()에서 리턴시 validate()를 호출한다.

    Q) 인증헤더가 없던가? 유효하지 않던가? 디코딩에 실패 했다면?
    A) JwtAuthGuard클래스의 handleRequest메서드를 호출한다.

  */
  async validate(payload: any) {
    return { id: payload.id, username: payload.username };
    // Passport는 이 리턴 객체를 사용하여 user를 만들고
    // req.user에 할당 후 다음 로직을 호출한다.
  }
}
