import * as c from "../utilities/constants.js";
import Structure from "./Structure.js";

class HostProtocolAddressInformation extends Structure {
	constructor(
		public ip: string,
		public port: number
	) {
		super(8);
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(8);
		buffer.writeUInt8(0x08, 0);
		buffer.writeUInt8(c.IPV4_UDP, 1);

		this.ip.split(".").forEach((v, i) => {
			buffer.writeUint8(+v, i + 2);
		});

		buffer.writeUInt16BE(this.port, 6);

		return buffer;
	}

	static fromBuffer(buffer: Buffer): [HostProtocolAddressInformation, Buffer] {
		const structureLength = buffer.readUInt8(0);
		const ip = buffer.subarray(2, 6).join(".");
		const port = buffer.readUInt16BE(6);

		return [new HostProtocolAddressInformation(ip, port), buffer.subarray(structureLength)];
	}
}

export default HostProtocolAddressInformation;
