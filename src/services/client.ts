import type { Logger, Tokens, TokenStorage } from "../types";
import type ApiService from "./api";
import type WebSocketService from "./websocket";

class SunboosterClient {
    private tokens: Tokens | null = null;

    constructor(
        private api: ApiService,
        private ws: WebSocketService,
        private storage: TokenStorage,
        private config: ioBroker.AdapterConfig,
        private logger: Logger,
    ) {}

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
            await this.storage.saveTokens(this.tokens);
            this.logger.debug("Saved tokens");
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
