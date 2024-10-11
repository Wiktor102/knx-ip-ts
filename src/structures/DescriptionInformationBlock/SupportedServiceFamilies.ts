import DescriptionInformationBlock from "./DescriptionInformationBlock.js";

class SupportedServiceFamilies extends DescriptionInformationBlock {
	static descriptionType = 0x02;

	constructor(
		length: number,
		public supportedServiceTypes: number[]
	) {
		super(length, SupportedServiceFamilies.descriptionType);
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(this.length);
		buffer.writeUInt8(this.length, 0);

		for (let i = 0; i < this.supportedServiceTypes.length; i++) {
			buffer.writeUInt16BE(this.supportedServiceTypes[i], i * 2 + 1);
		}

		return buffer;
	}

	static fromBuffer(buffer: Buffer): [SupportedServiceFamilies, Buffer] {
		const structureLength = buffer.readUInt8(0);
		const supportedServiceTypes = [];

		for (let i = 2; i < structureLength; i += 2) {
			supportedServiceTypes.push(buffer.readUInt16BE(i));
		}

		return [new SupportedServiceFamilies(structureLength, supportedServiceTypes), buffer.subarray(structureLength)];
	}
}

export default SupportedServiceFamilies;
