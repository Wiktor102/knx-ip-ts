import Response from "./Response.js";
import * as c from "../utilities/constants.js";
import MapTupleToInstances from "../utilities/types/helpers.js";

class ConnectionResponse extends Response {
	static serviceType = c.CONNECT_RESPONSE;
	static readonly chunkTypes = [] as const;

	constructor(chunks: MapTupleToInstances<typeof ConnectionResponse.chunkTypes>) {
		super(chunks);
		// super();
		// console.log(chunks);
	}

	// constructor(
	// 	public chanel: number,
	// 	public status: number,
	// 	public server: HostProtocolAddressInformation,
	// 	public connectionType: number,
	// 	public individualAddress: number
	// ) {
	// 	super();
	// }

	// static fromBuffer(body: Buffer): ConnectionResponse {
	// 	return new ConnectionResponse(
	// 		body[0],
	// 		body[1],
	// 		HostProtocolAddressInformation.fromBuffer(body.subarray(2, 10))[0],
	// 		body[11],
	// 		body.readUInt16BE(12)
	// 	);
	// }
}

export default ConnectionResponse;
