import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import TunnelingSlot from "../../utilities/knx/TunnelingSlot.js";

class TunnelingInfo extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.TUNNELING_INFO;

	constructor(
		length: number,
		public maxApduLength: number,
		public tunnelingSlots: TunnelingSlot[]
	) {
		super(length, TunnelingInfo.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [TunnelingInfo, Buffer] {
		const length = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);

		if (type != TunnelingInfo.descriptionType) throw new Error("Invalid description type");
		if (length < 4) throw new Error("Expected 2 bytes, but got " + length);
		if (length % 4 !== 0) throw new Error("Expected multiple of 4 number of bytes, but got " + length);

		const apduLength = buffer.readUInt16BE(2);
		let tunnelingSlots: TunnelingSlot[] = [];
		if (buffer.length > 4) {
			tunnelingSlots = buffer.subarray(4, length).reduce<TunnelingSlot[]>((acc, byte, index) => {
				if (index % 4 === 0) {
					acc.push(TunnelingSlot.fromBuffer(buffer.subarray(index, index + 4)));
				}
				return acc;
			}, []);
		}

		return [new TunnelingInfo(length, apduLength, tunnelingSlots), buffer.subarray(length)];
	}
}

export default TunnelingInfo;
