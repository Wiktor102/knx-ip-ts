import { HostProtocolAddressInformation } from "./host.js";

class Message {
	payload: Buffer;

	constructor(
		public serviceType: number,
		public body: Buffer
	) {
		this.payload = Buffer.concat([this.getHeader(), body]);
	}

	private getHeader(): Buffer {
		const buffer = Buffer.alloc(6);
		buffer.writeUInt8(0x06, 0);
		buffer.writeUInt8(0x10, 1);
		buffer.writeUInt16BE(this.serviceType, 2);
		buffer.writeUInt16BE(this.body.length + 6, 4);

		return buffer;
	}

	public static parse(buffer: Buffer): Message {
		const serviceType = buffer.readUInt16BE(2);
		const body = buffer.subarray(6);

		switch (serviceType) {
			case 0x0202:
				return DiscoverResponse.fromBuffer(body);
			default:
				return new Message(serviceType, body);
		}
	}
}

class DiscoverRequest extends Message {
	constructor(public clientHost: HostProtocolAddressInformation) {
		super(0x0201, clientHost.toBuffer());
	}
}

class DiscoverResponse extends Message {
	constructor(public serverHost: HostProtocolAddressInformation) {
		super(0x0202, serverHost.toBuffer());
	}

	static fromBuffer(buffer: Buffer): DiscoverResponse {
		const host = HostProtocolAddressInformation.fromBuffer(buffer);
		return new DiscoverResponse(host);
	}
}

export { Message, DiscoverRequest, DiscoverResponse };
