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
var types_exports = {};
__export(types_exports, {
  ChargeLevel: () => ChargeLevel,
  OutputLevel: () => OutputLevel
});
module.exports = __toCommonJS(types_exports);
const OutputLevel = [0, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800];
var ChargeLevel = /* @__PURE__ */ ((ChargeLevel2) => {
  ChargeLevel2[ChargeLevel2["OFF"] = 0] = "OFF";
  ChargeLevel2[ChargeLevel2["NORMAL"] = 1] = "NORMAL";
  ChargeLevel2[ChargeLevel2["FAST"] = 2] = "FAST";
  ChargeLevel2[ChargeLevel2["SLOW"] = 3] = "SLOW";
  return ChargeLevel2;
})(ChargeLevel || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChargeLevel,
  OutputLevel
});
//# sourceMappingURL=types.js.map
