import MapTupleToInstances, {
	ChunksTuple,
	ResponseConstructor,
	ResponseConstructorTupleItem
} from "../utilities/types/helpers.js";

import ConnectionResponse from "./ConnectionResponse.js";
import ConnectionStateRequest from "./requests/ConnectionStateRequest.js";
import ConnectionStateResponse from "./ConnectionStateResponse.js";
import DisconnectRequest from "./requests/DisconnectRequest.js";
import DisconnectResponse from "./DisconnectResponse.js";
import DiscoverResponse from "./DiscoverResponse.js";
import Header from "../structures/Header.js";
import Response from "./Response.js";
import SearchResponseExtended from "./SearchResponseExtended.js";
import Structure from "../structures/Structure.js";
import TunnellingRequest from "./requests/TunnellingRequest.js";

abstract class ResponseParser {
	public static parse(buffer: Buffer): Response {
		const [header, body] = Header.fromBuffer(buffer);
		let SubClass: ResponseConstructor;
		let chunkTypes: ChunksTuple;

		switch (header.serviceType) {
			//* Search
			case DiscoverResponse.serviceType:
				SubClass = DiscoverResponse;
				chunkTypes = DiscoverResponse.chunkTypes;
				break;
			case SearchResponseExtended.serviceType:
				SubClass = SearchResponseExtended;
				chunkTypes = SearchResponseExtended.chunkTypes;
				break;

			//* Connection
			case ConnectionResponse.serviceType:
				SubClass = ConnectionResponse;
				chunkTypes = ConnectionResponse.chunkTypes;
				break;

			//* Connection state
			case ConnectionStateRequest.serviceType:
				return ConnectionStateRequest.fromBuffer(body);
			case ConnectionStateResponse.serviceType:
				return ConnectionStateResponse.fromBuffer(body);

			//* Disconnect
			case DisconnectRequest.serviceType:
				return DisconnectRequest.fromBuffer(body);
			case DisconnectResponse.serviceType:
				return DisconnectResponse.fromBuffer(body);

			//* Tunnelling
			case TunnellingRequest.serviceType:
				return TunnellingRequest.fromBuffer(body);
			default:
				throw new Error(`Received a message of an unsupported service type: ${header.serviceType}`);
		}

		let flag = false;
		const [structures, rest] = chunkTypes.reduce<[Structure[], Buffer]>(
			([acc, rest], chunkType) => {
				if (rest?.length == 0 && !flag) {
					console.warn("No more response data to parse!");
					flag = true;
				}

				if (!chunkType || rest?.length == 0) {
					return [acc, rest];
				}

				const chunk = chunkType.fromBuffer(rest ?? body);
				return [[...acc, chunk[0]], chunk[1]];
			},
			[[], body]
		);

		if (rest != null && rest.length > 0) {
			console.warn(`There are still ${rest.length} bytes left in the buffer after parsing the response.`);
		}

		return new SubClass(structures, rest);
	}
}

export default ResponseParser;
