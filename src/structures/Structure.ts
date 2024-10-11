interface IStructureConstructor {
	new (...args: any[]): Structure;
	fromBuffer: (buffer: Buffer) => [Structure, Buffer];
}

class Structure {
	constructor(protected length: number) {
		if (new.target === Structure) {
			throw new Error("Cannot instantiate Structure directly, use a subclass instead");
		}
	}

	static fromBuffer(buffer: Buffer): [Structure, Buffer] {
		throw new Error("Method not implemented.");
	}
}

export { IStructureConstructor };
export default Structure;
