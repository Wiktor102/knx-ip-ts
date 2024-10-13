class IndividualAddress {
	constructor(
		public area: number,
		public line: number,
		public device: number
	) {
		if (area < 0 || area > 15) {
			throw new Error("Area must be between 0 and 15");
		}

		if (line < 0 || line > 15) {
			throw new Error("Line must be between 0 and 15");
		}

		if (device < 0 || device > 255) {
			throw new Error("Device must be between 0 and 255");
		}
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(2);
		buffer.writeUInt8((this.area << 4) | this.line, 0);
		buffer.writeUInt8(this.device, 1);

		return buffer;
	}

	static fromBuffer(buffer: Buffer): IndividualAddress {
		const area = buffer.readUInt8(0) >> 4;
		const line = buffer.readUInt8(0) & 0x0f;
		const device = buffer.readUInt8(1);

		return new IndividualAddress(area, line, device);
	}
}

export default IndividualAddress;
