import * as c from "../utilities/constants.js";

import { Request } from "./requests/requests.js";
import Response from "./Response.js";

class DisconnectResponse extends Request {
	static serviceType = c.DISCONNECT_RESPONSE;
	static chunkTypes = [] as const;

	constructor(public channelId: number, public status: number) {
		super(Buffer.alloc(2));
		this.payload.writeUInt8(this.channelId, 0);
		this.payload.writeUInt8(this.status, 1);
	}

	// asRequest(): DisconnectResponseMsg {
	// 	return new DisconnectResponseMsg(this.channelId, this.status);
	// }

	static fromBuffer(buffer: Buffer): DisconnectResponse {
		return new DisconnectResponse(buffer.readUInt8(0), buffer.readUInt8(1));
	}
}

export default DisconnectResponse;
