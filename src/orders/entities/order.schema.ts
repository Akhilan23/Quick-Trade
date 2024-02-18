import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';
import { OrderStatus } from './order-status';
import { OrderType } from './order-type';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  @Exclude()
  _id: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Stock', index: true })
  stockId: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, index: true })
  userId: any;

  @Prop({ enum: OrderType, index: true })
  type: string;

  @Prop({ default: OrderStatus.OPEN, index: true })
  status: string;

  @Prop()
  quantity: number;

  @Prop()
  stockPrice: number;

  @Prop()
  price: number;

  @Prop()
  createdAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
