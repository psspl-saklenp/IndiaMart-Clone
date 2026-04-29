import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AppConfig } from '../../../config/configuration';
import type { JwtRefreshPayload } from '../types/jwt-payload.interface';

export const REFRESH_COOKIE = 'refresh_token';

export interface RefreshContext {
  payload: JwtRefreshPayload;
  rawToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => req?.cookies?.[REFRESH_COOKIE] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt', { infer: true }).refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtRefreshPayload): RefreshContext {
    const rawToken = req?.cookies?.[REFRESH_COOKIE];
    if (!rawToken || !payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { payload, rawToken };
  }
}
