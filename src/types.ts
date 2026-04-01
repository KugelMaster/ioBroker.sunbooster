export interface Logger {
    silly(msg: string): void;
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
}

export interface Tokens {
    accessToken: string;
    accessTokenExpire: number;
    refreshToken: string;
    refreshTokenExpire: number;
}

export interface TokenStorage {
    loadTokens(): Promise<Tokens | null>;
    saveTokens(tokens: Tokens | null): Promise<void>;
}

export const OutputLevel = [0, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800] as const;

export enum ChargeLevel {
    OFF = 0,
    NORMAL = 1,
    FAST = 2,
    SLOW = 3,
}
