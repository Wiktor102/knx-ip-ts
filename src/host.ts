interface IHost {
	ip: string;
	port: number;
}

interface IHostProtocol extends IHost {
	toBuffer(): Buffer;
}

class HostProtocolAddressInformation implements IHostProtocol {
	constructor(
		public ip: string,
		public port: number
	) {}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(8);
		buffer.writeUInt8(0x08, 0);
		buffer.writeUInt8(0x01, 1);

		this.ip.split(".").forEach((v, i) => {
			buffer.writeUint8(+v, i + 2);
		});

		buffer.writeUInt16BE(this.port, 6);

		return buffer;
	}

	static fromBuffer(buffer: Buffer): HostProtocolAddressInformation {
		const ip = buffer.subarray(2, 6).join(".");
		const port = buffer.readUInt16BE(6);
		return new HostProtocolAddressInformation(ip, port);
	}
}

class HostProtocolIndependentDevice implements IHostProtocol {
	constructor(
		public ip: string,
		public port: number,
		public mac: string,
		public individualAddress: string
	) {}

	toBuffer(): Buffer {
		return Buffer.alloc(12);
	}
}

export { IHost, HostProtocolAddressInformation, HostProtocolIndependentDevice };
