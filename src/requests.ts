import * as c from "./utilities/constants.js";

import HostProtocolAddressInformation from "./structures/HostProtocolAddressInformation.js";

class Request {
	payload: Buffer;

	static serviceType: number;
	serviceType: number;

	constructor(public body: Buffer) {
		// this.payload = Buffer.concat([this.getHeader(), body]);
		this.payload = body;
		this.serviceType = (this.constructor as typeof Request).serviceType;
	}

	public getHeader(): Buffer {
		const buffer = Buffer.alloc(c.HEADER_SIZE_10);
		buffer.writeUInt8(c.HEADER_SIZE_10, 0);
		buffer.writeUInt8(c.KNXNETIP_VERSION_10, 1);
		buffer.writeUInt16BE(this.serviceType, 2);
		buffer.writeUInt16BE(c.HEADER_SIZE_10 + this.body.length, 4);

		return buffer;
	}

	public static getHeader(serviceType: number, bodyLength: number): Buffer {
		const buffer = Buffer.alloc(c.HEADER_SIZE_10);
		buffer.writeUInt8(c.HEADER_SIZE_10, 0);
		buffer.writeUInt8(c.KNXNETIP_VERSION_10, 1);
		buffer.writeUInt16BE(serviceType, 2);
		buffer.writeUInt16BE(c.HEADER_SIZE_10 + bodyLength, 4);

		return buffer;
	}
}

class SearchRequest extends Request {
	static serviceType = c.SEARCH_REQUEST;

	constructor(public clientControlEndpoint: HostProtocolAddressInformation) {
		super(clientControlEndpoint.toBuffer());
	}
}

class ConnectionRequest extends Request {
	static serviceType = c.CONNECT_REQUEST;

	constructor(
		public clientControlEndpoint: HostProtocolAddressInformation,
		public clientDataEndpoint: HostProtocolAddressInformation
	) {
		const cri = Buffer.from([0x04, 0x04, 0x02, 0x00]);

		// clientControlEndpoint is automatically added by the KnxControlSocket class
		super(Buffer.concat([clientControlEndpoint.toBuffer(), clientDataEndpoint.toBuffer(), cri]));
	}
}

class DisconnectRequest extends Request {
	static serviceType = c.DISCONNECT_REQUEST;

	constructor(
		public clientControlEndpoint: HostProtocolAddressInformation,
		chanelId: number
	) {
		super(Buffer.concat([Buffer.from([chanelId, 0x00]), clientControlEndpoint.toBuffer()]));
	}
}

export { Request, SearchRequest, ConnectionRequest, DisconnectRequest };
