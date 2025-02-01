import * as c from "../../utilities/constants.js";

import ApplicationLayerServices, {
	ApplicationLayerServiceInstance
} from "../ControlInformation/ApplicationProtocolControlInformation.js";

import CommonExternalMessageInterfaceAdditionalInformation from "../CommonExternalMessageInterfaceAdditionalInformation.js";
import GroupAddress from "../../utilities/knx/GroupAddress.js";
import IndividualAddress from "../../utilities/knx/IndividualAddress.js";
import TransportProtocolControlInformation from "../ControlInformation/TransportProtocolControlInformation.js";
import cEmi from "../CEmi.js";

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

class DataLinkLayerCEmi extends cEmi {
	constructor(
		messageCode: number,
		additionalInfo: CommonExternalMessageInterfaceAdditionalInformation[],
		public extendedFrame: boolean,
		public noRepeat: boolean,
		public priority: MediumAccessPriority,
		public error: boolean,
		public destinationAddressType: AddressType,
		public hopCount: number,
		public extendedFrameFormat: number,
		public sourceAddress: IndividualAddress,
		public destinationAddress: IndividualAddress | GroupAddress,
		public tpci: TransportProtocolControlInformation,
		public apci: ApplicationLayerServiceInstance,
		public data: Buffer
	) {
		if (![c.L_DATA_REQ, c.L_DATA_IND, c.L_DATA_CON].includes(messageCode))
			throw new Error(`Invalid message code for a Data Link Layer Service: ${messageCode}`);

		super(messageCode, additionalInfo, data);
	}

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

		return Buffer.concat([Buffer.from([ctrl1, ctrl2]), sourceAddressBuffer, destinationAddressBuffer]);
	}

	static create(
		messageCode: number,
		additionalInfo: CommonExternalMessageInterfaceAdditionalInformation[],
		buffer: Buffer
	): DataLinkLayerCEmi {
		const ctrl1 = buffer.readUInt8(0);
		const extendedFrame = (ctrl1 & 0b1000_0000) === 0;
		const noRepeat = (ctrl1 & 0b0100_0000) === 1;
		const priority = (ctrl1 & 0b0011_0000) >> 4;
		const error = (ctrl1 & 0b0000_0001) === 1;

		const ctrl2 = buffer.readUInt8(1);
		const destinationAddressType = (ctrl2 & 0b1000_0000) === 0 ? AddressType.INDIVIDUAL : AddressType.GROUP;
		const hopCount = (ctrl2 & 0b0111_0000) >> 4;
		const extendedFrameFormat = ctrl2 & 0b0000_1111;

		// TODO: if messageCode is L_DATA_REQ and sourceAddress is 0.0.0, then it should be replaced with the source address of the KNX interface (from KnxClient class)
		// TODO: if messageCode is L_DATA_REQ and destinationAddress is 0.0.0 and in transparent mode, send a negative confirmation (Confirm Flag set to 1 in L_Data.con, see clause 4.1.5.3.4 "L_Data.con")
		const sourceAddress = IndividualAddress.fromBuffer(buffer.subarray(2, 4));

		let destinationAddress: IndividualAddress | GroupAddress;
		if (destinationAddressType === AddressType.INDIVIDUAL) {
			destinationAddress = IndividualAddress.fromBuffer(buffer.subarray(4, 6));
		} else {
			destinationAddress = GroupAddress.fromBuffer(buffer.subarray(4, 6));
		}

		const npduLength = buffer.readUInt8(6); // As per the spec, this length excludes the byte with TPCI (but counts APCI)
		const tpci = TransportProtocolControlInformation.fromUInt8(buffer.readUInt8(7) & 0b1111_1100); // Last 2 bits are APCI
		const apci = ApplicationLayerServices.fromUint16BE(buffer.readUInt16BE(7) & 0b0000_0011_1111_1111);
		let data = buffer.subarray(9, 9 + npduLength);
		if (apci.length === 4) {
			data = Buffer.concat([Buffer.from([buffer.readUInt8(8) & 0b0011_1111]), data]);
		}

		return new DataLinkLayerCEmi(
			messageCode,
			additionalInfo,
			extendedFrame,
			noRepeat,
			priority,
			error,
			destinationAddressType,
			hopCount,
			extendedFrameFormat,
			sourceAddress,
			destinationAddress,
			tpci,
			apci,
			buffer.subarray(9, 9 + npduLength) // Skipping the byte with the APCI (although technically it may contain a part of data if APCI is only 4 bits)
		);
	}
}

export default DataLinkLayerCEmi;
