import GroupAddress from "../utilities/knx/GroupAddress.js";
import IndividualAddress from "../utilities/knx/IndividualAddress.js";

enum MediumAccessPriority {
	LOW = 0b11,
	NORMAL = 0b01,
	URGENT = 0b10,
	SYSTEM = 0b00
}

enum AddressType {
	INDIVIDUAL = 0,
	GROUP = 1
}

class DataLayerServicesHeader {
	constructor(
		public extendedFrame: boolean,
		public noRepeat: boolean,
		public priority: MediumAccessPriority,
		public error: boolean,
		public destinationAddressType: AddressType,
		public hopCount: number,
		public extendedFrameFormat: number,
		public sourceAddress: IndividualAddress,
		public destinationAddress: IndividualAddress | GroupAddress
	) {}

	public toBuffer(): Buffer {
		const ctrl1 =
			(this.extendedFrame ? 0b10000000 : 0) |
			(this.noRepeat ? 0b01000000 : 0) |
			(this.priority << 4) |
			(this.error ? 0b00000001 : 0);
		const ctrl2 =
			(this.destinationAddressType === AddressType.INDIVIDUAL ? 0 : 0b10000000) |
			(this.hopCount << 4) |
			this.extendedFrameFormat;
		const sourceAddressBuffer = this.sourceAddress.toBuffer();
		const destinationAddressBuffer = this.destinationAddress.toBuffer();

		const npduLength = 0; // TODO

		return Buffer.concat([Buffer.from([ctrl1, ctrl2]), sourceAddressBuffer, destinationAddressBuffer]);
	}

	public static fromBuffer(buffer: Buffer): DataLayerServicesHeader {
		const ctrl1 = buffer.readUInt8(0);
		const extendedFrame = (ctrl1 & 0b10000000) === 0;
		const repeat = (ctrl1 & 0b01000000) === 0;
		const priority = (ctrl1 & 0b00001100) >> 4;
		const error = (ctrl1 & 0b00000001) === 1;

		const ctrl2 = buffer.readUInt8(1);
		const destinationAddressType = (ctrl2 & 0b10000000) === 0 ? AddressType.INDIVIDUAL : AddressType.GROUP;
		const hopCount = (ctrl2 & 0b01110000) >> 4;
		const extendedFrameFormat = ctrl2 & 0b00001111;

		const sourceAddress = IndividualAddress.fromBuffer(buffer.subarray(2, 4));
		const destinationAddress =
			destinationAddressType === AddressType.INDIVIDUAL
				? IndividualAddress.fromBuffer(buffer.subarray(4, 6))
				: GroupAddress.fromBuffer(buffer.subarray(4, 6));

		const npduLength = buffer.readUInt8(6);
		const tpci = buffer.readUInt8(7) >> 2;
		const apci = ((buffer.readUInt8(7) & 3) << 8) | buffer.readUInt8(8);

		return new DataLayerServicesHeader(
			extendedFrame,
			repeat,
			priority,
			error,
			destinationAddressType,
			hopCount,
			extendedFrameFormat,
			sourceAddress,
			destinationAddress
		);
	}
}

export default DataLayerServicesHeader;
