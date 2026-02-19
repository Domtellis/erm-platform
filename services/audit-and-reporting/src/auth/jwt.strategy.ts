import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            issuer: configService.get<string>('KEYCLOAK_ISSUER_URL'),
            algorithms: ['RS256'],
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: configService.get<string>('KEYCLOAK_JWKS_URL'),
            }),
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            username: payload.preferred_username,
            roles: payload.realm_access?.roles || []
        };
    }
}
