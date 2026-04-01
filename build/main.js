"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var utils = __toESM(require("@iobroker/adapter-core"));
var import_client = __toESM(require("./services/client"));
var import_api = __toESM(require("./services/api"));
var import_websocket = __toESM(require("./services/websocket"));
var import_token_storage = __toESM(require("./utils/token-storage"));
class Sunbooster extends utils.Adapter {
  client;
  constructor(options = {}) {
    super({
      ...options,
      name: "sunbooster"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    const logger = {
      silly: this.log.silly,
      debug: this.log.debug,
      info: this.log.info,
      warn: this.log.warn,
      error: this.log.error
    };
    this.client = new import_client.default(
      new import_api.default(),
      new import_websocket.default(),
      new import_token_storage.default(this),
      this.config,
      logger
    );
    await this.client.init();
    this.log.info("Adapter is ready.");
  }
  onStateChange(id, state) {
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
      if (state.ack === false) {
        this.log.info(`User command received for ${id}: ${state.val}`);
      }
    } else {
      this.log.info(`state ${id} deleted`);
    }
  }
  onUnload(callback) {
    try {
      callback();
    } catch (error) {
      this.log.error(`Error during unloading: ${error.message}`);
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Sunbooster(options);
} else {
  (() => new Sunbooster())();
}
//# sourceMappingURL=main.js.map
