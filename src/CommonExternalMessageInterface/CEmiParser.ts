import * as c from "../utilities/constants.js";

import CEmiAdditionalInformationParser from "./CEmiAdditionalInfoParser.js";
import DataLinkLayerCEmi from "./DataLinkLayer/DataLinkLayerCEmi.js";
import cEmi from "./CEmi.js";

abstract class CEmiParser {
	public static parse(buffer: Buffer): cEmi {
		const messageCode = buffer.readUInt8(0);
		const additionalInfoLength = buffer.readUInt8(1);
		const additionalInfo = CEmiAdditionalInformationParser.parseAll(additionalInfoLength, buffer.subarray(2));

		switch (messageCode) {
			case c.L_DATA_REQ:
			case c.L_DATA_CON:
			case c.L_DATA_IND:
				return DataLinkLayerCEmi.create(messageCode, additionalInfo, buffer.subarray(2 + additionalInfoLength));
			case c.T_DATA_CONNECTED_REQ:
			case c.T_DATA_CONNECTED_IND:
			case c.T_DATA_INDIVIDUAL_REQ:
			case c.T_DATA_INDIVIDUAL_IND:
				// data = DataLayerServicesHeader.fromBuffer(buffer.subarray(2 + additionalInfoLength));
				break;
			default:
				throw new Error(`Unknown message code: ${messageCode}`);
		}
		throw new Error(`Unknown message code: ${messageCode}`);
	}
}

export default CEmiParser;
