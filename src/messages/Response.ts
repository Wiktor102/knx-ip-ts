import { ChunksTuple } from "../utilities/types/helpers.js";

abstract class Response {
	static readonly serviceType: number;
	static readonly chunkTypes: ChunksTuple;

	constructor(chunks: any, rest?: Buffer | null) {}
}

export default Response;
