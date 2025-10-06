export interface JwtUserPayload {
  id: string;
  email: string;
}

export interface JwtRefreshPayload {
  id: string;
  email: string;
  refreshToken: string;
}
