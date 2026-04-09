import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type UserRole } from '../../common/constants/user-role';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const accessCookieName =
      configService.get<string>('COOKIE_ACCESS_NAME') ?? 'numlix_access_token';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: { headers?: { cookie?: string } } | undefined) => {
          const cookieHeader = request?.headers?.cookie;
          if (!cookieHeader) {
            return null;
          }
          const parts = cookieHeader.split(';');
          for (const part of parts) {
            const [name, ...rest] = part.trim().split('=');
            if (name === accessCookieName) {
              return decodeURIComponent(rest.join('='));
            }
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret',
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
