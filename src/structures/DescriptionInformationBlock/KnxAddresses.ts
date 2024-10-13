import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import IndividualAddress from "../../utilities/IndividualAddress.js";

class KnxAddresses extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.KNX_ADDRESSES;

	constructor(
		length: number,
		public individualAddress: IndividualAddress,
		public addresses: IndividualAddress[]
	) {
		super(length, KnxAddresses.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [KnxAddresses, Buffer] {
		const length = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);

		if (type != KnxAddresses.descriptionType) throw new Error("Invalid description type");
		if (length < 4) throw new Error("Expected at least 3 bytes, but got " + length);
		if (length % 2 != 0) throw new Error("Expected an even number of bytes, but got " + length);

		const individualAddress = IndividualAddress.fromBuffer(buffer.subarray(2, 4));
		let addresses: IndividualAddress[] = [];
		if (buffer.length > 4) {
			addresses = buffer.subarray(4, length).reduce<IndividualAddress[]>((acc, byte, index) => {
				if (index % 2 === 0) {
					acc.push(IndividualAddress.fromBuffer(buffer.subarray(index, index + 2)));
				}
				return acc;
			}, []);
		}

		return [new KnxAddresses(length, individualAddress, addresses), buffer.subarray(length)];
	}
}

export default KnxAddresses;
