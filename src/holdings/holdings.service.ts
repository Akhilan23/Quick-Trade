import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { OrdersService } from 'src/orders/orders.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { Order } from 'src/orders/entities/order.schema';
import { Wallet } from 'src/wallets/entities/wallet.schema';
import { User } from 'src/users/entities/user.schema';
import { OrderType } from 'src/orders/entities/order-type';

@Injectable()
export class HoldingsService {
  private readonly logger = new Logger(HoldingsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly walletsService: WalletsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async getUserPortfolio(userId: string): Promise<any> {
    this.logger.debug('request to get user holdings', { userId });
    const user: User = await this.usersService.findByUserId(userId);
    if (!user) throw new NotFoundException('User not found');
    const wallet: Wallet = await this.walletsService.getWalletByUserId(userId);
    const allOrders: Array<Order> =
      await this.ordersService.getOrdersByUserIdWithStocks(userId);
    const orders = this.getOrders(allOrders);
    const holdings = this.getHoldings(allOrders);

    const userPortfolioView = {
      user: {
        userId: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      wallet: {
        balance: wallet.balance,
      },
      holdings: holdings,
      orders: orders,
    };
    return userPortfolioView;
  }

  getCurrentHoldingQuantity(orders: Array<Order>, stockSymbol: string) {
    const ordersGroupedBySymbol = this.getHoldings(orders);
    return (
      ordersGroupedBySymbol.find((e) => e.stockSymbol === stockSymbol)
        ?.quantity || 0
    );
  }

  getCurrentHoldingValue(orders: Array<Order>, stockSymbol: string) {
    const ordersGroupedBySymbol = this.getHoldings(orders);
    return (
      ordersGroupedBySymbol.find((e) => e.stockSymbol === stockSymbol)?.net || 0
    );
  }

  private getOrders(orders: Array<Order>) {
    return orders
      .map((order) => ({
        orderId: order._id,
        stockName: order.stockId.name,
        stockSymbol: order.stockId.symbol,
        status: order.status,
        type: order.type,
        quantity: order.quantity,
        stockPrice: order.stockPrice,
        price: order.price,
        createdAt: order.createdAt,
      }))
      .sort((a, b) => {
        if (a.createdAt < b.createdAt) return -1;
        else return 1;
      });
  }

  private getHoldings(orders: Array<Order>) {
    const stockSymbolOrdersMap: any = orders.reduce((current, order) => {
      const { quantity, stockPrice, stockId, type } = order;
      const { symbol, name, price } = stockId;

      if (!current[symbol]) {
        current[symbol] = {
          stockSymbol: symbol,
          stockName: name,
          quantity: 0,
          lastTradedPrice: price,
          net: 0,
          buyOrders: [],
          sellOrders: [],
        };
      }
      current[symbol] = {
        ...current[symbol],
        lastTradedPrice: price,
        quantity:
          type === OrderType.BUY
            ? current[symbol].quantity + quantity
            : current[symbol].quantity - quantity,
        buyOrders:
          type === OrderType.BUY
            ? [
                ...current[symbol].buyOrders,
                {
                  quantity,
                  stockPrice,
                  orderPrice: order.price,
                },
              ]
            : [...current[symbol].buyOrders],
        sellOrders:
          type === OrderType.SELL
            ? [
                ...current[symbol].sellOrders,
                {
                  quantity,
                  stockPrice,
                  orderPrice: order.price,
                },
              ]
            : [...current[symbol].sellOrders],
      };

      return current;
    }, {});
    const groupedOrders: Array<any> = Object.values(stockSymbolOrdersMap)
      .filter((stock: any) => stock.quantity > 0)
      .sort((a: any, b: any) => (a.stockSymbol < b.stockSymbol ? -1 : 1));

    return this.getHoldingsUsingAverageStrategy(groupedOrders);
  }

  private getHoldingsUsingAverageStrategy(groupedOrders: Array<any>) {
    return groupedOrders.map((stock: any) => {
      const net =
        stock.net +
        stock.sellOrders.reduce((sum, current) => sum + current.orderPrice, 0) -
        stock.buyOrders.reduce((sum, current) => sum + current.orderPrice, 0);
      delete stock.buyOrders;
      delete stock.sellOrders;
      return {
        ...stock,
        net: stock.quantity * stock.lastTradedPrice + net,
      };
    });
  }

  private getHoldingsUsingFIFOStrategy(groupedOrders: Array<any>) {
    return groupedOrders.map((stock: any) => {
      let net = 0;
      let sellIndex = 0,
        buyIndex = 0;
      const buyOrders: Array<any> = stock.buyOrders;
      const sellOrders: Array<any> = stock.sellOrders;
      while (sellOrders[sellIndex] != null || buyOrders[buyIndex] != null) {
        const sellOrder = sellOrders[sellIndex];
        const buyOrder = buyOrders[buyIndex];
        if (sellOrder && buyOrder) {
          if (buyOrder.quantity == sellOrder.quantity) {
            net = net + sellOrder.orderPrice - buyOrder.orderPrice;
            sellIndex += 1;
            buyIndex += 1;
          } else if (buyOrder.quantity > sellOrder.quantity) {
            const difference = buyOrder.quantity - sellOrder.quantity;
            net =
              net +
              (sellOrder.quantity * sellOrder.stockPrice -
                sellOrder.quantity * buyOrder.stockPrice);
            buyOrders.splice(buyIndex + 1, 0, {
              ...buyOrder,
              quantity: difference,
            });
            buyIndex += 1;
          } else {
            const difference = sellOrder.quantity - buyOrder.quantity;
            net =
              net +
              (buyOrder.quantity * sellOrder.stockPrice -
                buyOrder.quantity * buyOrder.stockPrice);
            sellOrder.splice(sellIndex + 1, 0, {
              ...sellOrder,
              quantity: difference,
            });
          }
        } else if (sellOrder) {
          net = net + sellOrder.orderPrice;
          sellIndex += 1;
        } else if (buyOrder) {
          net = net - buyOrder.orderPrice;
          buyIndex += 1;
        }
      }
      delete stock.buyOrders;
      delete stock.sellOrders;
      return {
        ...stock,
        net: stock.quantity * stock.lastTradedPrice + net,
      };
    });
  }
}
