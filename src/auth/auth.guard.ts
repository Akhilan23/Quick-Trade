import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { JwtConstants } from 'src/utils/constants/app.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }
    const isTokenInvalid = await this.checkIfTokenInvalid(token);
    if (isTokenInvalid) {
      throw new UnauthorizedException('Invalid access token');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: JwtConstants.SECRET,
      });
      request['user'] = payload;
      request['token'] = token;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
    return true;
  }

  private async checkIfTokenInvalid(token: string): Promise<boolean> {
    const invalidTokens: Array<string> =
      (await this.cacheManager.get('INVALID_TOKENS')) || [];
    if (invalidTokens.indexOf(token) >= 0) return true;
    return false;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
