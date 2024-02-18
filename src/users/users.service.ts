import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersRepository } from './users.repository';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { User } from './entities/user.schema';
import { WalletsService } from 'src/wallets/wallets.service';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly walletsService: WalletsService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<any> {
    try {
      const { firstName, lastName, email, username } = registerUserDto;
      this.logger.debug('request to register user', {
        firstName,
        lastName,
        email,
        username,
      });
      const isEmailExists: boolean = await this.checkIfEmailExists(email);
      if (isEmailExists) {
        throw new BadRequestException('Email already exists');
      }
      const isUsernameExists: boolean =
        await this.checkIfUsernameExists(username);
      if (isUsernameExists) {
        throw new BadRequestException('Username exists already');
      }
      const newUser: User = await this.create(registerUserDto);
      const userView = this.getUserView(newUser);
      return userView;
    } catch (error) {
      throw error;
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<any> {
    try {
      const { username, password } = loginUserDto;
      this.logger.debug('request to login user', { username });
      return this.authService.login(username, password);
    } catch (error) {
      throw error;
    }
  }

  async logoutUser(token: string): Promise<any> {
    this.logger.debug('request to logout user', { token });
    return this.authService.logout(token);
  }

  async getUser(userId: string): Promise<any> {
    this.logger.debug('request to get user view', { userId });
    const user = await this.findByUserId(userId);
    if (!user) throw new NotFoundException('User not found');

    const wallet = await this.walletsService.getWalletByUserId(userId);
    Object.assign(user, { wallet: wallet });
    const userView = this.getUserView(user);

    this.logger.debug('response to get user view', { userView, userId });
    return userView;
  }

  private getUserView(user: any): any {
    return {
      userId: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      wallet: {
        balance: user.wallet?.balance,
      },
    };
  }

  private async checkIfEmailExists(email: string): Promise<any> {
    this.logger.debug('request to check if email exists', { email });
    const user: User = await this.findByEmail(email);
    this.logger.debug('response to check if email exists', { user, email });
    return user != null;
  }

  private async checkIfUsernameExists(username: string): Promise<any> {
    this.logger.debug('request to check if username exists', { username });
    const user = await this.findByUsername(username);
    this.logger.debug('response to check if username exists', {
      user,
      username,
    });
    return user != null;
  }

  private async create(newUserDto: RegisterUserDto): Promise<any> {
    try {
      const { firstName, lastName, email, username } = newUserDto;
      this.logger.debug('request to create new user', {
        firstName,
        lastName,
        email,
        username,
      });
      const user = await this.usersRepository.create(newUserDto);
      const wallet = await this.walletsService.createWallet(user._id);
      Object.assign(user, { wallet: wallet });
      this.logger.debug('response to create new user', { user });
      return user;
    } catch (error) {
      return error;
    }
  }

  async findByEmail(email: string): Promise<any> {
    try {
      this.logger.debug('request to find a user by email', { email });
      const queryParams = { email: email };
      const response = await this.findOne(queryParams);
      this.logger.debug('response to find a user by email', {
        response,
        email,
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async findByUsername(username: string): Promise<any> {
    try {
      this.logger.debug('request to find a user by username', { username });
      const queryParams = { username: username };
      const response = await this.findOne(queryParams);
      this.logger.debug('response to find a user by username', {
        response,
        username,
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async findByUserId(userId: string): Promise<any> {
    try {
      this.logger.debug('request to find a user by id', { userId });
      const queryParams = { _id: userId };
      const response = await this.findOne(queryParams);
      this.logger.debug('response to find a user by user id', {
        response,
        userId,
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  private async findOne(params: any): Promise<any> {
    try {
      this.logger.debug('request to find a user', { params });
      const response = await this.usersRepository.findOne(params);
      this.logger.debug('response to find a user', { response, params });
      return response;
    } catch (error) {
      return error;
    }
  }

  async deleteAllData() {
    return this.usersRepository.deleteAll();
  }
}
