import {
  Controller,
  Get,
  Post,
  Body,
  Version,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('wallets')
@UseGuards(AuthGuard)
export class WalletsController {
  private readonly logger = new Logger(WalletsController.name);

  constructor(private readonly walletsService: WalletsService) {}

  @Get('/status')
  @Version('1')
  getHealthStatus(): any {
    return 'quick-trade wallets service is running...';
  }

  @HttpCode(200)
  @Post('/deposit')
  @Version('1')
  async depositMoney(@Req() request: Request, @Body() body: any): Promise<any> {
    try {
      const userId = request['user']?.userId;
      const { amount } = body;
      if (!amount) throw new BadRequestException('Amount not found');
      await this.walletsService.depositMoney(userId, amount);
      return {
        status: 'success',
        message: 'Successfully deposited money',
        data: null,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to deposit money',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }

  @HttpCode(200)
  @Post('/withdraw')
  @Version('1')
  async withdrawMoney(
    @Req() request: Request,
    @Body() body: any,
  ): Promise<any> {
    try {
      const userId = request['user']?.userId;
      const { amount } = body;
      if (!amount) throw new BadRequestException('Amount not found');
      await this.walletsService.withdrawMoney(userId, amount);
      return {
        status: 'success',
        message: 'Successfully withdrawed money',
        data: null,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to withdraw money',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }
}
