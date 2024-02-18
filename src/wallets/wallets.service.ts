import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { WalletsRepository } from './wallets.repository';
import { Wallet } from './entities/wallet.schema';
import mongoose from 'mongoose';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(private readonly walletsRepository: WalletsRepository) {}

  createWallet(userId: string): Promise<Wallet> {
    this.logger.log('request to create new wallet', { userId });
    const payload = {
      userId: userId,
      balance: 0.0,
    };
    return this.walletsRepository.create(payload);
  }

  getWalletByUserId(userId: string): Promise<Wallet> {
    return this.walletsRepository.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  async depositMoney(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) throw new BadRequestException('Wallet not found');
    const updatedBalance = wallet.balance + amount;
    return this.walletsRepository.update(
      { userId: new mongoose.Types.ObjectId(userId) },
      { balance: updatedBalance },
    );
  }

  async withdrawMoney(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) throw new BadRequestException('Wallet not found');
    if (amount > wallet.balance)
      throw new BadRequestException('Insufficient balance');
    const updatedBalance = wallet.balance - amount;
    return this.walletsRepository.update(
      { userId: new mongoose.Types.ObjectId(userId) },
      { balance: updatedBalance },
    );
  }

  async deleteAllData() {
    return this.walletsRepository.deleteAll();
  }
}
