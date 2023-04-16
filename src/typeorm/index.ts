import { Role } from './role.entity';
import { Strategy } from './strategy.entity';
import { TradeHistory } from './trade-history.entity';
import { User } from './user.entity';

const entities = [User, TradeHistory, Role, Strategy];

export { User, TradeHistory, Role, Strategy };
export default entities;
