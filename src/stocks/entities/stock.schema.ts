import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Stock {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: any;

  @Prop()
  name: string;

  @Prop({ unique: true })
  symbol: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
