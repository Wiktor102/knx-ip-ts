import IndividualAddress from "../../utilities/IndividualAddress.js";
import Structure from "../Structure.js";

class ConnectionResponseDataBlock extends Structure {
	constructor(
		length: number,
		public connectionType: number,
		public individualAddress: IndividualAddress // This is only present when tunneling
	) {
		super(length);
	}

	static fromBuffer(buffer: Buffer): [ConnectionResponseDataBlock, Buffer] {
		const length = buffer[0];
		const connectionType = buffer[1];
		const individualAddress = IndividualAddress.fromBuffer(buffer.subarray(2, length));

		return [new ConnectionResponseDataBlock(length, connectionType, individualAddress), buffer.subarray(length)];
	}
}

export default ConnectionResponseDataBlock;
