import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Version,
  Req,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get('/status')
  @Version('1')
  getHealthStatus(): any {
    return 'quick-trade orders service is running...';
  }

  @Post('/create')
  @Version('1')
  async createdOrder(
    @Req() request: Request,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<any> {
    try {
      const userId = request['user']?.userId || null;
      this.logger.log('request to create order', createOrderDto);
      const order = await this.ordersService.createOrder(
        userId,
        createOrderDto,
      );
      return {
        status: 'success',
        message: 'Successfully created order',
        data: order,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to create order',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }

  @Get('/:orderId')
  @Version('1')
  async getOrder(@Param('orderId') orderId: string): Promise<any> {
    try {
      const order = await this.ordersService.getOrderById(orderId);
      return {
        status: 'success',
        message: 'Successfully fetched order',
        data: order,
      };
    } catch (error) {
      this.logger.log('error', error);
      error.response = {
        ...error.response,
        message: 'Failed to fetch order',
        errorMessage: error.response.message,
      };
      throw error;
    }
  }
}
