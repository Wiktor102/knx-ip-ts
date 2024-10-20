import CommonExternalMessageInterfaceAdditionalInformation from "./CommonExternalMessageInterfaceAdditionalInformation.js";
import CommonExternalMessageInterfaceAdditionalInformationParser from "./CommonExternalMessageInterfaceAdditionalInformationParser.js";
import DataLayerServicesHeader from "./DataLayerServicesHeader.js";

// = cEMI
class CommonExternalMessageInterface {
	constructor(
		public messageCode: number,
		public additionalInfo: CommonExternalMessageInterfaceAdditionalInformation[],
		public data: any
	) {
		console.log(this);
	}

	public get additionalInfoLength(): number {
		return this.additionalInfo.reduce((acc, curr) => acc + curr.length + 2, 0); // +2 because additionalInfo[x].length is only the payload length - we must add 2 bytes for typeId and length itself
	}

	toBuffer(): Buffer {
		const additionalInfoBuffer = Buffer.concat(this.additionalInfo.map(info => info.toBuffer()));
		const buffer = Buffer.alloc(2 + additionalInfoBuffer.length);

		buffer.writeUInt8(this.messageCode, 0);
		buffer.writeUInt8(this.additionalInfoLength, 1);
		additionalInfoBuffer.copy(buffer, 2);

		return buffer;
	}

	public static fromBuffer(buffer: Buffer): CommonExternalMessageInterface {
		const messageCode = buffer.readUInt8(0);
		const additionalInfoLength = buffer.readUInt8(1);
		const additionalInfo = CommonExternalMessageInterfaceAdditionalInformationParser.parseAll(
			additionalInfoLength,
			buffer.subarray(2)
		);

		let data = null;
		switch (messageCode) {
			case 0x11:
			case 0x2e:
			case 0x29:
				data = DataLayerServicesHeader.fromBuffer(buffer.subarray(2 + additionalInfoLength));
				break;
			default:
				throw new Error(`Unknown message code: ${messageCode}`);
		}

		return new CommonExternalMessageInterface(messageCode, additionalInfo, data);
	}
}

export default CommonExternalMessageInterface;
