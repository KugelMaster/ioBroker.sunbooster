/**
 * Minimal logging interface used by the Sunbooster adapter.
 */
export interface Logger {
    /* eslint-disable jsdoc/require-jsdoc */
    silly(msg: string): void;
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
    /* eslint-enable jsdoc/require-jsdoc */
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
    // eslint-disable-next-line jsdoc/require-jsdoc
    loadTokens(): Promise<Tokens | null>;

    // eslint-disable-next-line jsdoc/require-jsdoc
    saveTokens(tokens: Tokens): Promise<void>;
}

/**
 * Supported API output level constants.
 */
export const OutputLevel = [0, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800] as const;

/**
 * Charging power profiles.
 *
 * OFF = 0W, NORMAL = 620W, FAST = 1600W, SLOW = 390W
 */
export enum ChargeLevel {
    OFF = 0,
    NORMAL = 1,
    FAST = 2,
    SLOW = 3,
}

/**
 * All device states from "Sunbooster POWERSTATION GRID+".
 */
export interface DeviceState {
    /* eslint-disable jsdoc/require-jsdoc */
    readonly BREATHING_LAMP_SWITCH_SET: boolean;
    readonly DC_OUTPUT_POWER: number;
    readonly DC_STANDBY_TIME: number;
    readonly DC_SWITCH_HM: boolean;
    readonly TEMP: number;
    readonly MIG_TIME_SWITCH: boolean;
    readonly MIG_CONNECTION_DATA_HM: number;
    readonly TOTAL_OUTPUT_POWER: number;
    readonly DEVICE_SOFT_VER: string;
    readonly CHARGING_PACK_DATA_JDB: number;
    readonly HIGH_FREQUENCY_REPORTING: number;
    readonly USB_SWITCH: boolean;
    readonly USB_OUTPUT_POWER_HM: number;
    readonly REMAIN_CHARGING_TIME: number;
    readonly CURRENCY_UNIT_SET: number;
    readonly LED_STATUS_HM: number;
    readonly MEASURE_DATA: object;
    readonly TIMED_CHARGE_CONNECTION: object;
    readonly REMAIN_TIME: number;
    readonly CHARGE_MODE_DATA_HM: number;
    readonly DEVICE_STANDBY_TIME: number;
    readonly DEVICETIME: string;
    readonly BATTERY_PERCENTAGE: number;
    readonly ECO_MODE_SET: object;
    readonly SOC_MIG_SWITCH: boolean;
    readonly DEVICE_ELECTRICITY_USAGE: number;
    readonly DEVICE_STATUS: number;
    readonly DC_SOLAR_CURRENT_INPUT: number;
    readonly SMART_ON_GRID_SWITCH: boolean;
    readonly SCREEN_BRIGHTNESS: number;
    readonly TIMED_GRID_CONNECTION: object;
    readonly CHARGE_MODE_POWER_HM: number;
    readonly AC_SWITCH_HM: boolean;
    readonly AUTO_MIG_SET: object;
    readonly FIT_ELECTRICITY_PRICE_SET: number;
    readonly AC_OUTPUT_POWER: number;
    readonly DC_SOLAR_INPUT: number;
    readonly AC_TIME_SWITCH: boolean;
    readonly TOTAL_INPUT_POWER: number;
}
/* eslint-enable jsdoc/require-jsdoc */
