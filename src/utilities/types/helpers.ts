import Response from "../../messages/Response.js";
import { IStructureConstructor } from "../../structures/Structure.js";

type InstanceTypeOf<T> = T extends new (...args: any[]) => infer R ? R : never;
type MapTupleToInstances<T extends readonly any[]> = {
	[K in keyof T]: InstanceTypeOf<T[K]>;
};

type ResponseConstructor = new (chunks: any) => Response;
type ResponseConstructorTupleItem = IStructureConstructor | null;
type ChunksTuple<T extends readonly any[] = readonly any[]> = {
	[K in keyof T]: T[K] extends ResponseConstructorTupleItem ? T[K] : never;
};

export default MapTupleToInstances;
export { MapTupleToInstances, InstanceTypeOf, ResponseConstructor, ResponseConstructorTupleItem, ChunksTuple };
