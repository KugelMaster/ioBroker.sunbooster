import type { Logger, Tokens, TokenStorage } from "../types";
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
     * Loads the tokens from the file and checks if the access token is valid.
     */
    async init(): Promise<void> {
        await this.loadTokens();
        await this.ensureValidAccessToken();
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
            this.logger.error("Error during refresh of access token");
        }
    }
}

export default SunboosterClient;
