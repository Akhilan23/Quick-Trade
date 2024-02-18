import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { StocksRepository } from './stocks.repository';
import mongoose from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FinnHubBroker } from './brokers/finnhub.service';
import { HttpService } from '@nestjs/axios';
import { StockBroker } from './brokers/broker.interface';

@Injectable()
export class StocksService {
  private stockBroker: StockBroker;

  constructor(
    private readonly stocksRepository: StocksRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {
    this.stockBroker = new FinnHubBroker(this.httpService);
  }

  loadStocks() {
    const stockData: Array<any> = [
      {
        name: 'Alphabet Inc.',
        symbol: 'GOOGL',
      },
      {
        name: 'Amazon.com, Inc.',
        symbol: 'AMZN',
      },
      {
        name: 'IBM Systems Ltd',
        symbol: 'IBM',
      },
      {
        name: 'Apple Inc',
        symbol: 'AAPL',
      },
      {
        name: 'Microsoft Corporation',
        symbol: 'MSFT',
      },
    ];
    this.cacheManager.set(
      'STOCK_SYMBOLS',
      stockData.map((e) => e.symbol),
    );
    stockData.forEach((stock) => {
      this.stocksRepository.create(stock);
    });
    return true;
  }

  async updateData(): Promise<any> {
    const stockSymbols: Array<string> =
      await this.cacheManager.get('STOCK_SYMBOLS');
    stockSymbols.forEach(async (symbol) => {
      this.stockBroker.getStockData(symbol).then((response) => {
        this.stocksRepository.update(
          { symbol: symbol },
          {
            price: response.price,
            quantity: response.volume,
          },
        );
      });
    });
  }

  async listStocks(): Promise<any> {
    const allStocks = await this.stocksRepository.findAll({});
    return allStocks.map((stock) => this.getStockView(stock));
  }

  async increaseStockQuantity(stockId: string, quantity: number): Promise<any> {
    const stock = await this.getStockById(stockId);
    if (!stock) throw new BadRequestException('Stock not found');
    const updatedQuantity = stock.quantity + quantity;
    return this.stocksRepository.update(
      { _id: new mongoose.Types.ObjectId(stockId) },
      { quantity: updatedQuantity },
    );
  }

  async decreaseStockQuantity(stockId: string, quantity: number): Promise<any> {
    const stock = await this.getStockById(stockId);
    if (!stock) throw new BadRequestException('Stock not found');
    if (quantity > stock.quantity)
      throw new BadRequestException('Insufficient quantity');
    const updatedQuantity = stock.quantity - quantity;
    return this.stocksRepository.update(
      { _id: new mongoose.Types.ObjectId(stockId) },
      { quantity: updatedQuantity },
    );
  }

  async getStockById(stockId: string): Promise<any> {
    return this.stocksRepository.findOne({
      _id: new mongoose.Types.ObjectId(stockId),
    });
  }

  async getStockBySymbol(stockSymbol: string): Promise<any> {
    return this.stocksRepository.findOne({
      symbol: stockSymbol,
    });
  }

  async getStocksById(stockIds: Array<string>): Promise<any> {
    const stockObjectIds = stockIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    return this.stocksRepository.findAll({
      _id: { $in: stockObjectIds },
    });
  }

  private getStockView(stock: any) {
    const stockView = {
      stockId: stock._id,
      name: stock.name,
      symbol: stock.symbol,
      quantity: stock.quantity,
      price: stock.price,
    };
    return stockView;
  }

  async deleteAllData() {
    return this.stocksRepository.deleteAll();
  }
}
