import * as c from "../utilities/constants.js";

import ConnectionResponseDataBlock from "../structures/ConnectionResponse/ConnectionResponseDataBlock.js";
import ConnectionResponseHeader from "../structures/ConnectionResponse/ConnectionResponseHeader.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import IndividualAddress from "../utilities/knx/IndividualAddress.js";
import MapTupleToInstances from "../utilities/types/helpers.js";
import Response from "./Response.js";

// TODO: Rename to ConnectResponse
class ConnectionResponse extends Response {
	static serviceType = c.CONNECT_RESPONSE;
	static readonly chunkTypes = [
		ConnectionResponseHeader,
		HostProtocolAddressInformation,
		ConnectionResponseDataBlock
	] as const;

	chanelId: number;
	status: number;
	server?: HostProtocolAddressInformation;
	connectionType?: number;
	individualAddress?: IndividualAddress;

	constructor(chunks: MapTupleToInstances<typeof ConnectionResponse.chunkTypes>) {
		super(chunks);

		this.chanelId = chunks[0].chanel;
		this.status = chunks[0].status;

		if (this.status === 0x00) {
			this.server = chunks[1];
			this.connectionType = chunks[2].connectionType;
			this.individualAddress = chunks[2].individualAddress;
		}
	}
}

export default ConnectionResponse;
