import type { Tokens, TokenStorage } from "../types";

/**
 * A service to store JWT tokens.
 */
class IOBrokerTokenStorage implements TokenStorage {
    /**
     * Creates an instance of IOBrokerTokenStorage
     *
     * @param adapter - The ioBroker Adapter instance (needed because of its file operation methods)
     */
    constructor(private adapter: ioBroker.Adapter) {}

    /**
     * Load the JWT tokens from the "tokens.json" file in the instance's file system.
     *
     * @returns Tokens, if the file was found and not empty
     */
    public async loadTokens(): Promise<Tokens | null> {
        try {
            const result = await this.adapter.readFileAsync(this.adapter.namespace, "tokens.json");

            if (!result?.file) {
                return null;
            }

            return JSON.parse(result.file.toString()) as Tokens;
        } catch {
            return null;
        }
    }

    /**
     * Save the JWT tokens to "tokens.json" in the instance's file system.
     *
     * @param tokens - The JWT Tokens
     */
    async saveTokens(tokens: Tokens): Promise<void> {
        await this.adapter.writeFileAsync(this.adapter.namespace, "tokens.json", JSON.stringify(tokens, null, 2));
    }
}

export default IOBrokerTokenStorage;
