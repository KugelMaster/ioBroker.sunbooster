"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var websocket_exports = {};
__export(websocket_exports, {
  default: () => websocket_default
});
module.exports = __toCommonJS(websocket_exports);
var import_crypto = __toESM(require("crypto"));
var import_mqtt = __toESM(require("mqtt"));
const PRODUCT_KEY = "XXXXXX";
const DEVICE_KEY = "XXXXXXXXXXXX";
const BROKER_URL = "wss://iot-south.acceleronix.io:8443/ws/v2";
const SUB_TOPICS = [`q/2/d/qd${PRODUCT_KEY}${DEVICE_KEY}/bus`, `q/2/d/qd${PRODUCT_KEY}${DEVICE_KEY}/ack_`];
const PUB_TOPIC = `q/1/d/qd${PRODUCT_KEY}${DEVICE_KEY}/bus`;
class WebSocketService {
  client;
  reconnectTimeout;
  requestQueue = [];
  clientId = `qu_E19725_${Math.floor(Date.now() / 1e3)}`;
  connected = false;
  /**
   * Connects to the server via the MQTT protocol.
   *
   * @param accessToken - The JWT access token used for authentication
   */
  connect(accessToken) {
    const options = {
      clientId: this.clientId,
      username: "",
      password: accessToken,
      clean: true,
      connectTimeout: 4e3,
      reconnectPeriod: 5e3
    };
    this.client = import_mqtt.default.connect(BROKER_URL, options);
    this.client.on("connect", () => this.onConnect());
    this.client.on("message", (topic, message) => this.handleMessage(topic, message));
    this.client.on("close", () => this.scheduleReconnect());
    this.client.on("error", (err) => this.handleError(err));
  }
  onConnect() {
    var _a;
    console.log(`Connected to MQTT broker at ${BROKER_URL} with client ID ${this.clientId}`);
    (_a = this.client) == null ? void 0 : _a.subscribe(SUB_TOPICS, (err) => {
      if (err) {
        console.error("Subscription error:", err);
      } else {
        this.connected = true;
        this.sendNextRequest();
      }
    });
  }
  sendNextRequest() {
    var _a;
    if (this.requestQueue.length === 0) {
      return;
    }
    if (!this.connected) {
      return;
    }
    const request = this.requestQueue[0];
    (_a = this.client) == null ? void 0 : _a.publish(PUB_TOPIC, request.message, (err) => {
      if (err) {
        clearTimeout(request.timeout);
        request.reject(err);
        this.requestQueue.shift();
        this.sendNextRequest();
      }
    });
  }
  handleMessage(topic, message) {
    if (topic == `q/1/u/${this.clientId}/sys_`) {
      console.log(JSON.parse(message.toString()).code === 4021 ? "Device offline" : "Unknown message");
    }
    if (topic === `q/2/d/qd${PRODUCT_KEY}${DEVICE_KEY}/ack_`) {
      if (this.requestQueue.length > 0) {
        const request = this.requestQueue.shift();
        if (request) {
          clearTimeout(request.timeout);
          request.resolve(message.toString());
          this.sendNextRequest();
        }
      }
    }
  }
  handleError(err) {
    this.connected = false;
    console.error("Connection error:", err);
  }
  scheduleReconnect() {
    this.connected = false;
    console.log("Connection lost. Reconnecting in 5 seconds...");
  }
  /**
   * Send a message to the predefined topic. This method queues requests and processes them first-come-first-served.
   *
   * @param message - The message to send to the topic
   */
  async sendAndReceive(message) {
    return new Promise((resolve, reject) => {
      const id = import_crypto.default.randomUUID();
      const timeout = setTimeout(() => {
        const index = this.requestQueue.findIndex((req) => req.id === id);
        if (index !== -1) {
          this.requestQueue.splice(index, 1);
        }
        reject(new Error("Timeout waiting for response"));
      }, 1e4);
      this.requestQueue.push({ id, message, resolve, reject, timeout });
      if (this.requestQueue.length === 1) {
        this.sendNextRequest();
      }
    });
  }
}
var websocket_default = WebSocketService;
//# sourceMappingURL=websocket.js.map
