declare module 'passport-jwt' {
  import type { Request } from 'express';

  export type JwtFromRequestFunction = (request: Request) => string | null;

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey: string | Buffer;
    ignoreExpiration?: boolean;
  }

  export type VerifyCallback = (
    payload: unknown,
    done: (error: unknown, user?: unknown, info?: unknown) => void,
  ) => void;

  export class Strategy {
    constructor(options: StrategyOptions, verify?: VerifyCallback);
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
  };
}
