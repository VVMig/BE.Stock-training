import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
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

  @ManyToMany(() => User, (user) => user.roles, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  users: User[];
}
