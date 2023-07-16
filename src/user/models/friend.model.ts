import { Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Friend extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column({ unique: false })
  userId: number;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  friendId: number;

  @Column({ defaultValue: 'pending' })
  status: string;
}
