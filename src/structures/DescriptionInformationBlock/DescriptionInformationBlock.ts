import Structure from "../Structure.js";

abstract class DescriptionInformationBlock extends Structure {
	static descriptionType: number;

	constructor(
		length: number,
		public descriptionType: number
	) {
		super(length);

		if (descriptionType !== (this.constructor as typeof DescriptionInformationBlock).descriptionType) {
			throw new Error("Invalid description type");
		}
	}
}

export default DescriptionInformationBlock;
