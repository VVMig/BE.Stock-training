export enum CONTROLLER_ENDPOINTS {
  TRADING = 'trading',
  USERS = 'users',
  AUTH = 'auth',
  STRATEGY = 'strategy',
}

export enum TRADING_ENDPOINTS {
  PAST = 'past',
  FUTURE = 'future',
  CANCEL = 'cancel',
  HISTORY = 'history',
  STATS = 'stats',
  EXPORT_CSV = 'export_csv',
  CHARTS = 'charts',
}

export enum USERS_ENDPOINTS {
  CREATE = 'create',
  USER = ':uuid',
  USER_HISTORY = 'history/:uuid',
  USER_BRIEF_STATS = 'briefstats/:uuid',
  SUBSCRIBE_PRICE = 'subscribe/price',
  UNSUBSCRIBE_PRICE = 'unsubscribe/price',
  SET_ADMIN = 'set_admin',
}

export enum STRATEGY_ENDPOINTS {
  CREATE = 'create',
  ALL = 'all',
  GET = 'get/:uuid',
  REMOVE = 'remove/:uuid',
}

export enum AUTH_ENPOINTS {
  LOGIN = 'login',
  REGISTER = 'register',
  AUTHORIZE = 'authorize',
  REFRESH = 'refresh',
  SIGNOUT = 'signout',
  PASSWORD_RESET_EMAIL = 'password_reset/email',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  VERIFY = 'verify/:token',
  RESEND_EMAIL = 'resend',
  GOOGLE = 'google',
  GOOGLE_CALLBACK = 'google/callback',
}
