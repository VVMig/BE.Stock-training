import { Transform } from 'class-transformer';
import { CRYPTOCURRENCY_SHORT } from 'src/constants/Currency';
import { TradeState } from 'src/interfaces';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Strategy } from './strategy.entity';

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
    nullable: false,
    default: 1,
  })
  margin: number;

  @Column({
    name: 'trade_state',
    nullable: true,
    default: 0,
  })
  tradeState: TradeState;

  @ManyToOne(() => Strategy, (strategy) => strategy.trades)
  strategy: Strategy;
}
