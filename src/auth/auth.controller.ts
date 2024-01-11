import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PasswordPipe } from './pipe/password.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // 헷갈릴 수 있는데 refresh로 access를 발급 받는 과정임. true로 하면 refresh로 refresh를 발급받는거고
    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('token/refresh')
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    // 헷갈릴 수 있는데 refresh로 access를 발급 받는 과정임. true로 하면 refresh로 refresh를 발급받는거고
    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('login/email')
  postLoginEmail(
    // *********************************************************
    @Headers('authorization') rawToken: string,
  ) {
    // token 추출
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    // token에서 사용자 정보 추출
    const credentials = this.authService.decodedBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    // 오!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    @Body('password', PasswordPipe) password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }
}