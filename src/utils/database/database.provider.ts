import { Sequelize } from 'sequelize-typescript';
import * as mongoose from 'mongoose';
import { User } from 'src/users/entities/user.schema';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(
        'mongodb://127.0.0.1:27017/quick-trade?authSource=admin',
      ),
  },
];
