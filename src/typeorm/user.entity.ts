import { Exclude, Transform } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Role } from './role.entity';
import { TradeHistory } from './trade-history.entity';

@Entity()
export class User extends AbstractEntity {
  @Column({
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    name: 'email',
    nullable: false,
    default: '',
    unique: true,
  })
  email: string;

  @Column({
    name: 'verified',
    default: false,
  })
  verified: boolean;

  @Exclude()
  @Column({
    name: 'verificationToken',
    default: '',
  })
  verificationToken: string;

  @Exclude()
  @Column({
    name: 'resetToken',
    default: '',
  })
  resetToken: string;

  @Column({
    name: 'subscribed',
    default: false,
  })
  subscribed: boolean;

  @Column({
    name: 'subscribedRules',
    default: '',
  })
  subscribedRules: string;

  @Exclude()
  @Column({
    nullable: true,
    default: '',
  })
  password: string;

  @OneToMany(() => TradeHistory, (tradeHistory) => tradeHistory.user, {
    cascade: ['insert', 'update'],
  })
  tradeHistory: TradeHistory[];

  @ManyToMany(() => Role, (role) => role.users, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @Transform(({ value }) => value.map(({ name }) => name))
  @JoinTable()
  roles: Role[];
}
