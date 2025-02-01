import * as c from "../../utilities/constants.js";

import CEmiParser from "../../CommonExternalMessageInterface/CEmiParser.js";
import ConnectionHeader from "../../structures/ConnectionHeader.js";
import { Request } from "./requests.js";
import cEmi from "../../CommonExternalMessageInterface/CEmi.js";

class TunnellingRequest extends Request {
	static serviceType = c.TUNNELLING_REQUEST;

	constructor(connectionHeader: ConnectionHeader, public frame: cEmi) {
		super(connectionHeader.toBuffer(), frame.toBuffer());
	}

	public static fromBuffer(buffer: Buffer): TunnellingRequest {
		const [header, rest] = ConnectionHeader.fromBuffer(buffer);
		const cemi = CEmiParser.parse(rest);
		return new TunnellingRequest(header, cemi);
	}
}

export default TunnellingRequest;
