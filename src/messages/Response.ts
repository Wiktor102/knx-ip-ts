import { ChunksTuple } from "../utilities/types/helpers.js";

abstract class Response {
	static readonly serviceType: number;
	static readonly chunkTypes: ChunksTuple;

	constructor(chunks: any) {}
}

export default Response;
