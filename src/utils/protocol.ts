import { type ChargeLevel, OutputLevel } from "../types";

class ProtocolParser {
    static parse(base: string, payload: string): Buffer {
        return Buffer.from(`${base} ${payload.padStart(2, "0").toUpperCase()}`.replace(/\s/g, ""), "hex");
    }

    static getOutputCommand(watts: (typeof OutputLevel)[number]): Buffer {
        const BASE = "aa aa 00 09 69 00 43 00 13 01 0a 00 ";
        const OUTPUT = OutputLevel.indexOf(watts).toString(16);

        return this.parse(BASE, OUTPUT);
    }

    static getChargeCommand(level: ChargeLevel): Buffer {
        const BASE = "aa aa 00 09 69 00 42 00 13 00 da 00 ";

        return this.parse(BASE, level.toString(16));
    }
}

export default ProtocolParser;
