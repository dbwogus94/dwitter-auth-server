import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { User } from 'src/user/entities/User.entity';
import { UserService } from 'src/user/user.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private accessTokenOptions: any;
  private refreshTokenOptions: any;

  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {
    this.accessTokenOptions = {
      secret: this.config.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      issuer: this.config.get('JWT_ISSUER'),
    };
    this.refreshTokenOptions = {
      secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      issuer: this.config.get('JWT_ISSUER'),
    };
  }

  /**
   * Bearer를 제거한 엑세스 토큰(jwt) 가져오기
   * @param accessToken
   * @returns jwt token | null
   */
  getAccessToken(accessToken: string): string | null {
    if (!(accessToken && accessToken.startsWith('Bearer'))) {
      return null;
    }
    return accessToken.split(' ')[1];
  }

  /**
   * 인증 에러를 던지는 메서드
   * @throws UnauthorizedException
   */
  throwAuthException(message = void 0) {
    throw new UnauthorizedException(message);
  }

  /**
   * redis 클라이언트 리턴
   * @returns
   */
  getRedisClient(): Redis {
    const name = this.config.get('REDIS_NAME');
    return this.redisService.getClient(name);
  }

  /**
   * redis에 블랙리스트 토큰 등록
   * @param id
   * @param accessToken
   */
  async setBlacklist(id: number, accessToken: string): Promise<void> {
    await this.getRedisClient().set(id.toString(), accessToken);
  }

  /**
   * 블랙 리스트로 등록된 토큰 가져오기
   * @param id - User.id
   */
  async getBlacklistToken(id: string): Promise<string | null> {
    return this.getRedisClient().get(id);
  }

  /**
   * 엑세스 토큰 발행
   * @param jwtPayload
   * @returns accessToken(jwt)
   */
  issueAccessToken(jwtPayload: object): string {
    return this.jwtService.sign(jwtPayload, this.accessTokenOptions);
  }

  /**
   * 엑세스 토큰 복호화
   * @param accessToken
   * @returns payload | false
   */
  deCodeAccessToken(accessToken: string): any | boolean {
    try {
      return this.jwtService.verify(accessToken, this.accessTokenOptions.secret);
    } catch (error) {
      return this.throwAuthException();
    }
  }

  /**
   * 리프레시 토큰 발행
   * @returns refreshToken(jwt)
   */
  issueRefreshToken(): string {
    return this.jwtService.sign({}, this.refreshTokenOptions);
  }

  /**
   * 리프레시 토큰 유효한지 체크
   * @param refreshToken
   * @returns
   */
  isRefreshTokenAlive(refreshToken: string): any | boolean {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenOptions.secret,
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * 회원가입
   * 1. 등록된 username인지 확인
   * 2. password 암호화
   * 3. DB에 insert user
   * @param singupDto
   * @returns create user pk
   * @throws ConflictException(409): username 중복
   */
  async signup(singupDto: SignupDto): Promise<{ id: number }> {
    const { username, password } = singupDto;
    const isExist: boolean = !!(await this.userService.findByUsername(username));
    if (isExist) {
      throw new ConflictException();
    }

    const hashed: string = await bcrypt.hash(password, this.config.get('BCRYPT_SALT'));

    return this.userService.create({
      ...singupDto,
      password: hashed,
    });
  }

  /**
   * 로컬 인증 전략(local.strategy.ts)에 사용되는 메서드
   * 1. 로그인 요청 ID(username)로 user조회
   * 2. 조회한 user의 비밀번호와, 요청한 비밀번호 암호화 하여 비교
   * 3. 일치한다면 비밀번호를 제외한 User 리턴
   * @param username
   * @param pass - password
   * @returns
   * @throws UnauthorizedException
   */
  async validateUser(username: string, pass: string): Promise<object | null> {
    const user: User = await this.userService.findByUsername(username);
    if (!user) {
      this.throwAuthException();
      /* 
        Q) UnauthorizedException()  VS  NotFoundException() 어떤것이 맞을까?
        A) http 응답 규칙에 따르면 등록된 유저(자원)가 없기 때문에 404 NotFoundException을 내보내야 한다.
          하지만 인증 로직은 특성상(보안) 모호하게 전달해야 한다. 
          때문에 가입된 유저가 없는 것도, 인증에 실패하는 것도 동일하게 401로 처리한다.
          => 리턴이 null인 경우 local-strategy.ts에서 공통으로 throw new UnauthorizedException()처리한다.
      */
    }

    const isEqual: boolean = await bcrypt.compare(pass, user.password);
    if (!isEqual) {
      this.throwAuthException();
    }
    // Object Destructuring 기법 => result에는 password를 제외하고 담긴다.
    const { password, ...result } = user;
    return result;
  }

  /**
   * login 서비스
   * 1. DB에 엑세스 토큰이 존재하면, 로그아웃 실행(이중 로그인 방지)
   * 2. 엑세스 토큰 발행
   * 3. 리프레시 토큰 발행
   * 4. 엑세스, 리프레시 토큰 DB 저장
   * 5. 리턴
   * @param username
   * @returns {id, username, accessToken}
   */
  async login(username: string, user: User): Promise<any> {
    const { id, accessToken } = user;
    /* 이중 로그인 방지 */
    // 엑세스 토큰이 존재하면? 로그아웃 되지 않은 계정이다.
    if (accessToken) {
      // 로그아웃 실행
      await this.logout(id, accessToken);
    }
    const newAccessToken: string = this.issueAccessToken({ id, username });
    const newRefreshToken: string = this.issueRefreshToken();
    await this.userService.updateTokens(id, newAccessToken, newRefreshToken);

    // refresh 토큰은 DB에서 관리
    return {
      username,
      newAccessToken,
    };
  }

  /**
   * refresh 작업 - 엑세스 토큰 재발행
   * 1. 엑세스 토큰 확인
   * 2. id와 엑세스 토큰으로 유저 조회
   * 3. 조회한 유저가 가진 리프레쉬 토큰 유효한지 확인
   * 4. 유효하지 않다면? 로그아웃 로직 실행 후 에러를 발생
   * 5. 유효하다면? 엑세스 토큰 재발행
   * 6. 재발행한 토큰 DB에 저장
   * 7. 재발행한 토큰 리턴
   * @param username
   * @param accessToken
   * @returns {username, accessToken}
   */
  async refresh(username: string, token: string): Promise<any> {
    const accessToken: string | null = this.getAccessToken(token);
    if (!accessToken) {
      this.throwAuthException('accessToken이 잘못되었습니다.');
    }
    const user = await this.userService.findByToken(username, accessToken);
    if (!user) {
      this.throwAuthException();
    }
    const { id, refreshToken } = user;
    const isAlive = !!this.isRefreshTokenAlive(refreshToken);
    // 리프레쉬 토큰이 만료됬으면? 로그아웃 실행과 에러 발생
    if (!isAlive) {
      await this.logout(id, accessToken);
      // Q) 로그아웃 처리하는 이유는?
      // A) 엑세스 토큰 만료전 재발급 요청을 하는 경우도 예상해야 한다.
      // 때문에 리프레시 토큰이 만료면, 로그아웃 로직을 실행하고, 재로그인을 유도한다.
      this.throwAuthException();
    }
    // 리프레시 토큰이 유효하다면? 엑세스 토큰 재발행
    const newAccessToken = this.issueAccessToken({ id, username });
    // 재발행한 토큰 DB 저장
    await this.userService.updateTokens(id, accessToken, refreshToken);
    // 기존 엑세스 토큰은 블랙 리스트로 추가
    await this.setBlacklist(id, accessToken);

    return {
      username,
      accessToken: newAccessToken,
    };
  }

  /**
   * 로그아웃
   * 1. 로그아웃 요청한 유저 DB에서 토큰 제거
   * 2. 엑세스 토큰 블랙리스트로 등록
   * - 리프래시 토큰은 DB에서 관리했기 때문에 블랙리스트 등록 필요없음
   * @param id
   * @param accessToken
   */
  async logout(id: number, accessToken: string): Promise<void> {
    // DB에서 엑세스, 리프레시 토큰 제거   => refresh 로직 막기
    await this.userService.updateTokens(id, null, null);
    // 엑세스 토큰 블랙리스트 등록   => JwtAuthGuard의 jwt 인증로직 막기
    await this.setBlacklist(id, accessToken);
  }
}
