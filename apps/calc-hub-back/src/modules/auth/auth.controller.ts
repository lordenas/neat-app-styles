import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { type Request, type Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { type AuthUser } from '../../common/interfaces/auth-user.interface';
import { AuthService, type AuthUserProfile } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Register user and return token pair' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      example: {
        accessToken: 'access.jwt.token',
        user: {
          id: 'user_id',
          email: 'user@example.com',
          fullName: 'User Name',
          role: 'USER',
        },
      },
    },
  })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.authService.register(dto);
    this.setAuthCookies(response, tokens, request);
    const user = await this.authService.getProfileByUserId(this.decodeSub(tokens.accessToken));
    return { accessToken: tokens.accessToken, user };
  }

  @ApiOperation({ summary: 'Login and return token pair' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'access.jwt.token',
        user: {
          id: 'user_id',
          email: 'user@example.com',
          fullName: 'User Name',
          role: 'USER',
        },
      },
    },
  })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.authService.login(dto);
    this.setAuthCookies(response, tokens, request);
    const user = await this.authService.getProfileByUserId(this.decodeSub(tokens.accessToken));
    return { accessToken: tokens.accessToken, user };
  }

  @ApiOperation({ summary: 'Refresh access/refresh tokens' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({
    description: 'Tokens refreshed',
    schema: {
      example: {
        accessToken: 'new.access.jwt.token',
        user: {
          id: 'user_id',
          email: 'user@example.com',
          fullName: 'User Name',
          role: 'USER',
        },
      },
    },
  })
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const refreshToken = dto.refreshToken ?? this.readRefreshTokenFromCookies(request);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    const tokens = await this.authService.refreshByToken(refreshToken);
    this.setAuthCookies(response, tokens, request);
    const user = await this.authService.getProfileByUserId(this.decodeSub(tokens.accessToken));
    return { accessToken: tokens.accessToken, user };
  }

  @ApiOperation({ summary: 'Return authenticated user profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Authenticated user profile returned' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<AuthUserProfile> {
    return this.authService.getProfileByUserId(user.id);
  }

  @ApiOperation({ summary: 'Clear auth refresh cookie' })
  @ApiNoContentResponse({ description: 'Logged out successfully' })
  @Post('logout')
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): void {
    const cookieOpts = this.getCookieOptions(request);
    response.clearCookie(this.getAccessCookieName(), {
      ...cookieOpts,
      maxAge: undefined,
    });
    response.clearCookie(this.getRefreshCookieName(), {
      ...cookieOpts,
      maxAge: undefined,
    });
    response.status(204).send();
  }

  @ApiOperation({ summary: 'OAuth login stub for Google' })
  @ApiOkResponse({
    schema: {
      example: {
        provider: 'google',
        status:
          'endpoint is prepared, provider flow should be configured with client credentials',
      },
    },
  })
  @Post('google')
  googleAuth() {
    return this.authService.oauthProviderLogin('google');
  }

  @ApiOperation({ summary: 'OAuth login stub for VK' })
  @ApiOkResponse({
    schema: {
      example: {
        provider: 'vk',
        status:
          'endpoint is prepared, provider flow should be configured with client credentials',
      },
    },
  })
  @Post('vk')
  vkAuth() {
    return this.authService.oauthProviderLogin('vk');
  }

  private decodeSub(accessToken: string): string {
    const payloadPart = accessToken.split('.')[1];
    if (!payloadPart) {
      throw new UnauthorizedException('Invalid access token');
    }
    const parsed = JSON.parse(Buffer.from(payloadPart, 'base64url').toString()) as {
      sub?: string;
    };
    if (!parsed.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return parsed.sub;
  }

  private setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
    request: Request,
  ): void {
    const accessTtlSec = Number(
      this.configService.get<string>('JWT_ACCESS_TTL_SEC') ?? 900,
    );
    const refreshTtlSec = Number(
      this.configService.get<string>('JWT_REFRESH_TTL_SEC') ?? 2_592_000,
    );
    const cookieOpts = this.getCookieOptions(request);
    response.cookie(this.getAccessCookieName(), tokens.accessToken, {
      ...cookieOpts,
      maxAge: accessTtlSec * 1000,
    });
    response.cookie(this.getRefreshCookieName(), tokens.refreshToken, {
      ...cookieOpts,
      maxAge: refreshTtlSec * 1000,
    });
  }

  private readRefreshTokenFromCookies(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }
    const cookieName = this.getRefreshCookieName();
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [name, ...rest] = part.trim().split('=');
      if (name === cookieName) {
        return decodeURIComponent(rest.join('='));
      }
    }
    return undefined;
  }

  private getRefreshCookieName(): string {
    return this.configService.get<string>('COOKIE_REFRESH_NAME') ?? 'numlix_refresh_token';
  }

  private getAccessCookieName(): string {
    return this.configService.get<string>('COOKIE_ACCESS_NAME') ?? 'numlix_access_token';
  }

  private getCookieOptions(request: Request): {
    domain?: string;
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
  } {
    const sameSiteRaw = (this.configService.get<string>('COOKIE_SAMESITE') ?? 'lax').toLowerCase();
    const sameSite: 'lax' | 'strict' | 'none' =
      sameSiteRaw === 'none' || sameSiteRaw === 'strict' ? sameSiteRaw : 'lax';
    const domain = this.configService.get<string>('COOKIE_DOMAIN') ?? undefined;
    let secure = this.resolveCookieSecure(request);
    if (sameSite === 'none' && !secure) {
      secure = true;
    }
    return {
      domain,
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    };
  }

  /** Запрос к API через HTTPS-терминацию (Caddy): нужен Secure-cookie и согласованная схема с фронтом. */
  private isHttpsRequest(request: Request): boolean {
    const forwarded = request.get('x-forwarded-proto');
    if (forwarded?.split(',')[0]?.trim() === 'https') {
      return true;
    }
    return request.secure === true;
  }

  /** COOKIE_SECURE=true | false | auto (по умолчанию) — auto: Secure только если запрос пришёл как HTTPS за прокси. */
  private resolveCookieSecure(request: Request): boolean {
    const raw = (this.configService.get<string>('COOKIE_SECURE') ?? 'auto').toLowerCase();
    if (raw === 'true') {
      return true;
    }
    if (raw === 'false') {
      return false;
    }
    return this.isHttpsRequest(request);
  }
}

interface AuthResponse {
  accessToken: string;
  user: AuthUserProfile;
}
