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
var api_exports = {};
__export(api_exports, {
  default: () => api_default
});
module.exports = __toCommonJS(api_exports);
var import_crypto = __toESM(require("crypto"));
class ApiService {
  getRandomBelow(max) {
    return import_crypto.default.getRandomValues(new Uint32Array(1))[0] % max;
  }
  getRandom() {
    let result = "";
    for (let i = 0; i < 16; i++) {
      const choice = this.getRandomBelow(3);
      if (choice === 0) {
        result += this.getRandomBelow(10).toString();
      } else if (choice === 1) {
        result += String.fromCharCode(this.getRandomBelow(25) + 65);
      } else {
        result += String.fromCharCode(this.getRandomBelow(25) + 97);
      }
    }
    return result;
  }
  aesEncryptBase64(passwordPlain, random) {
    const md5Full = import_crypto.default.createHash("md5").update(random, "utf-8").digest("hex").toUpperCase();
    const md5Hash = md5Full.substring(8, 24);
    const keyBytes = Buffer.from(md5Hash, "utf-8");
    const ivBytes = Buffer.from(md5Hash.substring(8, 16) + md5Hash.substring(0, 8), "utf-8");
    const cipher = import_crypto.default.createCipheriv("aes-128-cbc", keyBytes, ivBytes);
    let encrypted = cipher.update(passwordPlain, "utf-8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }
  async login(email, password) {
    const URL = "https://iot-api.acceleronix.io/v2/enduser/enduserapi/emailPwdLogin";
    const DOMAIN_SECRET = "8px7ztwB8Khi3iax97VVhufBCSv6QT4oCimou1Dyrkkv";
    const userDomain = "E.DM.1209906967672817.3";
    const random = this.getRandom();
    const pwd = this.aesEncryptBase64(password, random);
    const signature = import_crypto.default.hash("sha256", `${email}${pwd}${random}${DOMAIN_SECRET}`).toString();
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        random,
        signature,
        userDomain,
        pwd,
        email
      })
    });
    const data = await response.json();
    if (!data.data) {
      throw new Error("Login failed: Invalid email or password");
    }
    return {
      accessToken: data.data.accessToken.token,
      accessTokenExpire: data.data.accessToken.expirationTime,
      refreshToken: data.data.refreshToken.token,
      refreshTokenExpire: data.data.refreshToken.expirationTime
    };
  }
  async refreshAccessToken(refreshToken) {
    const URL = "https://iot-api.acceleronix.io/v2/enduser/enduserapi/refreshToken";
    const response = await fetch(URL, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ refreshToken })
    });
    const data = await response.json();
    if (!data.data || data.code === 5032) {
      throw new Error("Refresh token expired or invalid");
    }
    return {
      accessToken: data.data.accessToken.token,
      accessTokenExpire: data.data.accessToken.expirationTime,
      refreshToken: data.data.refreshToken.token,
      refreshTokenExpire: data.data.refreshToken.expirationTime
    };
  }
  async getDeviceAttributes(accessToken, deviceKey, productKey) {
    const URL = `https://iot-api.acceleronix.io/v2/binding/enduserapi/getDeviceBusinessAttributes?dk=${deviceKey}&pk=${productKey}`;
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization: accessToken
      }
    });
    const data = await response.json();
    if (!data.data || data.code === 5032) {
      throw new Error("Failed to fetch device attributes");
    }
    const infos = data.data.customizeTslInfo;
    return Object.fromEntries(infos.map((info) => [info.resourceCode, info.resourceValce]));
  }
}
var api_default = ApiService;
//# sourceMappingURL=api.js.map
