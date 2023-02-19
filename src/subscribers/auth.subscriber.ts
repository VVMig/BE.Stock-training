import { AuthenticationProvider } from 'src/providers/auth.provider';
import { User } from 'src/typeorm';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class AuthSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert({ entity }: InsertEvent<User>): Promise<void> {
    if (entity.password) {
      entity.password = await AuthenticationProvider.generateHash(
        entity.password,
      );
    }
  }

  async beforeUpdate({
    entity,
    databaseEntity,
  }: UpdateEvent<User>): Promise<void> {
    if (entity.password) {
      const password = await AuthenticationProvider.generateHash(
        entity.password,
      );

      if (password !== databaseEntity?.password) {
        entity.password = password;
      }
    }
  }
}
