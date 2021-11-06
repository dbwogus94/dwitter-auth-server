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
}
