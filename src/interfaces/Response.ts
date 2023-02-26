import { User } from 'src/typeorm';

export interface IPageResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
