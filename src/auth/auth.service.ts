import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * 엑세스 토큰 발급
   * @param jwtPayload
   * @returns accessToken(jwt)
   */
  issueAccessToken(jwtPayload: object): string {
    const option = {
      secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      issuer: this.config.get('JWT_ISSUER'),
    };
    return this.jwtService.sign(jwtPayload, option);
  }

  /**
   * 리프레쉬 토큰 발급
   * @returns refreshToken(jwt)
   */
  issueRefreshToken(): string {
    const option = {
      secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      issuer: this.config.get('JWT_ISSUER'),
    };
    return this.jwtService.sign({}, option);
  }

  /**
   * auth signup
   * @param singupDto
   * @returns create user pk
   * @throws ConflictException: username 중복
   */
  async signup(singupDto: SignupDto): Promise<{ id: number }> {
    const { username, password } = singupDto;
    const isExist: boolean = !!(await this.userService.findByUsername(
      username,
    ));
    if (isExist) {
      throw new ConflictException();
    }

    const hashed: string = await bcrypt.hash(
      password,
      this.config.get('BCRYPT_SALT'),
    );

    return this.userService.create({
      ...singupDto,
      password: hashed,
    });
  }

  /**
   * local.strategy.ts에서 사용되는 인증 로직 메서드
   * @param username
   * @param pass - password
   * @returns
   */
  async validateUser(username: string, pass: string): Promise<object | null> {
    const user: User = await this.userService.findByUsername(username);
    if (!user) {
      return null;
      /* 
        Q) UnauthorizedException()  VS  NotFoundException() 어떤것이 맞을까?
        A) http 응답 규칙에 따르면 등록된 유저(자원)가 없기 때문에 404 NotFoundException을 내보내야 한다.
          하지만 인증 로직은 특성상(보안) 모호하게 전달해야 한다. 
          때문에 가입된 유저가 없는 것도, 인증에 실패하는 것도 동일하게 401로 처리한다.
          => 리턴이 null인 경우 local-strategy.ts에서 공통으로 throw new UnauthorizedException()처리한다.
      */
    }

    const isEqual: boolean = await bcrypt.compare(pass, user.password);
    if (isEqual) {
      // Object Destructuring 기법
      const { password, ...result } = user;
      return result;
      // result에는 password를 제외하고 담긴다.
    }
    return null;
  }

  /**
   * login 서비스
   * 1. 리프레쉬 토큰 발행
   * 2. DB 저장
   * 3. 엑세스 토큰 발행
   * 4. 리턴
   * @param username
   * @returns {id, refreshToken, accessToken}
   */
  async login(username: string): Promise<any> {
    const user: User = await this.userService.findByUsername(username);
    const { id } = user;
    const refreshToken: string = this.issueRefreshToken();
    await this.userService.updateByRefreshToken(id, refreshToken);

    return {
      id,
      refreshToken,
      accessToken: this.issueAccessToken({ id }),
    };
  }
}
