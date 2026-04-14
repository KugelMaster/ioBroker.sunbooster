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
            new WebSocketService(this.config.productKey, this.config.deviceKey, this.logger),
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

        this.subscribeStates("TOTAL_INPUT_POWER");
        this.subscribeStates("TOTAL_OUTPUT_POWER");

        this.pollInterval = this.setInterval(async () => await this.pollDeviceInfos(), this.config.pollInterval * 1000);
        await this.pollDeviceInfos();

        this.log.info("Sunbooster adapter is ready.");
    }

    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (!state || state.ack) {
            return;
        }

        const key = id.replace(`${this.namespace}.`, "");

        this.log.debug(`User command received for ${key}: ${state.val}`);

        if (key === "TOTAL_INPUT_POWER") {
            this.client?.setChargeLevel(state.val as number).catch(this.log.error);
        } else if (key === "TOTAL_OUTPUT_POWER") {
            this.client?.setOutputLevel(state.val as number).catch(this.log.error);
        }
    }

    private async onUnload(callback: () => void): Promise<void> {
        try {
            this.clearInterval(this.pollInterval);
            await this.client?.close();
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
            try {
                await this.setState(key, { val: value, ack: true });
            } catch {
                await this.setObjectNotExists(key, stateDefinitions[key]);
                await this.setState(key, { val: value, ack: true });
            }
        }
    }
}
if (require.main !== module) {
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Sunbooster(options);
} else {
    (() => new Sunbooster())();
}
