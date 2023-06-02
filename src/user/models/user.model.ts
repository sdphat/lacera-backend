import { Column, Table, Model, PrimaryKey } from 'sequelize-typescript';

interface UserAttributes {
  phoneNumber: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CreationalUserAttributes extends UserAttributes {}

@Table
export class User extends Model<UserAttributes, CreationalUserAttributes> {
  @PrimaryKey
  @Column
  phoneNumber: string;

  @Column
  password: string;
}
