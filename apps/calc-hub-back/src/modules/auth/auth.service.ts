import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { type UserRole } from '../../common/constants/user-role';
import { DatabaseService } from '../../db/database.service';
import { users } from '../../db/schema';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const [created] = await this.dbService.db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName ?? null,
        role: 'USER',
      })
      .returning();

    return this.signTokens(created.id, created.email, this.normalizeUserRole(created.role));
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signTokens(user.id, user.email, this.normalizeUserRole(user.role));
  }

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.refreshByToken(dto.refreshToken);
  }

  async refreshByToken(refreshToken: string): Promise<TokenPair> {
    try {
      const secret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        'dev_refresh_secret';
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: UserRole;
      }>(refreshToken, { secret });
      return this.signTokens(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfileByUserId(userId: string): Promise<AuthUserProfile> {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? null,
      role: this.normalizeUserRole(user.role),
    };
  }

  oauthProviderLogin(provider: 'google' | 'vk'): {
    provider: string;
    status: string;
  } {
    return {
      provider,
      status:
        'endpoint is prepared, provider flow should be configured with client credentials',
    };
  }

  private async signTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenPair> {
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'dev_access_secret';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'dev_refresh_secret';
    const accessTtl = Number(
      this.configService.get<string>('JWT_ACCESS_TTL_SEC') ?? 900,
    );
    const refreshTtl = Number(
      this.configService.get<string>('JWT_REFRESH_TTL_SEC') ?? 2_592_000,
    );

    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshTtl,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private normalizeUserRole(role: string): UserRole {
    const normalized = role.toUpperCase();
    if (normalized === 'ADMIN' || normalized === 'PREMIUM' || normalized === 'USER') {
      return normalized;
    }
    return 'USER';
  }
}
