import * as utils from "@iobroker/adapter-core";
import SunboosterClient from "./services/client";
import ApiService from "./services/api";
import WebSocketService from "./services/websocket";
import IOBrokerTokenStorage from "./services/token-storage";
import type { DeviceState, Logger } from "./types";
import { stateDefinitions } from "./states";

class Sunbooster extends utils.Adapter {
    private client?: SunboosterClient;
    private pollInterval?: ioBroker.Interval;

    private logger?: Logger;

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
        this.logger = {
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
            this.logger,
        );

        const success = await this.client.init();

        if (!success) {
            this.log.error("Sunbooster adapter initialisation stopped because of an error.");
            return;
        }

        for (const [id, obj] of Object.entries(stateDefinitions)) {
            await this.setObjectNotExistsAsync(id, obj);
        }

        this.pollInterval = this.setInterval(async () => await this.pollDeviceInfos(), 60_000);
        await this.pollDeviceInfos();

        this.log.info("Sunbooster adapter is ready.");
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
            if (this.pollInterval) {
                this.clearInterval(this.pollInterval);
            }
            callback();
        } catch (error) {
            this.log.error(`Error during unloading: ${(error as Error).message}`);
            callback();
        }
    }

    private async pollDeviceInfos(): Promise<void> {
        try {
            const data = await this.client?.getDeviceInfo();
            await this.updateStates(data);
        } catch (err) {
            this.log.error(`Error during fetch: ${(err as Error).message}`);
        }
        this.log.info("Polled info!");
    }

    private async updateStates(data: DeviceState | null | undefined): Promise<void> {
        if (!data) {
            return;
        }

        for (const [key, value] of Object.entries(data)) {
            await this.setState(key, { val: value, ack: true });
        }
    }
}
if (require.main !== module) {
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Sunbooster(options);
} else {
    (() => new Sunbooster())();
}
