import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Friend extends Model {
  @PrimaryKey
  @BelongsTo(() => User, { as: 'User', foreignKey: 'userId' })
  @Column({ unique: false })
  userId: number;

  @PrimaryKey
  @BelongsTo(() => User, { as: 'Target', foreignKey: 'friendId' })
  @Column
  friendId: number;

  @Column({ defaultValue: 'pending' })
  status: string;
}
