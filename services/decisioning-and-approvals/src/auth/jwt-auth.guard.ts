import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err, user, info) {
    if (err || !user) {
      console.error("JwtAuthGuard Error:", err);
      console.error("JwtAuthGuard Info:", info); // info contains the error message from passport-jwt (e.g. "invalid signature")
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
