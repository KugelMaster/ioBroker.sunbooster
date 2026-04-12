"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var client_exports = {};
__export(client_exports, {
  default: () => client_default
});
module.exports = __toCommonJS(client_exports);
var import_parsers = require("../utils/parsers");
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
   * Loads the tokens from the file and checks if the access token is valid.
   *
   * @returns if loading the tokens was successful.
   */
  async init() {
    await this.loadTokens();
    await this.ensureValidAccessToken();
    return this.tokens !== null;
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
}
var client_default = SunboosterClient;
//# sourceMappingURL=client.js.map
