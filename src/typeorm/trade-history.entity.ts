import { Transform } from 'class-transformer';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

@Entity()
export class TradeHistory extends AbstractEntity {
  @Column({
    nullable: true,
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  @Transform(({ value }) => +value)
  initialBet: number;

  @Column({
    nullable: true,
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  @Transform(({ value }) => +value)
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
