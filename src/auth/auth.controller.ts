import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Redirect,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Response } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() body: SignupDto, @Res() res: Response) {
    await this.authService.signup(body);
    return res.redirect(308, '/auth/login');
    // 308: GET이 아닌 링크/동작을 지닌, 웹 사이트의 재편성.
    // 301: GET 방식에 대한 웹 사이트의 재편성.
  }

  @Post('/login')
  login() {
    //this.authService.login(body);
    return { text: '로그인' };
  }
}
