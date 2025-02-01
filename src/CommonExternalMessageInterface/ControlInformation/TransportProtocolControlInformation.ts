enum TransportProtocolType {
	DATA = 0,
	CONTROL = 1
}

class TransportProtocolControlInformation {
	constructor(
		public type: TransportProtocolType,
		public numbered: boolean,
		public sequence: number,
		public extra: number
	) {}

	static fromUInt8(value: number): TransportProtocolControlInformation {
		const type = (value & 0b1000_0000) >> 7;
		const numbered = (value & 0b0100_0000) >> 6 === 1;
		const sequence = (value & 0b0011_1100) >> 3;
		const extra = value & 0b0000_0011;
		return new TransportProtocolControlInformation(type, numbered, sequence, extra);
	}

	static fromBuffer(buffer: Buffer): TransportProtocolControlInformation {
		return TransportProtocolControlInformation.fromUInt8(buffer.readUInt8(0));
	}
}

export default TransportProtocolControlInformation;
