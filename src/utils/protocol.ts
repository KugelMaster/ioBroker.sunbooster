import { type ChargeLevel, OutputLevel } from "../types";

/**
 * A helper class to build the MQTT protocol. Contains pre-defined protocol headers.
 * The methods allow an easier construction of byte-words.
 */
class ProtocolBuilder {
    /**
     * A general parser.
     *
     * @param base - The header of the byte-word
     * @param payload - The data after the header. Expect max one byte!
     * @returns the entire word byte-encoded
     */
    static parse(base: string, payload: string): Buffer {
        return Buffer.from(`${base} ${payload.padStart(2, "0").toUpperCase()}`.replace(/\s/g, ""), "hex");
    }

    /**
     * Builds the power output command for the battery device.
     *
     * @param watts - How many watts the battery should output into the grid
     */
    static buildOutputCommand(watts: (typeof OutputLevel)[number]): Buffer {
        const BASE = "aa aa 00 09 69 00 43 00 13 01 0a 00 ";
        const OUTPUT = OutputLevel.indexOf(watts).toString(16);

        return this.parse(BASE, OUTPUT);
    }

    /**
     * Builds the power charge command for the battery device.
     *
     * @param level - How fast the battery should charge itself
     */
    static buildChargeCommand(level: ChargeLevel): Buffer {
        const BASE = "aa aa 00 09 69 00 42 00 13 00 da 00 ";

        return this.parse(BASE, level.toString(16));
    }
}

export default ProtocolBuilder;
