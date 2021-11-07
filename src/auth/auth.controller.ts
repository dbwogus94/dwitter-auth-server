import {
  Body,
  Controller,
  Get,
  Headers,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() signupDto: SignupDto, @Res() res: Response) {
    await this.authService.signup(signupDto);
    return res.redirect(308, '/auth/login');
    // 308: GET이 아닌 링크/동작을 지닌, 웹 사이트의 재편성.
    // 301: GET 방식에 대한 웹 사이트의 재편성.
  }

  // Guard는 빈값 체크를 한다. 빈값이면 401에러를 내보낸다.
  // Guard는 Pipe보다 먼저 실행된다,
  // 즉, 가드를 사용하면 ValidationPipe를 사용한 빈값 체크를 사용할 수 없다
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username);
  }

  @Get('/refresh') // 인증 헤더에 있는 access jwt 가져온다.
  refresh(
    @Query('id', new ParseIntPipe()) id: number,
    @Headers('authorization') token: string,
  ) {
    if (!token) throw new UnauthorizedException();
    const accessToken: string = token.split(' ')[1];
    return this.authService.refresh(id, accessToken);
  }
}
