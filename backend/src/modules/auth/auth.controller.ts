import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import type { AppConfig } from '../../config/configuration';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import {
  LoginResponseDto,
  PublicUserDto,
  RefreshResponseDto,
  RegisterResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { REFRESH_COOKIE, type RefreshContext } from './strategies/jwt-refresh.strategy';

interface RequestWithRefresh extends Request {
  user: RefreshContext;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Public()
  @Throttle({ default: { ttl: 3600_000, limit: 10 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a buyer or seller account' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: RegisterResponseDto })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    const { refreshToken, ...result } = await this.authService.register(dto);
    this.setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Throttle({ default: { ttl: 3600_000, limit: 10 } })
  @Post('register-seller')
  @ApiOperation({
    summary: 'Register a seller via the multi-step modal (account + business + initial catalog)',
  })
  @ApiBody({ type: RegisterSellerDto })
  @ApiOkResponse({ type: RegisterResponseDto })
  async registerSeller(
    @Body() dto: RegisterSellerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponseDto> {
    const { refreshToken, ...result } = await this.authService.registerSeller(dto);
    this.setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { refreshToken, ...result } = await this.authService.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Issue a new access+refresh pair using the refresh-token cookie' })
  @ApiOkResponse({ type: RefreshResponseDto })
  async refresh(
    @Req() req: RequestWithRefresh,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    const tokens = await this.authService.refresh(req.user.payload);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      expiresIn: tokens.accessExpiresIn,
    };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  @ApiOperation({ summary: 'Clear the refresh-token cookie' })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.clearRefreshCookie(res);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ type: PublicUserDto })
  async me(@CurrentUser() current: AuthenticatedUser): Promise<PublicUserDto> {
    const user = await this.usersService.findByIdOrFail(current.id);
    return this.authService.toPublicUser(user);
  }

  // ---- helpers ----
  private setRefreshCookie(res: Response, token: string): void {
    const isProd = this.config.get('nodeEnv', { infer: true }) === 'production';
    const refreshExpiration = this.config.get('jwt', { infer: true }).refreshExpiration;
    const maxAgeSec = this.authService.toSeconds(refreshExpiration);

    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSec * 1000,
    });
  }

  private clearRefreshCookie(res: Response): void {
    const isProd = this.config.get('nodeEnv', { infer: true }) === 'production';
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  }
}
