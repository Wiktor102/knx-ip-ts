interface ISerializable {
	toBuffer(): Buffer;
}

interface ISerializableStatic {
	fromBuffer(buffer: Buffer): ISerializable;
}

export { ISerializable, ISerializableStatic };
