import { Controller, Get, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { WalletsService } from './wallets/wallets.service';
import { StocksService } from './stocks/stocks.service';
import { OrdersService } from './orders/orders.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
    private readonly stocksService: StocksService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/status')
  @Version('1')
  getHealthStatus(): any {
    return 'quick-trade service is running...';
  }

  @Get('/delete')
  @Version('1')
  deleteAllData(): any {
    this.usersService.deleteAllData();
    this.walletsService.deleteAllData();
    this.stocksService.deleteAllData();
    this.ordersService.deleteAllData();
    return true;
  }
}
