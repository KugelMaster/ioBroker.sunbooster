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
var client_exports = {};
__export(client_exports, {
  default: () => client_default
});
module.exports = __toCommonJS(client_exports);
var import_types = require("../types");
var import_parsers = require("../utils/parsers");
var import_protocol = __toESM(require("../utils/protocol"));
class SunboosterClient {
  /**
   * Creates an instance of SunboosterClient.
   *
   * @param api - Service for API HTTP requests.
   * @param ws - Service for WebSocket connections.
   * @param storage - Service to load and save tokens.
   * @param config - The ioBroker adapter configuration containing credentials.
   * @param logger - The logger instance for debugging and error tracing.
   */
  constructor(api, ws, storage, config, logger) {
    this.api = api;
    this.ws = ws;
    this.storage = storage;
    this.config = config;
    this.logger = logger;
  }
  tokens = null;
  /**
   * Initializes the SunboosterClient.
   * Loads the tokens from the file, checks if the access token is valid and opens the websocket.
   *
   * @returns true if init was successful.
   */
  async init() {
    await this.loadTokens();
    await this.ensureValidAccessToken();
    if (this.tokens === null) {
      return false;
    }
    await this.ws.connect(this.tokens.accessToken);
    return true;
  }
  /**
   * Closes all open connections (e.g. websockets)
   */
  async close() {
    await this.ws.close();
  }
  async loadTokens() {
    try {
      this.tokens = await this.storage.loadTokens();
      if (this.tokens === null) {
        this.logger.debug("No tokens found");
      } else {
        this.logger.debug("Loaded tokens");
      }
    } catch {
      this.logger.error("Error during load of tokens file");
    }
  }
  async saveTokens() {
    try {
      if (this.tokens) {
        await this.storage.saveTokens(this.tokens);
        this.logger.debug("Saved tokens");
      } else {
        this.logger.warn("No tokens to store");
      }
    } catch {
      this.logger.error("Error during saving of tokens");
    }
  }
  async ensureValidAccessToken() {
    if (this.tokens === null) {
      return await this.fetchNewTokensWithCredentials();
    }
    if (Date.now() / 1e3 > this.tokens.accessTokenExpire) {
      await this.refreshAccessToken();
    }
  }
  async fetchNewTokensWithCredentials() {
    if (!this.config.email || !this.config.password) {
      this.logger.error("Email and password must be provided in the adapter configuration");
      return;
    }
    try {
      this.tokens = await this.api.login(this.config.email, this.config.password);
      this.logger.debug("Fetched new tokens with user credentials");
      await this.saveTokens();
    } catch {
      this.logger.error("Error during login process with user credentials");
    }
  }
  async refreshAccessToken() {
    if (!this.tokens || !this.tokens.refreshToken || Date.now() / 1e3 > this.tokens.refreshTokenExpire) {
      this.logger.warn("Refresh token is missing or expired. Fetching new tokens with credentials...");
      return await this.fetchNewTokensWithCredentials();
    }
    try {
      this.tokens = await this.api.refreshAccessToken(this.tokens.refreshToken);
      this.logger.debug("Refreshed access token");
      await this.saveTokens();
    } catch {
      this.logger.warn("Error during refresh of access token");
      await this.fetchNewTokensWithCredentials();
    }
  }
  /**
   * Fetches the current device state.
   */
  async getDeviceInfo() {
    if (!this.tokens) {
      this.logger.error("No tokens found!");
      return null;
    }
    const raw = await this.api.getDeviceInfo(
      this.tokens.accessToken,
      this.config.deviceKey,
      this.config.productKey
    );
    const result = {};
    for (const key in import_parsers.deviceStateTypeMap) {
      const parserType = import_parsers.deviceStateTypeMap[key];
      const parser = import_parsers.typeParsers[parserType];
      const value = raw[key];
      if (value === void 0) {
        continue;
      }
      try {
        result[key] = parser(value);
      } catch {
        this.logger.error("Error during parsing of values returned by the server");
      }
    }
    return result;
  }
  /**
   * Sends the battery a charging signal. Note that the actual power charged might differ a little
   * from what was set, because the battery is dumb and only takes four levels 🤡
   *
   * @param watts - The power to charge with in watts.
   */
  async setChargeLevel(watts) {
    let level = import_types.ChargeLevel.OFF;
    if (watts < 300) {
      this.logger.warn("The battery cannot charge with less than 390W");
    } else if (watts <= 400) {
      level = import_types.ChargeLevel.SLOW;
    } else if (watts <= 800) {
      level = import_types.ChargeLevel.NORMAL;
    } else if (watts <= 1600) {
      level = import_types.ChargeLevel.FAST;
    } else {
      this.logger.warn("The battery cannot charge with more than 1600W");
    }
    const res = await this.ws.sendAndReceive(import_protocol.default.buildChargeCommand(level));
    this.logger.warn(res);
  }
  /**
   * Sends the battery a output signal. The range is between 0W and 800W.
   *
   * @param watts - The power to output to the grid.
   */
  async setOutputLevel(watts) {
    var _a;
    if (watts < 0) {
      this.logger.warn("The battery cannot output negative power");
      return;
    }
    if (watts > 800) {
      this.logger.warn("The battery can output a maximum of 800W. It will do that instead");
    }
    const level = (_a = import_types.OutputLevel.find((v) => v >= watts)) != null ? _a : import_types.OutputLevel[import_types.OutputLevel.length - 1];
    if (level !== watts) {
      this.logger.info(
        `The battery can only output in certain levels. Setting output to ${level}W instead of ${watts}W`
      );
    }
    const res = await this.ws.sendAndReceive(import_protocol.default.buildOutputCommand(level));
    this.logger.warn(res);
  }
}
var client_default = SunboosterClient;
//# sourceMappingURL=client.js.map
