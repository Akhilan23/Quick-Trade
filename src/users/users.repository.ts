import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(params: any): Promise<User> {
    return this.userModel.findOne(params);
  }

  async create(params: any): Promise<User> {
    return this.userModel.create(params);
  }

  async deleteAll(): Promise<any> {
    return this.userModel.deleteMany({});
  }
}
