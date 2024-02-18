import { Exclude, Transform } from 'class-transformer';
import { Model } from 'sequelize';
import { Column, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  @Exclude()
  @Transform((value) => {
    return value.toString();
  })
  _id: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  username: string;

  @Column
  email: string;

  @Column
  password: string;
}
