import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './entities/order.schema';

@Injectable()
export class OrdersRepository {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async findAll(params: any, configOptions: any = null): Promise<Order[]> {
    const queryObject = this.orderModel.find(params);
    if (configOptions?.isPopulateStock) {
      queryObject.populate('stockId');
    }
    return queryObject.exec();
  }

  async findOne(params: any): Promise<Order> {
    return this.orderModel.findOne(params);
  }

  async create(params: any): Promise<Order> {
    return this.orderModel.create(params);
  }

  async deleteAll(): Promise<any> {
    return this.orderModel.deleteMany({});
  }
}
