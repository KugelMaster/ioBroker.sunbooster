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
var token_storage_exports = {};
__export(token_storage_exports, {
  default: () => token_storage_default
});
module.exports = __toCommonJS(token_storage_exports);
class IOBrokerTokenStorage {
  /**
   * Creates an instance of IOBrokerTokenStorage
   *
   * @param adapter - The ioBroker Adapter instance (needed because of its file operation methods)
   */
  constructor(adapter) {
    this.adapter = adapter;
  }
  /**
   * Load the JWT tokens from the "tokens.json" file in the instance's file system.
   *
   * @returns Tokens, if the file was found and not empty
   */
  async loadTokens() {
    try {
      const result = await this.adapter.readFileAsync(this.adapter.namespace, "tokens.json");
      if (!(result == null ? void 0 : result.file)) {
        return null;
      }
      return JSON.parse(result.file.toString());
    } catch {
      return null;
    }
  }
  /**
   * Save the JWT tokens to "tokens.json" in the instance's file system.
   *
   * @param tokens - The JWT Tokens
   */
  async saveTokens(tokens) {
    await this.adapter.writeFileAsync(this.adapter.namespace, "tokens.json", JSON.stringify(tokens, null, 2));
  }
}
var token_storage_default = IOBrokerTokenStorage;
//# sourceMappingURL=token-storage.js.map
