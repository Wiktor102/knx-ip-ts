import { IConnectionInformation } from "./connection.js";
import { HostProtocolAddressInformation } from "./host.js";

class Request {
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
}

abstract class Response {
	public static parse(buffer: Buffer): Response | Buffer {
		const serviceType = buffer.readUInt16BE(2);
		const body = buffer.subarray(6);

		switch (serviceType) {
			case 0x0202:
				return DiscoverResponse.fromBuffer(body);
			case 0x0206:
				return ConnectionResponse.fromBuffer(body);
			default:
				return buffer;
		}
	}
}

class DiscoverRequest extends Request {
	constructor(public clientHost: HostProtocolAddressInformation) {
		super(0x0201, clientHost.toBuffer());
	}
}

class DiscoverResponse extends Response {
	constructor(public serverHost: HostProtocolAddressInformation) {
		super();
	}

	static fromBuffer(buffer: Buffer): DiscoverResponse {
		const host = HostProtocolAddressInformation.fromBuffer(buffer);
		return new DiscoverResponse(host);
	}
}

class ConnectionRequest extends Request {
	constructor(
		public controlHost: HostProtocolAddressInformation,
		dataHost: HostProtocolAddressInformation
	) {
		const hpai = controlHost.toBuffer();
		const cri = Buffer.from([0x04, 0x04, 0x02, 0x00]);

		super(0x0205, Buffer.concat([hpai, dataHost.toBuffer(), cri]));
	}
}

class ConnectionResponse extends Response {
	constructor(
		public chanel: number,
		public status: number,
		public server: HostProtocolAddressInformation,
		public connectionType: number,
		public individualAddress: number
	) {
		super();
	}

	static fromBuffer(body: Buffer): ConnectionResponse {
		return new ConnectionResponse(
			body[0],
			body[1],
			HostProtocolAddressInformation.fromBuffer(body.subarray(2, 10)),
			body[11],
			body.readUInt16BE(12)
		);
	}
}

class DisconnectRequest extends Request {
	constructor(clientHost: HostProtocolAddressInformation, connectionInfo: IConnectionInformation) {
		const buffer1 = Buffer.from([connectionInfo.chanel, 0x00]);
		super(0x0209, Buffer.concat([buffer1, clientHost.toBuffer()]));
	}
}

class DisconnectResponse extends Response {
	constructor(
		public chanel: number,
		public status: number
	) {
		super();
	}

	static fromBuffer(body: Buffer): DisconnectResponse {
		return new DisconnectResponse(body[0], body[1]);
	}
}

export {
	Request,
	Response,
	DiscoverRequest,
	DiscoverResponse,
	ConnectionRequest,
	ConnectionResponse,
	DisconnectRequest,
	DisconnectResponse
};
