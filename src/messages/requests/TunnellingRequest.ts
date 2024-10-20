import * as c from "../../utilities/constants.js";

import CommonExternalMessageInterface from "../../CommonExternalMessageInterface/CommonExternalMessageInterface.js";
import ConnectionHeader from "../../structures/ConnectionHeader.js";
import { Request } from "./requests.js";

class TunnellingRequest extends Request {
	static serviceType = c.TUNNELLING_REQUEST;

	constructor(connectionHeader: ConnectionHeader, frame: CommonExternalMessageInterface) {
		super(connectionHeader.toBuffer(), frame.toBuffer());
	}

	public static fromBuffer(buffer: Buffer): TunnellingRequest {
		const [header, rest] = ConnectionHeader.fromBuffer(buffer);
		const cemi = CommonExternalMessageInterface.fromBuffer(rest);
		return new TunnellingRequest(header, cemi);
	}
}

export default TunnellingRequest;
