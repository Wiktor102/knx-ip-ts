import { ISerializable } from "./interfaces/ISerializable.js";

class ServiceFamily implements ISerializable {
	constructor(
		public familyId: number,
		public version: number
	) {}

	toServiceTypeId(): number {
		return (this.familyId << 8) | this.version;
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(2);
		buffer.writeUInt8(this.familyId, 0);
		buffer.writeUInt8(this.version, 1);
		return buffer;
	}

	static fromBuffer(buffer: Buffer): ServiceFamily {
		return new ServiceFamily(buffer.readUInt8(0), buffer.readUInt8(1));
	}

	static fromServiceTypeId(serviceTypeId: number): ServiceFamily {
		const familyId = (serviceTypeId & 0xff00) >> 8;
		const version = serviceTypeId & 0x00ff;
		return new ServiceFamily(familyId, version);
	}
}

export default ServiceFamily;
