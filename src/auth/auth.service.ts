import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.schema';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    try {
      this.logger.log('request to validate user', { username });
      const user: User = await this.userService.findByUsername(username);
      if (!user) {
        throw new NotFoundException('Invalid username');
      }
      const isPasswordValid = await this.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new NotFoundException('Invalid password');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(username: string, password: string) {
    try {
      this.logger.log('request to login', { username });
      const user: User = await this.validateUser(username, password);
      const payload: any = { userId: user._id, username: user.username };
      return {
        'x-access-token': this.jwtService.sign(payload),
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(token: string) {
    try {
      this.logger.log('request to logout', { token });
      const invalidTokens: Array<string> =
        (await this.cacheManager.get('INVALID_TOKENS')) || [];
      await this.cacheManager.set('INVALID_TOKENS', [...invalidTokens, token]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}
