import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

@Entity({
  name: 'roles',
})
export class Role extends AbstractEntity {
  @Column({
    nullable: false,
  })
  name: string;

  @ManyToOne(() => User, (user) => user.roles, {
    cascade: ['insert', 'update'],
  })
  users: User[];
}
