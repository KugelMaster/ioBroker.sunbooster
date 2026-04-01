import * as utils from "@iobroker/adapter-core";
import SunboosterClient from "./services/client";
import ApiService from "./services/api";
import WebSocketService from "./services/websocket";
import IOBrokerTokenStorage from "./utils/token-storage";
import type { Logger } from "./types";

class Sunbooster extends utils.Adapter {
    private client?: SunboosterClient;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "sunbooster",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    private async onReady(): Promise<void> {
        const logger: Logger = {
            silly: this.log.silly,
            debug: this.log.debug,
            info: this.log.info,
            warn: this.log.warn,
            error: this.log.error,
        };

        this.client = new SunboosterClient(
            new ApiService(),
            new WebSocketService(),
            new IOBrokerTokenStorage(this),
            this.config,
            logger,
        );

        await this.client.init();

        this.log.info("Adapter is ready.");
    }

    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

            if (state.ack === false) {
                // This is a command from the user (e.g., from the UI or other adapter)
                // and should be processed by the adapter
                this.log.info(`User command received for ${id}: ${state.val}`);

                // TODO: Add your control logic here
            }
        } else {
            // The object was deleted or the state value has expired
            this.log.info(`state ${id} deleted`);
        }
    }

    private onUnload(callback: () => void): void {
        try {
            callback();
        } catch (error) {
            this.log.error(`Error during unloading: ${(error as Error).message}`);
            callback();
        }
    }
}
if (require.main !== module) {
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Sunbooster(options);
} else {
    (() => new Sunbooster())();
}
