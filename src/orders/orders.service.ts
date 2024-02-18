import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersRepository } from './orders.repository';
import mongoose from 'mongoose';
import { StocksService } from 'src/stocks/stocks.service';
import { Stock } from 'src/stocks/entities/stock.schema';
import { OrderType } from './entities/order-type';
import { AppConstants } from 'src/utils/constants/app.constants';
import { WalletsService } from 'src/wallets/wallets.service';
import { OrderStatus } from './entities/order-status';
import { HoldingsService } from 'src/holdings/holdings.service';
import { Order } from './entities/order.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly stocksService: StocksService,
    private readonly walletsService: WalletsService,
    @Inject(forwardRef(() => HoldingsService))
    private readonly holdingsService: HoldingsService,
  ) {}

  async getOrderById(orderId: string): Promise<any> {
    const order = await this.ordersRepository.findOne({
      _id: new mongoose.Types.ObjectId(orderId),
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.getOrderView(order);
  }

  private getOrderView(order: any) {
    const orderView = {
      orderId: order._id,
      userId: order.userId,
      stockId: order.stockId,
      type: order.type,
      status: order.status,
      quantity: order.quantity,
      price: order.price,
    };
    return orderView;
  }

  async getOrdersByUserId(userId: string): Promise<any> {
    return this.ordersRepository.findAll({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async getOrdersByUserIdWithStocks(userId: string): Promise<any> {
    return this.getOrdersWithStocks({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async getOrdersWithStocks(params: any): Promise<any> {
    return this.ordersRepository.findAll(params, { isPopulateStock: true });
  }

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<any> {
    this.logger.log('request to create order', { ...createOrderDto, userId });
    const { stockSymbol, type, quantity, price } = createOrderDto;
    const stock = await this.stocksService.getStockBySymbol(stockSymbol);
    if (!stock) throw new NotFoundException('Stock not found');

    if (type === OrderType.BUY) {
      return this.buyStock(userId, stock, quantity);
    } else {
      return this.sellStock(userId, stock, quantity);
    }
  }

  async buyStock(
    userId: string,
    stock: Stock,
    buyQuantity: number,
  ): Promise<any> {
    // check if enough stock quantity
    if (stock.quantity < buyQuantity)
      throw new BadRequestException('Insufficient stock quantity');

    // check if enough wallet balance
    const wallet = await this.walletsService.getWalletByUserId(userId);
    const totalPrice = stock.price * buyQuantity;
    if (wallet.balance < totalPrice)
      throw new BadRequestException('Insufficient wallet balance');

    const payload = {
      userId,
      stockId: stock._id,
      quantity: buyQuantity,
      type: OrderType.BUY,
      stockPrice: stock.price,
      price: totalPrice,
      status: OrderStatus.EXECUTED,
    };
    const order = await this.ordersRepository.create(payload);
    await this.stocksService.decreaseStockQuantity(stock._id, buyQuantity);
    await this.walletsService.withdrawMoney(userId, totalPrice);
    return this.getOrderView(order);
  }

  async sellStock(
    userId: string,
    stock: Stock,
    sellQuantity: number,
  ): Promise<any> {
    const queryObject = {
      userId: new mongoose.Types.ObjectId(userId),
      stockId: new mongoose.Types.ObjectId(stock._id),
    };
    const allOrders: Array<Order> = await this.getOrdersWithStocks(queryObject);

    // check if enough stock quantity in holdings to sell
    const currentHoldingQuantity =
      this.holdingsService.getCurrentHoldingQuantity(allOrders, stock.symbol);
    console.log('----- currentHoldingQuantity', currentHoldingQuantity);
    if (currentHoldingQuantity < sellQuantity)
      throw new BadRequestException('Insufficient stock quantity in holding');

    const currentHoldingValue = this.holdingsService.getCurrentHoldingValue(
      allOrders,
      stock.symbol,
    );
    const totalPrice =
      (currentHoldingValue * sellQuantity) / currentHoldingQuantity;

    const payload = {
      userId,
      stockId: stock._id,
      quantity: sellQuantity,
      type: OrderType.SELL,
      stockPrice: stock.price,
      price: totalPrice,
      status: OrderStatus.EXECUTED,
    };
    const order = await this.ordersRepository.create(payload);
    await this.stocksService.increaseStockQuantity(stock._id, sellQuantity);
    await this.walletsService.depositMoney(userId, totalPrice);
    return this.getOrderView(order);
  }

  async deleteAllData() {
    return this.ordersRepository.deleteAll();
  }
}
