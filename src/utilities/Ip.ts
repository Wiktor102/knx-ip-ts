class Ip {
	private part1: number;
	private part2: number;
	private part3: number;
	private part4: number;

	constructor(ipString: string);
	constructor(part1: number, part2: number, part3: number, part4: number);
	constructor(part1OrIpString: number | string, part2?: number, part3?: number, part4?: number) {
		if (typeof part1OrIpString === "string") {
			const parts = part1OrIpString.split(".").map(Number);
			if (parts.length !== 4 || parts.some(part => part < 0 || part > 255)) {
				throw new Error("Invalid IP address");
			}
			[this.part1, this.part2, this.part3, this.part4] = parts;
			return;
		}

		[this.part1, this.part2, this.part3, this.part4] = [part1OrIpString, part2!, part3!, part4!];
		if ([this.part1, this.part2, this.part3, this.part4].some(part => part! < 0 || part! > 255)) {
			throw new Error("Invalid IP address");
		}
	}

	toString(): string {
		return `${this.part1}.${this.part2}.${this.part3}.${this.part4}`;
	}

	asArray(): number[] {
		return [this.part1, this.part2, this.part3, this.part4];
	}

	asBuffer(): Buffer {
		return Buffer.from(this.asArray());
	}

	static fromBuffer(buffer: Buffer): Ip {
		return new Ip(buffer[0], buffer[1], buffer[2], buffer[3]);
	}
}

export default Ip;
