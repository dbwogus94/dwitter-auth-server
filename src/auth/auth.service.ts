import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {}

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

    return this.userService.createUser({
      ...singupDto,
      password: hashed,
    });
  }

  async login(loginDto: LoginDto): Promise<any> {}

  async validateUser(username: string, pass: string): Promise<object | null> {
    const user = await this.userService.findByUsername(username);
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

    const isEqual = await bcrypt.compare(pass, user.password);
    if (isEqual) {
      // Object Destructuring 기법
      const { password, ...result } = user;
      return result;
      // result에는 password를 제외하고 담긴다.
    }
    return null;
  }
}
