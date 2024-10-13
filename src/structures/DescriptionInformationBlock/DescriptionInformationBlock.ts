import Structure from "../Structure.js";

enum DescriptionInformationBlockTypes {
	UNKNOWN = 0x00,
	DEVICE_INFO = 0x01,
	SUPPORTED_SERVICE_FAMILIES = 0x02,
	IP_CONFIG = 0x03,
	IP_CURRENT_CONFIG = 0x04,
	KNX_ADDRESSES = 0x05,
	SECURED_SERVICE_FAMILIES = 0x06,
	TUNNELING_INFO = 0x07,
	EXTENDED_DEVICE_INFO = 0x08,
	MFR_DATA = 0xfe
}

abstract class DescriptionInformationBlock extends Structure {
	static descriptionType: DescriptionInformationBlockTypes;

	constructor(
		length: number,
		public descriptionType: DescriptionInformationBlockTypes
	) {
		super(length);

		if (descriptionType !== (this.constructor as typeof DescriptionInformationBlock).descriptionType) {
			throw new Error("Invalid description type");
		}
	}
}

export { DescriptionInformationBlock, DescriptionInformationBlockTypes };
export default DescriptionInformationBlock;
