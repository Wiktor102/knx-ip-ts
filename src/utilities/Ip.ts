class Ip {
	constructor(
		private part1: number,
		private part2: number,
		private part3: number,
		private part4: number
	) {
		if (part1 < 0 || part1 > 255 || part2 < 0 || part2 > 255 || part3 < 0 || part3 > 255 || part4 < 0 || part4 > 255) {
			throw new Error("Invalid IP address");
		}
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
