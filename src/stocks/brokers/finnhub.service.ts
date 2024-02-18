import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { AppConstants } from 'src/utils/constants/app.constants';
import { StockBroker, StockData } from './broker.interface';

export class FinnHubBroker implements StockBroker {
  constructor(private readonly httpService: HttpService) {}
  async getStockData(symbol: string): Promise<StockData> {
    const endPoint = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${AppConstants.FINNHUB_TOKEN}`;
    const response: any = await axios.get(endPoint);
    const stockData: StockData = {
      symbol: symbol,
      price: response.data.c + Math.floor(Math.random() * 100) + 1,
      volume: Math.floor(Math.random() * 100) + 1,
    };
    return stockData;
  }
}
