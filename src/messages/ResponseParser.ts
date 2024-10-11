import Header from "../structures/Header.js";
import Structure from "../structures/Structure.js";
import { ChunksTuple, ResponseConstructor } from "../utilities/types/helpers.js";
import ConnectionResponse from "./ConnectionResponse.js";
import DiscoverResponse from "./DiscoverResponse.js";
import Response from "./Response.js";

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
			case ConnectionResponse.serviceType:
				SubClass = ConnectionResponse;
				chunkTypes = ConnectionResponse.chunkTypes;
				break;
			// case TunnelingRequest.serviceType:
			// 	return TunnelingRequest.fromBuffer(body);
			default:
				throw new Error(`Received a message of an unsupported service type: ${header.serviceType}`);
		}

		const [structures, rest] = chunkTypes.reduce<[Structure[], Buffer | null]>(
			([acc, rest], chunkType) => {
				if (!chunkType) return [acc, rest];
				// console.log(rest ?? body, chunkType.name);
				const chunk = chunkType.fromBuffer(rest ?? body);
				return [[...acc, chunk[0]], chunk[1]];
			},
			[[], null]
		);

		if (rest != null && rest.length > 0) {
			console.warn(`There are still ${rest.length} bytes left in the buffer after parsing the response.`);
		}

		return new SubClass(structures);
	}
}

export default ResponseParser;
