import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ValidationPipeOptions } from 'src/config/options/validation-pipe.options';
import { apiBearerAuthName, apiOperations, apiResponse } from 'src/swagger-api-setting';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('Auth')
@ApiBadRequestResponse(apiResponse.common[400])
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe(ValidationPipeOptions))
  @Post('/signup')
  @ApiOperation(apiOperations.signup)
  @ApiResponse(apiResponse.signup[308])
  @ApiConflictResponse(apiResponse.signup[409])
  async signup(@Body() signupDto: SignupDto, @Res() res: Response): Promise<void> {
    await this.authService.signup(signupDto);
    return res.redirect(308, '/auth/login');
    // 308: GET이 아닌 링크/동작을 지닌, 웹 사이트의 재편성.
    // 301: GET 방식에 대한 웹 사이트의 재편성.
  }

  // local 전략을 사용하는 Guard는
  // local 전략에 사용되는 필드(username, password)에 한에서 빈값 체크를 한다.
  //  => 전략에 사용되는 필드는 LocalStrategy의 생성자 super를 통해 설정된다.
  // 그리고 Guard는 Pipe보다 먼저 실행된다,
  // 즉, 가드를 사용하면 필수 필드에 대해서는 ValidationPipe를 사용한 빈값 체크를 사용할 수 없다.
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiOperation(apiOperations.login)
  @ApiCreatedResponse(apiResponse.login[201])
  @ApiUnauthorizedResponse(apiResponse.login[401])
  async login(@Body() loginDto: LoginDto, @Req() req: any): Promise<any> {
    return this.authService.login(loginDto.username, req.user);
    // req.user LocalAuthGuard에서 생성
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiBearerAuth(apiBearerAuthName)
  @ApiOperation(apiOperations.me)
  @ApiOkResponse(apiResponse.me[200])
  @ApiUnauthorizedResponse(apiResponse.me[401])
  me(@Req() req): object {
    const { username, accessToken } = req.user; // JwtAuthGuard.handleRequest에서 생성
    return { username, accessToken };
  }

  //@UseGuards(JwtAuthGuard)를 사용할 수 없음
  // => refresh 작업은 access토큰이 만료여도 가드를 통과해야 하기 때문이다.
  @UsePipes(new ValidationPipe(ValidationPipeOptions))
  @Get('/refresh')
  @ApiBearerAuth(apiBearerAuthName)
  @ApiOperation(apiOperations.refresh)
  @ApiOkResponse(apiResponse.refresh[200])
  @ApiUnauthorizedResponse(apiResponse.refresh[401])
  async refresh(@Query() refreshDto: RefreshDto, @Req() req: Request): Promise<any> {
    // TODO: @Headers('authorization') token: string 제거, express 방식으로 변경
    // @Headers()를 사용하면 스웨거가 인식해서 docs에 적용함.
    return this.authService.refresh(refreshDto.username, req.headers.authorization);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  @HttpCode(204)
  @ApiBearerAuth(apiBearerAuthName)
  @ApiOperation(apiOperations.logout)
  @ApiNoContentResponse(apiResponse.logout[204])
  @ApiUnauthorizedResponse(apiResponse.logout[401])
  async logout(@Req() req): Promise<void> {
    const { id, accessToken } = req.user;
    await this.authService.logout(id, accessToken);
  }
}
