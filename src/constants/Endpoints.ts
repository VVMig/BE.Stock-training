export enum CONTROLLER_ENDPOINTS {
  TRADING = 'trading',
  USERS = 'users',
  AUTH = 'auth',
}

export enum TRADING_ENDPOINTS {
  PAST = 'past',
  FUTURE = 'future',
  CANCEL = 'cancel',
}

export enum USERS_ENDPOINTS {
  CREATE = 'create',
  USER = ':uuid',
  USER_HISTORY = 'history/:uuid',
}

export enum AUTH_ENPOINTS {
  LOGIN = 'login',
  REGISTER = 'register',
  AUTHORIZE = 'authorize',
  REFRESH = 'refresh',
  SIGNOUT = 'signout',
}
