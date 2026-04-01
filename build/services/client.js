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
class SunboosterClient {
  constructor(api, ws, storage, config, logger) {
    this.api = api;
    this.ws = ws;
    this.storage = storage;
    this.config = config;
    this.logger = logger;
  }
  tokens = null;
  async init() {
    await this.loadTokens();
    await this.ensureValidAccessToken();
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
      await this.storage.saveTokens(this.tokens);
      this.logger.debug("Saved tokens");
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
      this.logger.error("Error during refresh of access token");
    }
  }
}
var client_default = SunboosterClient;
//# sourceMappingURL=client.js.map
