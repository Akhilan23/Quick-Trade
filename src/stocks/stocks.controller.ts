import {
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('stocks')
@UseGuards(AuthGuard)
export class StocksController {
  private readonly logger = new Logger(StocksController.name);

  constructor(private readonly stocksService: StocksService) {}

  @Get('/status')
  @Version('1')
  getHealthStatus(): any {
    return 'quick-trade stocks service is running...';
  }

  @Get('/list')
  @Version('1')
  listStocks() {
    return this.stocksService.listStocks();
  }
}
