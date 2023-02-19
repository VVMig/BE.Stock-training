import { Exclude, Transform } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
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

  @Exclude()
  @Column({
    nullable: false,
    default: '',
  })
  password: string;

  @OneToMany(() => TradeHistory, (tradeHistory) => tradeHistory.user, {
    cascade: ['insert', 'update'],
  })
  tradeHistory: TradeHistory[];

  @OneToMany(() => Role, (role) => role.users, {
    cascade: ['insert', 'update'],
  })
  @Transform(({ value }) => value.map(({ name }) => name))
  roles: Role[];
}
