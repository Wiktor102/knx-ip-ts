import * as c from "../../utilities/constants.js";

import HostProtocolAddressInformation from "../../structures/HostProtocolAddressInformation.js";
import { Request } from "./requests.js";

class DisconnectRequest extends Request {
	static serviceType = c.DISCONNECT_REQUEST;

	constructor(public clientControlEndpoint: HostProtocolAddressInformation, public channelId: number) {
		super(Buffer.from([channelId, 0x00]), clientControlEndpoint.toBuffer());
	}

	static fromBuffer(buffer: Buffer): DisconnectRequest {
		const channelId = buffer.readUInt8(0);
		// Byte 1 is reserved
		const [hpai] = HostProtocolAddressInformation.fromBuffer(buffer.subarray(2));
		return new DisconnectRequest(hpai, channelId);
	}
}

export default DisconnectRequest;
