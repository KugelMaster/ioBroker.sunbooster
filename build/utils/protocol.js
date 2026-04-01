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
var protocol_exports = {};
__export(protocol_exports, {
  default: () => protocol_default
});
module.exports = __toCommonJS(protocol_exports);
var import_types = require("../types");
class ProtocolParser {
  static parse(base, payload) {
    return Buffer.from(`${base} ${payload.padStart(2, "0").toUpperCase()}`.replace(/\s/g, ""), "hex");
  }
  static getOutputCommand(watts) {
    const BASE = "aa aa 00 09 69 00 43 00 13 01 0a 00 ";
    const OUTPUT = import_types.OutputLevel.indexOf(watts).toString(16);
    return this.parse(BASE, OUTPUT);
  }
  static getChargeCommand(level) {
    const BASE = "aa aa 00 09 69 00 42 00 13 00 da 00 ";
    return this.parse(BASE, level.toString(16));
  }
}
var protocol_default = ProtocolParser;
//# sourceMappingURL=protocol.js.map
