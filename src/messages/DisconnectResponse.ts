import * as c from "../utilities/constants.js";

import MapTupleToInstances from "../utilities/types/helpers.js";
import Response from "./Response.js";

// TODO: Convert the rest into chunks (ex. DisconnectResponsePayload)
class DisconnectResponse extends Response {
	static serviceType = c.DISCONNECT_RESPONSE;
	static chunkTypes = [] as const;

	public channelId: number;
	public status: number;

	constructor(chunks: MapTupleToInstances<typeof DisconnectResponse.chunkTypes>, rest: Buffer) {
		super(chunks);

		this.channelId = rest.readUInt8(0);
		this.status = rest.readUInt8(1);
	}
}

export default DisconnectResponse;
