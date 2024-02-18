import {
  Controller,
  Get,
  Post,
  Body,
  Version,
  UseGuards,
  HttpCode,
  Req,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('/status')
  @Version('1')
  getHealthStatus(): any {
    return 'quick-trade users service is running...';
  }

  @HttpCode(201)
  @Post('register')
  @Version('1')
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<any> {
    try {
      this.logger.log('registerUserDto', registerUserDto);
      const user = await this.usersService.registerUser(registerUserDto);
      return {
        status: 'success',
        message: 'Successfully created user',
        data: user,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to register user',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }

  @HttpCode(200)
  @Post('login')
  @Version('1')
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    try {
      this.logger.log('loginUserDto', loginUserDto);
      const response = await this.usersService.loginUser(loginUserDto);
      this.logger.log('response', response);
      return {
        status: 'success',
        message: 'Successfully logged in user',
        data: response,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to login',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(30)
  @HttpCode(200)
  @Get('/view')
  @Version('1')
  async getUser(@Req() request: Request): Promise<any> {
    try {
      this.logger.log('request to get user');
      const user = request['user'];
      const userView = await this.usersService.getUser(user.userId);
      return {
        status: 'success',
        message: 'Successfully fetched user',
        data: userView,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to get user',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Post('/logout')
  @Version('1')
  async logout(@Req() request: Request): Promise<any> {
    try {
      this.logger.log('request to logout user');
      const token: string = request['token'];
      await this.usersService.logoutUser(token);
      return {
        status: 'success',
        message: 'Successfully logged out user',
        data: null,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to logout user',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }
}
