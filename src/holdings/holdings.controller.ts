import {
  Controller,
  Get,
  Logger,
  Version,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('holdings')
@UseGuards(AuthGuard)
export class HoldingsController {
  private readonly logger = new Logger(HoldingsController.name);

  constructor(private readonly holdingsService: HoldingsService) {}

  @Get('/status')
  @Version('1')
  getHealthStatus(): any {
    return 'quick-trade holdings service is running...';
  }

  @HttpCode(200)
  @Get('/view')
  @Version('1')
  async getHoldings(@Req() request: Request): Promise<any> {
    try {
      this.logger.log('request to fetch user holdings');
      const userId = request['user']?.userId;
      const result = await this.holdingsService.getUserPortfolio(userId);
      return {
        status: 'success',
        message: 'Successfully fetched user holdings',
        data: result,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to fetch user holdings',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }
}
