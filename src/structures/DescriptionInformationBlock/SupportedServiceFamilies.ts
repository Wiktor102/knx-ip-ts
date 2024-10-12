import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import ServiceFamily from "../../utilities/ServiceFamily.js";

class SupportedServiceFamilies extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.SUPPORTED_SERVICE_FAMILIES;

	constructor(
		length: number,
		public supportedServiceFamilies: ServiceFamily[]
	) {
		super(length, SupportedServiceFamilies.descriptionType);
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(this.length);
		buffer.writeUInt8(this.length, 0);

		for (let i = 0; i < this.supportedServiceFamilies.length; i++) {
			buffer.writeUInt16BE(this.supportedServiceFamilies[i].toServiceTypeId(), i * 2 + 1);
		}

		return buffer;
	}

	static fromBuffer(buffer: Buffer): [SupportedServiceFamilies, Buffer] {
		const structureLength = buffer.readUInt8(0);
		const supportedServiceTypes = [];

		for (let i = 2; i < structureLength; i += 2) {
			supportedServiceTypes.push(ServiceFamily.fromServiceTypeId(buffer.readUInt16BE(i)));
		}

		return [new SupportedServiceFamilies(structureLength, supportedServiceTypes), buffer.subarray(structureLength)];
	}
}

export default SupportedServiceFamilies;
