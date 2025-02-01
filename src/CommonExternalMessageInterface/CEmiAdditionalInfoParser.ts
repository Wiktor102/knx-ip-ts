import CommonExternalMessageInterfaceAdditionalInformation from "./CommonExternalMessageInterfaceAdditionalInformation.js";

type CommonExternalMessageInterfaceAdditionalInformationConstructor = new (
	payload: Buffer
) => CommonExternalMessageInterfaceAdditionalInformation;
abstract class CommonExternalMessageInterfaceAdditionalInformationParser {
	public static parse(buffer: Buffer): [CommonExternalMessageInterfaceAdditionalInformation, Buffer] {
		const typeId = buffer.readUInt8(0);
		const length = buffer.readUInt8(1);
		const payload = buffer.subarray(2, length + 2);

		let SubClass: CommonExternalMessageInterfaceAdditionalInformationConstructor;

		switch (typeId) {
			default:
				throw new Error(`Received a cEMI additional information of an unsupported type: ${typeId}`);
		}

		return [new SubClass(payload), buffer.subarray(length + 2)];
	}

	public static parseAll(
		totalAdditionalInformationLength: number,
		buffer: Buffer
	): CommonExternalMessageInterfaceAdditionalInformation[] {
		buffer = buffer.subarray(0, totalAdditionalInformationLength);
		const additionalInformation: CommonExternalMessageInterfaceAdditionalInformation[] = [];

		while (buffer.length > 0) {
			const [info, rest] = this.parse(buffer);
			additionalInformation.push(info);
			buffer = rest;
		}

		return additionalInformation;
	}
}

export default CommonExternalMessageInterfaceAdditionalInformationParser;
