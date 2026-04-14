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
class WebSocketService {
  /**
   * @param productKey - The Product Key of the device
   * @param deviceKey - The Device Key of the device
   * @param logger - The logger to use for logging messages
   */
  constructor(productKey, deviceKey, logger) {
    this.productKey = productKey;
    this.deviceKey = deviceKey;
    this.logger = logger;
    this.subTopics = [`q/2/d/qd${productKey}${deviceKey}/bus`, `q/2/d/qd${productKey}${deviceKey}/ack_`];
    this.pubTopic = `q/1/d/qd${productKey}${deviceKey}/bus`;
  }
  subTopics;
  pubTopic;
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
  async connect(accessToken) {
    return new Promise((resolve) => {
      const options = {
        clientId: this.clientId,
        username: "",
        password: accessToken,
        clean: true,
        connectTimeout: 4e3,
        reconnectPeriod: 5e3
      };
      this.client = import_mqtt.default.connect("wss://iot-south.acceleronix.io:8443/ws/v2", options);
      this.client.on("connect", () => {
        this.onConnect();
        resolve();
      });
      this.client.on("message", (topic, message) => this.handleMessage(topic, message));
      this.client.on("close", () => this.scheduleReconnect());
      this.client.on("error", (err) => this.handleError(err));
    });
  }
  /**
   * Closes the websocket.
   */
  async close() {
    var _a;
    await ((_a = this.client) == null ? void 0 : _a.endAsync());
  }
  onConnect() {
    var _a;
    this.logger.info(`Connected to MQTT broker with client ID ${this.clientId}`);
    (_a = this.client) == null ? void 0 : _a.subscribe(this.subTopics, (err) => {
      if (err) {
        this.logger.error(`Subscription error: ${err.message}`);
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
    (_a = this.client) == null ? void 0 : _a.publish(this.pubTopic, request.message, (err) => {
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
      this.logger.warn(JSON.parse(message.toString()).code === 4021 ? "Device offline" : "Unknown message");
    }
    if (topic === `q/2/d/qd${this.deviceKey}${this.productKey}/ack_`) {
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
    this.logger.error(`Connection error: ${err.message}`);
  }
  scheduleReconnect() {
    this.connected = false;
    this.logger.info("Connection lost. Reconnecting in 5 seconds...");
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
