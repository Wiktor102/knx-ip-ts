import { ISerializable } from "../utilities/interfaces/ISerializable.js";
import Structure from "./Structure.js";

class ConnectionHeader extends Structure implements ISerializable {
	constructor(public channelId: number, public sequence: number) {
		super(4);
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(4);
		buffer.writeUInt8(4, 0);
		buffer.writeUInt8(this.channelId, 1);
		buffer.writeUInt8(this.sequence, 2);
		return buffer;
	}

	static fromBuffer(buffer: Buffer): [ConnectionHeader, Buffer] {
		const length = buffer[0];
		if (length !== 4) {
			throw new Error(`Invalid connection header length: ${length}`);
		}

		const channelId = buffer[1];
		const sequence = buffer[2];

		return [new ConnectionHeader(channelId, sequence), buffer.subarray(length)];
	}
}

export default ConnectionHeader;
