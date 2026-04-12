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
var states_exports = {};
__export(states_exports, {
  stateDefinitions: () => stateDefinitions
});
module.exports = __toCommonJS(states_exports);
const stateDefinitions = {
  BREATHING_LAMP_SWITCH_SET: {
    type: "state",
    common: {
      name: "POWERSTATION GRID Status Light",
      type: "boolean",
      role: "switch.lamp",
      read: true,
      write: false
    },
    native: {}
  },
  DC_OUTPUT_POWER: {
    type: "state",
    common: {
      name: "DC Output (W)",
      type: "number",
      role: "value.power.produced",
      read: true,
      write: false
    },
    native: {}
  },
  DC_STANDBY_TIME: {
    type: "state",
    common: {
      name: "DC Standby Time",
      type: "number",
      role: "media.duration",
      read: true,
      write: false
    },
    native: {}
  },
  DC_SWITCH_HM: {
    type: "state",
    common: {
      name: "DC Outputs",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  TEMP: {
    type: "state",
    common: {
      name: "Battery Temperature",
      type: "number",
      role: "value.temperature",
      read: true,
      write: false
    },
    native: {}
  },
  MIG_TIME_SWITCH: {
    type: "state",
    common: {
      name: "Feeding Time Window",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  MIG_CONNECTION_DATA_HM: {
    type: "state",
    common: {
      name: "Base Load Consumption",
      type: "number",
      role: "value.energy.consumed",
      // FIXME: idk
      read: true,
      write: false
    },
    native: {}
  },
  TOTAL_OUTPUT_POWER: {
    type: "state",
    common: {
      name: "Total Output Power (W)",
      type: "number",
      role: "value.power.produced",
      read: true,
      write: true
    },
    native: {}
  },
  DEVICE_SOFT_VER: {
    type: "state",
    common: {
      name: "Software Version",
      type: "string",
      role: "info.firmware",
      read: true,
      write: false
    },
    native: {}
  },
  // TODO: idk what ts is
  CHARGING_PACK_DATA_JDB: {
    type: "state",
    common: {
      name: "Charging Pack Data",
      type: "number",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  // TODO: idk what ts is
  HIGH_FREQUENCY_REPORTING: {
    type: "state",
    common: {
      name: "high_frequency_reporting",
      type: "number",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  USB_SWITCH: {
    type: "state",
    common: {
      name: "USB Outputs",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  USB_OUTPUT_POWER_HM: {
    type: "state",
    common: {
      name: "USB Output (W)",
      type: "number",
      role: "value.power.produced",
      read: true,
      write: false
    },
    native: {}
  },
  REMAIN_CHARGING_TIME: {
    type: "state",
    common: {
      name: "Remaining Charging Time",
      type: "number",
      role: "value.time",
      read: true,
      write: false
    },
    native: {}
  },
  // TODO: idk what ts is
  CURRENCY_UNIT_SET: {
    type: "state",
    common: {
      name: "Currency",
      type: "number",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  // TODO: idk what ts is
  LED_STATUS_HM: {
    type: "state",
    common: {
      name: "LED Light",
      type: "number",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  // TODO: idk what ts is
  MEASURE_DATA: {
    type: "state",
    common: {
      name: "Measurement Data",
      type: "object",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  TIMED_CHARGE_CONNECTION: {
    type: "state",
    common: {
      name: "timed_charge_connection",
      type: "object",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  REMAIN_TIME: {
    type: "state",
    common: {
      name: "Remaining Time",
      type: "number",
      role: "value.time",
      read: true,
      write: false
    },
    native: {}
  },
  CHARGE_MODE_DATA_HM: {
    type: "state",
    common: {
      name: "AC Charging Mode",
      type: "number",
      role: "value",
      // TODO: Set role mode?
      read: true,
      write: false
    },
    native: {}
  },
  DEVICE_STANDBY_TIME: {
    type: "state",
    common: {
      name: "Standby Time",
      type: "number",
      role: "value.time",
      read: true,
      write: false
    },
    native: {}
  },
  DEVICETIME: {
    type: "state",
    common: {
      name: "Local Time",
      type: "string",
      role: "value.time",
      read: true,
      write: false
    },
    native: {}
  },
  BATTERY_PERCENTAGE: {
    type: "state",
    common: {
      name: "Battery Power",
      type: "number",
      role: "value.battery",
      read: true,
      write: false
    },
    native: {}
  },
  ECO_MODE_SET: {
    type: "state",
    common: {
      name: "ECO Mode",
      type: "object",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  SOC_MIG_SWITCH: {
    type: "state",
    common: {
      name: "Auto Feeding SoC",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  DEVICE_ELECTRICITY_USAGE: {
    type: "state",
    common: {
      name: "Power Generation",
      type: "number",
      role: "value",
      // TODO: idk
      read: true,
      write: false
    },
    native: {}
  },
  // TODO: idk what ts is
  DEVICE_STATUS: {
    type: "state",
    common: {
      name: "Device Status",
      type: "number",
      role: "info.status",
      read: true,
      write: false
    },
    native: {}
  },
  DC_SOLAR_CURRENT_INPUT: {
    type: "state",
    common: {
      name: "DC/PV Current",
      type: "number",
      role: "value.power.consumed",
      read: true,
      write: false
    },
    native: {}
  },
  SMART_ON_GRID_SWITCH: {
    type: "state",
    common: {
      name: "Smart Feeding",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  SCREEN_BRIGHTNESS: {
    type: "state",
    common: {
      name: "Display Brightness",
      type: "number",
      role: "level.brightness",
      read: true,
      write: false
    },
    native: {}
  },
  TIMED_GRID_CONNECTION: {
    type: "state",
    common: {
      name: "timed_grid_connection",
      type: "object",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  CHARGE_MODE_POWER_HM: {
    type: "state",
    common: {
      name: "Charging Input Power",
      type: "number",
      role: "value.power.consumed",
      read: true,
      write: false
    },
    native: {}
  },
  AC_SWITCH_HM: {
    type: "state",
    common: {
      name: "AC Outputs",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  AUTO_MIG_SET: {
    type: "state",
    common: {
      name: "Auto Feeding SoC",
      type: "object",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  FIT_ELECTRICITY_PRICE_SET: {
    type: "state",
    common: {
      name: "Price per kWh",
      type: "number",
      role: "value",
      read: true,
      write: false
    },
    native: {}
  },
  AC_OUTPUT_POWER: {
    type: "state",
    common: {
      name: "AC Output (W)",
      type: "number",
      role: "value.power.produced",
      read: true,
      write: false
    },
    native: {}
  },
  DC_SOLAR_INPUT: {
    type: "state",
    common: {
      name: "DC/PV Power",
      type: "number",
      role: "value.power.consumed",
      read: true,
      write: false
    },
    native: {}
  },
  AC_TIME_SWITCH: {
    type: "state",
    common: {
      name: "AC Charging Time Window",
      type: "boolean",
      role: "switch",
      read: true,
      write: false
    },
    native: {}
  },
  TOTAL_INPUT_POWER: {
    type: "state",
    common: {
      name: "Total Input (W)",
      type: "number",
      role: "value.power.consumed",
      read: true,
      write: true
    },
    native: {}
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  stateDefinitions
});
//# sourceMappingURL=states.js.map
