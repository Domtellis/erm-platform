import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            issuer: 'http://localhost:8080/realms/erm-platform',
            algorithms: ['RS256'],
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: 'http://localhost:8080/realms/erm-platform/protocol/openid-connect/certs',
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
