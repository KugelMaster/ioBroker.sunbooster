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
var parsers_exports = {};
__export(parsers_exports, {
  deviceStateTypeMap: () => deviceStateTypeMap,
  typeParsers: () => typeParsers
});
module.exports = __toCommonJS(parsers_exports);
const typeParsers = {
  number: (v) => Number(v),
  boolean: (v) => v === "1" || v.toLowerCase() === "true",
  string: (v) => v,
  object: (v) => v
  // Objects should stay stringified!
};
const deviceStateTypeMap = {
  BREATHING_LAMP_SWITCH_SET: "boolean",
  DC_OUTPUT_POWER: "number",
  DC_STANDBY_TIME: "number",
  DC_SWITCH_HM: "boolean",
  TEMP: "number",
  MIG_TIME_SWITCH: "boolean",
  MIG_CONNECTION_DATA_HM: "number",
  TOTAL_OUTPUT_POWER: "number",
  DEVICE_SOFT_VER: "string",
  CHARGING_PACK_DATA_JDB: "number",
  HIGH_FREQUENCY_REPORTING: "number",
  USB_SWITCH: "boolean",
  USB_OUTPUT_POWER_HM: "number",
  REMAIN_CHARGING_TIME: "number",
  CURRENCY_UNIT_SET: "number",
  LED_STATUS_HM: "number",
  MEASURE_DATA: "object",
  TIMED_CHARGE_CONNECTION: "object",
  REMAIN_TIME: "number",
  CHARGE_MODE_DATA_HM: "number",
  DEVICE_STANDBY_TIME: "number",
  DEVICETIME: "string",
  BATTERY_PERCENTAGE: "number",
  ECO_MODE_SET: "object",
  SOC_MIG_SWITCH: "boolean",
  DEVICE_ELECTRICITY_USAGE: "number",
  DEVICE_STATUS: "number",
  DC_SOLAR_CURRENT_INPUT: "number",
  SMART_ON_GRID_SWITCH: "boolean",
  SCREEN_BRIGHTNESS: "number",
  TIMED_GRID_CONNECTION: "object",
  CHARGE_MODE_POWER_HM: "number",
  AC_SWITCH_HM: "boolean",
  AUTO_MIG_SET: "object",
  FIT_ELECTRICITY_PRICE_SET: "number",
  AC_OUTPUT_POWER: "number",
  DC_SOLAR_INPUT: "number",
  AC_TIME_SWITCH: "boolean",
  TOTAL_INPUT_POWER: "number"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deviceStateTypeMap,
  typeParsers
});
//# sourceMappingURL=parsers.js.map
