import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './entities/wallet.schema';

@Injectable()
export class WalletsRepository {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  async findAll(): Promise<Wallet[]> {
    return this.walletModel.find().exec();
  }

  async findOne(params: any): Promise<Wallet> {
    return this.walletModel.findOne(params);
  }

  async create(params: any): Promise<Wallet> {
    return this.walletModel.create(params);
  }

  async update(params: any, data: any): Promise<Wallet> {
    return this.walletModel.findOneAndUpdate(params, data);
  }

  async deleteAll(): Promise<any> {
    return this.walletModel.deleteMany({});
  }
}
