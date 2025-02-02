import * as c from "../../utilities/constants.js";

import HostProtocolAddressInformation from "../../structures/HostProtocolAddressInformation.js";
import { Request } from "./requests.js";

class ConnectionStateRequest extends Request {
	static serviceType = c.CONNECTIONSTATE_REQUEST;

	constructor(public channelId: number, public clientControlEndpoint: HostProtocolAddressInformation) {
		super(Buffer.from([channelId, 0x00]), clientControlEndpoint.toBuffer());
	}

	static fromBuffer(buffer: Buffer): ConnectionStateRequest {
		const channelId = buffer.readUInt8(0);
		const [clientControlEndpoint] = HostProtocolAddressInformation.fromBuffer(buffer.subarray(1, 7));
		return new ConnectionStateRequest(channelId, clientControlEndpoint);
	}
}

export default ConnectionStateRequest;
