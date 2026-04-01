const OutputLevel = [0, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800] as const;

enum ChargeLevel {
    OFF = 0,
    NORMAL = 1,
    FAST = 2,
    SLOW = 3,
}

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
