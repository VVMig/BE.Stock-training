import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { TradeHistory } from './trade-history.entity';

@Entity({
  name: 'strategy',
})
export class Strategy extends AbstractEntity {
  @Column({
    nullable: false,
  })
  name: string;

  @Column({
    nullable: true,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  funds: number;

  @OneToMany(() => TradeHistory, (tradeHistory) => tradeHistory.strategy, {
    cascade: ['insert', 'update'],
  })
  trades: TradeHistory[];

  @ManyToOne(() => User, (user) => user.strategies)
  user: User;
}
