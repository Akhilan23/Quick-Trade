import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { StocksService } from 'src/stocks/stocks.service';
import { AppConstants } from '../constants/app.constants';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly stocksService: StocksService) {}

  @Timeout(2000)
  async loadStocks() {
    this.logger.debug('loading all stocks and symbols');
    await this.stocksService.deleteAllData();
    return this.stocksService.loadStocks();
  }

  @Interval(AppConstants.FETCH_CALL_LATENCY)
  fetchData() {
    this.logger.debug('updating all stock data');
    return this.stocksService.updateData();
  }
}
