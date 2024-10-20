import { ISerializable } from "../utilities/interfaces/ISerializable.js";

abstract class CommonExternalMessageInterfaceAdditionalInformation implements ISerializable {
	constructor(public typeId: number, public length: number) {}

	abstract toBuffer(): Buffer;
}

export default CommonExternalMessageInterfaceAdditionalInformation;
