import type { Tokens, TokenStorage } from "../types";

class IOBrokerTokenStorage implements TokenStorage {
    constructor(private adapter: ioBroker.Adapter) {}

    async loadTokens(): Promise<Tokens | null> {
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

    async saveTokens(tokens: Tokens | null): Promise<void> {
        if (tokens === null) {
            return;
        }

        await this.adapter.writeFileAsync(this.adapter.namespace, "tokens.json", JSON.stringify(tokens, null, 2));
    }
}

export default IOBrokerTokenStorage;
