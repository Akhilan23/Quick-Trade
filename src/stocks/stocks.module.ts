import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { StocksRepository } from './stocks.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, StockSchema } from './entities/stock.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    HttpModule,
  ],
  controllers: [StocksController],
  providers: [StocksService, StocksRepository],
  exports: [StocksService],
})
export class StocksModule {}
