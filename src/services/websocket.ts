import crypto from "crypto";
import mqtt from "mqtt";
import type { Logger } from "../types";

/**
 * Stateful service for communicating with the sunbooster server via the MQTT protocol.
 *
 * @see {@link WebSocketService#connect} for the connection of the WebSocket.
 */
class WebSocketService {
    private subTopics: string[];
    private pubTopic: string;

    private client?: mqtt.MqttClient;
    private reconnectTimeout?: NodeJS.Timeout;
    private requestQueue: Array<{
        id: string;
        message: Buffer;
        resolve: (value: string) => void;
        reject: (reason: any) => void;
        timeout?: NodeJS.Timeout;
    }> = [];

    private clientId: string = `qu_E19725_${Math.floor(Date.now() / 1000)}`;

    public connected: boolean = false;

    /**
     * @param productKey - The Product Key of the device
     * @param deviceKey - The Device Key of the device
     * @param logger - The logger to use for logging messages
     */
    constructor(
        private productKey: string,
        private deviceKey: string,
        private logger: Logger,
    ) {
        this.subTopics = [`q/2/d/qd${productKey}${deviceKey}/bus`, `q/2/d/qd${productKey}${deviceKey}/ack_`];
        this.pubTopic = `q/1/d/qd${productKey}${deviceKey}/bus`;
    }

    /**
     * Connects to the server via the MQTT protocol.
     *
     * @param accessToken - The JWT access token used for authentication
     */
    async connect(accessToken: string): Promise<void> {
        return new Promise(resolve => {
            const options = {
                clientId: this.clientId,
                username: "",
                password: accessToken,
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 5000,
            };

            this.client = mqtt.connect("wss://iot-south.acceleronix.io:8443/ws/v2", options);

            this.client.on("connect", () => {
                this.onConnect();
                resolve();
            });
            this.client.on("message", (topic, message) => this.handleMessage(topic, message));
            this.client.on("close", () => this.scheduleReconnect());
            this.client.on("error", err => this.handleError(err));
        });
    }

    /**
     * Closes the websocket.
     */
    async close(): Promise<void> {
        await this.client?.endAsync();
    }

    private onConnect(): void {
        this.logger.info(`Connected to MQTT broker with client ID ${this.clientId}`);

        this.client?.subscribe(this.subTopics, err => {
            if (err) {
                this.logger.error(`Subscription error: ${err.message}`);
            } else {
                this.connected = true;
                this.sendNextRequest();
            }
        });
    }

    private sendNextRequest(): void {
        if (this.requestQueue.length === 0) {
            return;
        }

        if (!this.connected) {
            return;
        }

        const request = this.requestQueue[0];
        this.client?.publish(this.pubTopic, request.message, err => {
            if (err) {
                clearTimeout(request.timeout);
                request.reject(err);
                this.requestQueue.shift(); // Entferne die fehlgeschlagene Anfrage
                this.sendNextRequest();
            }
        });
    }

    private handleMessage(topic: string, message: Buffer): void {
        //this.logger.debug(`Received message from '${topic}':`, message.toString());

        if (topic == `q/1/u/${this.clientId}/sys_`) {
            this.logger.warn(JSON.parse(message.toString()).code === 4021 ? "Device offline" : "Unknown message");
        }

        if (topic === `q/2/d/qd${this.deviceKey}${this.productKey}/ack_`) {
            if (this.requestQueue.length > 0) {
                const request = this.requestQueue.shift(); // Entferne die erste Anfrage
                if (request) {
                    clearTimeout(request.timeout);
                    request.resolve(message.toString());
                    this.sendNextRequest();
                }
            }
        }
    }

    private handleError(err: Error): void {
        this.connected = false;
        this.logger.error(`Connection error: ${err.message}`);
    }

    private scheduleReconnect(): void {
        this.connected = false;
        this.logger.info("Connection lost. Reconnecting in 5 seconds...");

        /*
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        */
    }

    /**
     * Send a message to the predefined topic. This method queues requests and processes them first-come-first-served.
     *
     * @param message - The message to send to the topic
     */
    async sendAndReceive(message: Buffer): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const id = crypto.randomUUID();
            // Setze einen Timeout, um die Anfrage aus der Warteschlange zu entfernen, falls keine Antwort kommt
            const timeout = setTimeout(() => {
                const index = this.requestQueue.findIndex(req => req.id === id);
                if (index !== -1) {
                    this.requestQueue.splice(index, 1);
                }
                reject(new Error("Timeout waiting for response"));
            }, 10000);

            this.requestQueue.push({ id, message, resolve, reject, timeout });

            // Wenn dies die einzige Anfrage ist, sende sie
            if (this.requestQueue.length === 1) {
                this.sendNextRequest();
            }
        });
    }
}

export default WebSocketService;
