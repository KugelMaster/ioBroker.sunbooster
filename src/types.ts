/**
 * Minimal logging interface used by the Sunbooster adapter.
 */
export interface Logger {
    /**
     * Trace-level log entry for very verbose debug info.
     *
     * @param msg Message text
     */
    silly(msg: string): void;

    /**
     * Debug-level log entry.
     *
     * @param msg Message text
     */
    debug(msg: string): void;

    /**
     * Info-level log entry.
     *
     * @param msg Message text
     */
    info(msg: string): void;

    /**
     * Warning-level log entry.
     *
     * @param msg Message text
     */
    warn(msg: string): void;

    /**
     * Error-level log entry.
     *
     * @param msg Message text
     */
    error(msg: string): void;
}

/**
 * Authentication token data from Sunbooster auth response.
 */
export interface Tokens {
    /** Access token for API calls */
    accessToken: string;

    /** Unix timestamp in seconds when access token expires */
    accessTokenExpire: number;

    /** Refresh token for getting new access tokens */
    refreshToken: string;

    /** Unix timestamp in seconds when refresh token expires */
    refreshTokenExpire: number;
}

/**
 * Persistent storage abstraction for tokens.
 */
export interface TokenStorage {
    /**
     * Load saved tokens from storage.
     *
     * @returns tokens or null when not found
     */
    loadTokens(): Promise<Tokens | null>;

    /**
     * Save tokens to storage.
     *
     * @param tokens tokens to store
     */
    saveTokens(tokens: Tokens): Promise<void>;
}

/**
 * Supported API output level constants.
 */
export const OutputLevel = [0, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800] as const;

/**
 * Charging power profiles.
 */
export enum ChargeLevel {
    /** Charging is disabled */
    OFF = 0,

    /** Normal charger power mode */
    NORMAL = 1,

    /** Fast charging mode */
    FAST = 2,

    /** Slow charging mode */
    SLOW = 3,
}
