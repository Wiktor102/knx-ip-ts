class GroupAddress {
	constructor(public mainGroup: number, public middleGroup: number, public subGroup: number) {
		if (mainGroup < 0 || mainGroup > 31) {
			throw new Error("Main group must be between 0 and 31");
		}

		if (middleGroup < 0 || middleGroup > 7) {
			throw new Error("Middle group must be between 0 and 7");
		}

		if (subGroup < 0 || subGroup > 255) {
			throw new Error("Sub group must be between 0 and 255");
		}
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(2);
		buffer.writeUInt8((this.mainGroup << 3) | this.middleGroup, 0);
		buffer.writeUInt8(this.subGroup, 1);

		return buffer;
	}

	static fromBuffer(buffer: Buffer): GroupAddress {
		const mainGroup = (buffer.readUInt8(0) & 0b11111000) >> 3;
		const middleGroup = buffer.readUInt8(0) & 0b00000111;
		const subGroup = buffer.readUInt8(1);

		return new GroupAddress(mainGroup, middleGroup, subGroup);
	}
}

export default GroupAddress;
