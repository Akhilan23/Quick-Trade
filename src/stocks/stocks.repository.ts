import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock } from './entities/stock.entity';

@Injectable()
export class StocksRepository {
  constructor(@InjectModel(Stock.name) private stockModel: Model<Stock>) {}

  async findAll(params: any): Promise<Stock[]> {
    return this.stockModel.find(params).exec();
  }

  async findOne(params: any): Promise<Stock> {
    return this.stockModel.findOne(params);
  }

  async create(params: any): Promise<Stock> {
    return this.stockModel.create(params);
  }

  async update(params: any, data: any): Promise<Stock> {
    return this.stockModel.findOneAndUpdate(params, data);
  }

  async deleteAll(): Promise<any> {
    return this.stockModel.deleteMany({});
  }
}
