import Structure from "./Structure.js";

class Header extends Structure {
	constructor(
		length: number,
		public version: number,
		public serviceType: number,
		public totalLength: number
	) {
		super(length);
	}

	static fromBuffer(buffer: Buffer): [Header, Buffer] {
		const length = buffer[0];
		const header = buffer.subarray(0, length);

		return [new Header(length, header[1], header.readUInt16BE(2), header.readUInt16BE(4)), buffer.subarray(length)];
	}
}

export default Header;
