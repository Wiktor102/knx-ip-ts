import * as c from "../utilities/constants.js";

import Response from "./Response.js";

class ConnectionStateResponse extends Response {
	static errorCodes = [c.E_NO_ERROR, c.E_CONNECTION_ID, c.E_DATA_CONNECTION, c.E_KNX_CONNECTION] as const;
	static serviceType = c.CONNECTIONSTATE_RESPONSE;

	constructor(public channelId: number, public status: (typeof ConnectionStateResponse.errorCodes)[number]) {
		super(Buffer.from([channelId, status]));
	}

	static fromBuffer(buffer: Buffer): ConnectionStateResponse {
		const channelId = buffer.readUInt8(0);
		const status = buffer.readUInt8(1);

		if (!(ConnectionStateResponse.errorCodes as unknown as number[]).includes(status)) {
			throw new Error(
				`Received an invalid status code (${status}) when parsing ConnectionStateResponse from a buffer!`
			);
		}

		return new ConnectionStateResponse(channelId, status as (typeof ConnectionStateResponse.errorCodes)[number]);
	}
}

export default ConnectionStateResponse;
