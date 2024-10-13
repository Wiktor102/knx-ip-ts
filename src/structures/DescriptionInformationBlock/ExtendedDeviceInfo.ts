import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import Structure from "../Structure.js";

class ExtendedDeviceInfo extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.EXTENDED_DEVICE_INFO;

	constructor(
		length: number,
		public mediumStatus: number,
		public maxApduLength: number,
		public maskVersion: number
	) {
		super(length, ExtendedDeviceInfo.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [ExtendedDeviceInfo, Buffer] {
		const length = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);

		if (type != ExtendedDeviceInfo.descriptionType) throw new Error("Invalid description type");
		if (length != 8) throw new Error("Expected 8 bytes, but got " + length);

		const mediumStatus = buffer.readUInt8(2);
		const maxApduLength = buffer.readUInt16BE(4);
		const maskVersion = buffer.readUInt16BE(6);

		return [new ExtendedDeviceInfo(length, mediumStatus, maxApduLength, maskVersion), buffer.subarray(length)];
	}
}

export default ExtendedDeviceInfo;
