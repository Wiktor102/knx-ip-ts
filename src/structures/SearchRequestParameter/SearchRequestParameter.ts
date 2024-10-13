import { DescriptionInformationBlockTypes } from "../DescriptionInformationBlock/DescriptionInformationBlock.js";
import { ISerializable } from "../../utilities/interfaces/ISerializable.js";
import Mac from "../../utilities/network/Mac.js";
import ServiceFamily from "../../utilities/knx/ServiceFamily.js";
import Structure from "../Structure.js";

enum SearchRequestParameterType {
	UNKNOWN = 0x00,
	SELECT_BY_PROGRAMMING_MODE = 0x01,
	SELECT_BY_MAC_ADDRESS = 0x02,
	SELECT_BY_SERVICE = 0x03,
	REQUEST_DIBS = 0x04
}

class SearchRequestParameter extends Structure implements ISerializable {
	constructor(mandatory: boolean, type: SearchRequestParameterType.SELECT_BY_PROGRAMMING_MODE);
	constructor(mandatory: boolean, type: SearchRequestParameterType.SELECT_BY_MAC_ADDRESS, data: Mac);
	constructor(mandatory: boolean, type: SearchRequestParameterType.SELECT_BY_SERVICE, data: ServiceFamily);
	constructor(mandatory: boolean, type: SearchRequestParameterType.REQUEST_DIBS, data: DescriptionInformationBlockTypes[]);
	constructor(
		public mandatory: boolean,
		public type: SearchRequestParameterType,
		public data?: ISerializable | DescriptionInformationBlockTypes[]
	) {
		if (Array.isArray(data) && data.length % 2 != 0) data.push(DescriptionInformationBlockTypes.UNKNOWN);
		const dataLength = data == null ? 0 : "toBuffer" in data ? data.toBuffer().length : data.length;
		super(2 + dataLength);
	}

	toBuffer(): Buffer {
		const secondByte = (+this.mandatory << 7) | this.type;
		const header = Buffer.from([this.length, secondByte]);
		const data =
			this.data == null ? Buffer.alloc(0) : "toBuffer" in this.data ? this.data.toBuffer() : Buffer.from(this.data);

		return Buffer.concat([header, data]);
	}
}

export { SearchRequestParameter, SearchRequestParameterType };
export default SearchRequestParameter;
