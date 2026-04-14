import type { DeviceState, Logger, Tokens, TokenStorage } from "../types";
import { ChargeLevel, OutputLevel } from "../types";
import { deviceStateTypeMap, typeParsers } from "../utils/parsers";
import ProtocolBuilder from "../utils/protocol";
import type ApiService from "./api";
import type WebSocketService from "./websocket";

/**
 * Client for interacting with the Sunbooster API and WebSocket services.
 * Handles token management, authentication and session persistence.
 */
class SunboosterClient {
    private tokens: Tokens | null = null;

    /**
     * Creates an instance of SunboosterClient.
     *
     * @param api - Service for API HTTP requests.
     * @param ws - Service for WebSocket connections.
     * @param storage - Service to load and save tokens.
     * @param config - The ioBroker adapter configuration containing credentials.
     * @param logger - The logger instance for debugging and error tracing.
     */
    constructor(
        private api: ApiService,
        private ws: WebSocketService,
        private storage: TokenStorage,
        private config: ioBroker.AdapterConfig,
        private logger: Logger,
    ) {}

    /**
     * Initializes the SunboosterClient.
     * Loads the tokens from the file, checks if the access token is valid and opens the websocket.
     *
     * @returns true if init was successful.
     */
    async init(): Promise<boolean> {
        await this.loadTokens();
        await this.ensureValidAccessToken();

        if (this.tokens === null) {
            return false;
        }

        await this.ws.connect(this.tokens.accessToken);

        return true;
    }

    /**
     * Closes all open connections (e.g. websockets)
     */
    async close(): Promise<void> {
        await this.ws.close();
    }

    private async loadTokens(): Promise<void> {
        try {
            this.tokens = await this.storage.loadTokens();
            if (this.tokens === null) {
                this.logger.debug("No tokens found");
            } else {
                this.logger.debug("Loaded tokens");
            }
        } catch {
            this.logger.error("Error during load of tokens file");
        }
    }

    private async saveTokens(): Promise<void> {
        try {
            if (this.tokens) {
                await this.storage.saveTokens(this.tokens);
                this.logger.debug("Saved tokens");
            } else {
                this.logger.warn("No tokens to store");
            }
        } catch {
            this.logger.error("Error during saving of tokens");
        }
    }

    private async ensureValidAccessToken(): Promise<void> {
        if (this.tokens === null) {
            return await this.fetchNewTokensWithCredentials();
        }

        if (Date.now() / 1000 > this.tokens.accessTokenExpire) {
            await this.refreshAccessToken();
        }
    }

    private async fetchNewTokensWithCredentials(): Promise<void> {
        if (!this.config.email || !this.config.password) {
            this.logger.error("Email and password must be provided in the adapter configuration");
            return;
        }

        try {
            this.tokens = await this.api.login(this.config.email, this.config.password);
            this.logger.debug("Fetched new tokens with user credentials");
            await this.saveTokens();
        } catch {
            this.logger.error("Error during login process with user credentials");
        }
    }

    private async refreshAccessToken(): Promise<void> {
        if (!this.tokens || !this.tokens.refreshToken || Date.now() / 1000 > this.tokens.refreshTokenExpire) {
            this.logger.warn("Refresh token is missing or expired. Fetching new tokens with credentials...");
            return await this.fetchNewTokensWithCredentials();
        }

        try {
            this.tokens = await this.api.refreshAccessToken(this.tokens.refreshToken);
            this.logger.debug("Refreshed access token");
            await this.saveTokens();
        } catch {
            this.logger.warn("Error during refresh of access token");
            await this.fetchNewTokensWithCredentials();
        }
    }

    /**
     * Fetches the current device state.
     */
    public async getDeviceInfo(): Promise<DeviceState | null> {
        if (!this.tokens) {
            this.logger.error("No tokens found!");
            return null;
        }

        const raw = await this.api.getDeviceInfo(
            this.tokens.accessToken,
            this.config.deviceKey,
            this.config.productKey,
        );

        const result: Partial<DeviceState> = {};

        for (const key in deviceStateTypeMap) {
            const parserType = deviceStateTypeMap[key as keyof DeviceState];
            const parser = typeParsers[parserType];

            const value = raw[key];
            if (value === undefined) {
                continue;
            }

            try {
                (result as any)[key] = parser(value);
            } catch {
                this.logger.error("Error during parsing of values returned by the server");
            }
        }

        return result as DeviceState;
    }

    /**
     * Sends the battery a charging signal. Note that the actual power charged might differ a little
     * from what was set, because the battery is dumb and only takes four levels 🤡
     *
     * @param watts - The power to charge with in watts.
     */
    public async setChargeLevel(watts: number): Promise<void> {
        let level = ChargeLevel.OFF;

        if (watts < 300) {
            this.logger.warn("The battery cannot charge with less than 390W");
        } else if (watts <= 400) {
            level = ChargeLevel.SLOW;
        } else if (watts <= 800) {
            level = ChargeLevel.NORMAL;
        } else if (watts <= 1600) {
            level = ChargeLevel.FAST;
        } else {
            this.logger.warn("The battery cannot charge with more than 1600W");
        }

        const res = await this.ws.sendAndReceive(ProtocolBuilder.buildChargeCommand(level));

        this.logger.warn(res);
    }

    /**
     * Sends the battery a output signal. The range is between 0W and 800W.
     *
     * @param watts - The power to output to the grid.
     */
    public async setOutputLevel(watts: number): Promise<void> {
        if (watts < 0) {
            this.logger.warn("The battery cannot output negative power");
            return;
        }

        if (watts > 800) {
            this.logger.warn("The battery can output a maximum of 800W. It will do that instead");
        }

        const level = OutputLevel.find(v => v >= watts) ?? OutputLevel[OutputLevel.length - 1];

        if (level !== watts) {
            this.logger.info(
                `The battery can only output in certain levels. Setting output to ${level}W instead of ${watts}W`,
            );
        }

        const res = await this.ws.sendAndReceive(ProtocolBuilder.buildOutputCommand(level));

        this.logger.warn(res);
    }
}

export default SunboosterClient;
