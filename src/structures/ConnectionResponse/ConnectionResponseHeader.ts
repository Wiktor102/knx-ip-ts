import Structure from "../Structure.js";

class ConnectionResponseHeader extends Structure {
	constructor(
		public chanel: number,
		public status: number
	) {
		super(2);
		this.chanel = chanel;
		this.status = status;
	}

	static fromBuffer(buffer: Buffer): [ConnectionResponseHeader, Buffer] {
		const chanel = buffer[0];
		const status = buffer[1];

		return [new ConnectionResponseHeader(chanel, status), buffer.subarray(2)];
	}
}

export default ConnectionResponseHeader;
