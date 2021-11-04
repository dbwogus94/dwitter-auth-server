import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignupDto } from './dto/signup.dto';

@Controller('/auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('/signup')
  signup(@Body() body: SignupDto) {
    return this.userService.signup(body);
  }
}
