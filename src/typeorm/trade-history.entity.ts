import { Exclude } from 'class-transformer';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

@Entity()
export class TradeHistory extends AbstractEntity {
  @Column({
    nullable: true,
    default: 0,
  })
  initialBet: number;

  @Column({
    nullable: true,
    default: 0,
  })
  closeBet: number;

  @Column({
    nullable: true,
    default: 0,
  })
  currency: CRYPTOCURRENCY_SHORT;

  @Column({
    name: 'trade_state',
    nullable: true,
    default: 0,
  })
  tradeState: 'long' | 'short';

  @ManyToOne(() => User, (user) => user.tradeHistory)
  user: User;
}
