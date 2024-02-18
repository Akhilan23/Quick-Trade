import { Module, forwardRef } from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { HoldingsController } from './holdings.controller';
import { UsersModule } from 'src/users/users.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [UsersModule, WalletsModule, forwardRef(() => OrdersModule)],
  controllers: [HoldingsController],
  providers: [HoldingsService],
  exports: [HoldingsService],
})
export class HoldingsModule {}
