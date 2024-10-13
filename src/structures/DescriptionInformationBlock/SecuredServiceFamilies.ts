import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import ServiceFamily from "../../utilities/ServiceFamily.js";

class SecuredServiceFamilies extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.SECURED_SERVICE_FAMILIES;

	constructor(
		length: number,
		public families: ServiceFamily[]
	) {
		super(length, SecuredServiceFamilies.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [SecuredServiceFamilies, Buffer] {
		const length = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);

		if (type != SecuredServiceFamilies.descriptionType) throw new Error("Invalid description type");
		if (length < 2) throw new Error("Expected at least 1 byte, but got " + length);
		if (length % 2 !== 0) throw new Error("Expected an even number of bytes, but got " + length);

		let families: ServiceFamily[] = [];
		if (buffer.length > 4) {
			families = buffer.subarray(4, length).reduce<ServiceFamily[]>((acc, byte, index) => {
				if (index % 2 === 0) {
					acc.push(ServiceFamily.fromBuffer(buffer.subarray(index, index + 2)));
				}
				return acc;
			}, []);
		}

		return [new SecuredServiceFamilies(length, families), buffer.subarray(length)];
	}
}

export default SecuredServiceFamilies;
