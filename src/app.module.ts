import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
// import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { WalletsModule } from './wallets/wallets.module';
import { StocksModule } from './stocks/stocks.module';
import { OrdersModule } from './orders/orders.module';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './utils/tasks/tasks.service';
import { AppConstants } from './utils/constants/app.constants';
import { HoldingsModule } from './holdings/holdings.module';

@Module({
  imports: [
    MongooseModule.forRoot(AppConstants.DB_URI),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: AppConstants.CACHE_HOST,
      port: AppConstants.CACHE_PORT,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    WalletsModule,
    StocksModule,
    OrdersModule,
    HoldingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TasksService],
})
export class AppModule {}
