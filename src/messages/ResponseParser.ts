import { ChunksTuple, ResponseConstructor } from "../utilities/types/helpers.js";

import ConnectionResponse from "./ConnectionResponse.js";
import DisconnectResponse from "./DisconnectResponse.js";
import DiscoverResponse from "./DiscoverResponse.js";
import Header from "../structures/Header.js";
import Response from "./Response.js";
import SearchResponseExtended from "./SearchResponseExtended.js";
import Structure from "../structures/Structure.js";

abstract class ResponseParser {
	public static parse(buffer: Buffer): Response | Buffer {
		const [header, body] = Header.fromBuffer(buffer);
		let SubClass: ResponseConstructor;
		let chunkTypes: ChunksTuple;

		switch (header.serviceType) {
			case DiscoverResponse.serviceType:
				SubClass = DiscoverResponse;
				chunkTypes = DiscoverResponse.chunkTypes;
				break;
			case SearchResponseExtended.serviceType:
				SubClass = SearchResponseExtended;
				chunkTypes = SearchResponseExtended.chunkTypes;
				break;
			case ConnectionResponse.serviceType:
				SubClass = ConnectionResponse;
				chunkTypes = ConnectionResponse.chunkTypes;
				break;
			case DisconnectResponse.serviceType:
				SubClass = DisconnectResponse;
				chunkTypes = DisconnectResponse.chunkTypes;
				break;
			// case TunnelingRequest.serviceType:
			// 	return TunnelingRequest.fromBuffer(body);
			default:
				return Buffer.alloc(0);
			// throw new Error(`Received a message of an unsupported service type: ${header.serviceType}`);
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

				// console.log(rest ?? body, chunkType.name);
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
