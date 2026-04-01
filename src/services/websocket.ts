import crypto from "crypto";
import mqtt from "mqtt";

const PRODUCT_KEY = "XXXXXX";
const DEVICE_KEY = "XXXXXXXXXXXX";

const BROKER_URL = "wss://iot-south.acceleronix.io:8443/ws/v2";
const SUB_TOPICS = [`q/2/d/qd${PRODUCT_KEY}${DEVICE_KEY}/bus`, `q/2/d/qd${PRODUCT_KEY}${DEVICE_KEY}/ack_`];
const PUB_TOPIC = `q/1/d/qd${PRODUCT_KEY}${DEVICE_KEY}/bus`;

/**
 * Stateful service for communicating with the sunbooster server via the MQTT protocol.
 *
 * @see {@link WebSocketService#connect} for the connection of the WebSocket.
 */
class WebSocketService {
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
     * Connects to the server via the MQTT protocol.
     *
     * @param accessToken - The JWT access token used for authentication
     */
    connect(accessToken: string): void {
        const options = {
            clientId: this.clientId,
            username: "",
            password: accessToken,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 5000,
        };

        this.client = mqtt.connect(BROKER_URL, options);

        this.client.on("connect", () => this.onConnect());
        this.client.on("message", (topic, message) => this.handleMessage(topic, message));
        this.client.on("close", () => this.scheduleReconnect());
        this.client.on("error", err => this.handleError(err));
    }

    private onConnect(): void {
        console.log(`Connected to MQTT broker at ${BROKER_URL} with client ID ${this.clientId}`);

        this.client?.subscribe(SUB_TOPICS, err => {
            if (err) {
                console.error("Subscription error:", err);
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
        this.client?.publish(PUB_TOPIC, request.message, err => {
            if (err) {
                clearTimeout(request.timeout);
                request.reject(err);
                this.requestQueue.shift(); // Entferne die fehlgeschlagene Anfrage
                this.sendNextRequest();
            }
        });
    }

    private handleMessage(topic: string, message: Buffer): void {
        //console.debug(`Received message from '${topic}':`, message.toString());

        if (topic == `q/1/u/${this.clientId}/sys_`) {
            console.log(JSON.parse(message.toString()).code === 4021 ? "Device offline" : "Unknown message");
        }

        if (topic === `q/2/d/qd${PRODUCT_KEY}${DEVICE_KEY}/ack_`) {
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
        console.error("Connection error:", err);
    }

    private scheduleReconnect(): void {
        this.connected = false;
        console.log("Connection lost. Reconnecting in 5 seconds...");

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
    public async sendAndReceive(message: Buffer): Promise<string> {
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
