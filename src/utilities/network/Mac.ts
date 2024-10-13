import { ISerializable } from "../interfaces/ISerializable.js";

class Mac implements ISerializable {
	private part1: number;
	private part2: number;
	private part3: number;
	private part4: number;
	private part5: number;
	private part6: number;

	constructor(macString: string);
	constructor(part1: number, part2: number, part3: number, part4: number, part5: number, part6: number);
	constructor(
		part1OrMacString: number | string,
		part2?: number,
		part3?: number,
		part4?: number,
		part5?: number,
		part6?: number
	) {
		if (typeof part1OrMacString === "string") {
			const parts = part1OrMacString.split(":").map(part => parseInt(part, 16));
			if (parts.length !== 6 || parts.some(part => part < 0 || part > 255)) {
				throw new Error("Invalid MAC address");
			}
			[this.part1, this.part2, this.part3, this.part4, this.part5, this.part6] = parts;
			return;
		}

		[this.part1, this.part2, this.part3, this.part4, this.part5, this.part6] = [
			part1OrMacString,
			part2!,
			part3!,
			part4!,
			part5!,
			part6!
		];
		if (
			[this.part1, this.part2, this.part3, this.part4, this.part5, this.part6].some(part => part! < 0 || part! > 255)
		) {
			throw new Error("Invalid MAC address");
		}
	}

	toString(): string {
		return `${this.part1.toString(16).padStart(2, "0")}:${this.part2.toString(16).padStart(2, "0")}:${this.part3.toString(16).padStart(2, "0")}:${this.part4.toString(16).padStart(2, "0")}:${this.part5.toString(16).padStart(2, "0")}:${this.part6.toString(16).padStart(2, "0")}`;
	}

	toArray(): number[] {
		return [this.part1, this.part2, this.part3, this.part4, this.part5, this.part6];
	}

	toBuffer(): Buffer {
		return Buffer.from(this.toArray());
	}

	static fromBuffer(buffer: Buffer): Mac {
		return new Mac(buffer[0], buffer[1], buffer[2], buffer[3], buffer[4], buffer[5]);
	}
}

export default Mac;
