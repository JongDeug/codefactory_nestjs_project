import {
  Body,
  Controller,
  Post,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  MaxLengthPipe,
  MinLengthPipe,
  PasswordPipe,
} from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import {
  AccessTokenGuard,
  RefreshTokenGuard,
} from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from '../common/decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // 헷갈릴 수 있는데 refresh로 access를 발급 받는 과정임. true로 하면 refresh로 refresh를 발급받는거고
    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // 헷갈릴 수 있는데 refresh로 access를 발급 받는 과정임. true로 하면 refresh로 refresh를 발급받는거고
    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('login/email')
  @IsPublic()
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    // *********************************************************
    @Headers('authorization') rawToken: string,
    // @Request() req,
  ) {
    // token 추출
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    // token에서 사용자 정보 추출
    const credentials = this.authService.decodedBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  @IsPublic()
  postRegisterEmail(
    // @Body('nickname') nickname: string,
    // @Body('email') email: string,
    // // 오!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // @Body('password', new MaxLengthPipe(8), new MinLengthPipe(3))
    // password: string,
    @Body() body: RegisterUserDto,
  ) {
    return this.authService.registerWithEmail(body);
  }
}
