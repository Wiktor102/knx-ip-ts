import Response from "./Response.js";
import * as c from "../utilities/constants.js";
import MapTupleToInstances from "../utilities/types/helpers.js";

class DisconnectResponse extends Response {
	static serviceType = c.DISCONNECT_RESPONSE;
	static chunkTypes = [] as const;

	constructor(chunks: MapTupleToInstances<typeof DisconnectResponse.chunkTypes>) {
		super(chunks);
		// super();
		// console.log(chunks);
	}

	// constructor(
	// 	public chanel: number,
	// 	public status: number
	// ) {
	// 	super();
	// }

	// static fromBuffer(body: Buffer): DisconnectResponse {
	// 	return new DisconnectResponse(body[0], body[1]);
	// }
}

export default DisconnectResponse;
