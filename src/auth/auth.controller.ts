import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { response, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { errorMessage, responseMessage } from '../response-messages';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiCreatedResponse({ description: responseMessage.signup[201] })
  @ApiConflictResponse({ description: errorMessage.signup[409] })
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
  @ApiCreatedResponse({ description: responseMessage.login[201] })
  @ApiUnauthorizedResponse({ description: errorMessage.login[401] })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiCreatedResponse({ description: responseMessage.me[200] })
  @ApiUnauthorizedResponse({ description: errorMessage.me[401] })
  me(@Req() req, @Headers('authorization') token: string) {
    const { username } = req.user; // JwtAuthGuard에서 생성
    const accessToken: string = token.split(' ')[1];
    return { username, accessToken };
  }

  @Get('/refresh')
  @ApiOkResponse({ description: responseMessage.refresh[200] })
  @ApiUnauthorizedResponse({ description: errorMessage.refresh[401] })
  refresh(
    @Query() refreshDto: RefreshDto,
    @Headers('authorization') token: string,
  ) {
    if (!token) throw new UnauthorizedException();
    const accessToken: string = token.split(' ')[1];
    return this.authService.refresh(refreshDto.username, accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  @HttpCode(204)
  @ApiNoContentResponse({ description: responseMessage.logout[204] })
  @ApiUnauthorizedResponse({ description: errorMessage.logout[401] })
  async logout(@Req() req, @Headers('authorization') token: string) {
    const { id } = req.user;
    const accessToken: string = token.split(' ')[1];
    await this.authService.logout(id, accessToken);
  }
}
