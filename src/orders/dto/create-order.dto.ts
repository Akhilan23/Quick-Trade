import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { OrderType } from '../entities/order-type';
import mongoose from 'mongoose';

export class CreateOrderDto {
  @IsOptional()
  userId: mongoose.Types.ObjectId;

  @IsNotEmpty()
  stockSymbol: string;

  @IsNotEmpty()
  @IsEnum(OrderType)
  type: string;

  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  price?: number;
}
