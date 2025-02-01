import CEmiAdditionalInformation from "./CommonExternalMessageInterfaceAdditionalInformation.js";

// = cEMI
abstract class cEmi {
	constructor(public messageCode: number, public additionalInfo: CEmiAdditionalInformation[], public data: any) {}

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
}

export default cEmi;
