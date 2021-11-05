import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
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
  async signup(singupDto: SignupDto): Promise<number> {
    const { username, password } = singupDto;
    const isExist: boolean = !!(await this.userService.findByUsername(
      username,
    ));
    if (isExist) {
      throw new ConflictException('username가 중복 되었습니다');
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
}
