import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import IndividualAddress from "../../utilities/knx/IndividualAddress.js";
import Ip from "../../utilities/network/Ip.js";
import ProjectInstallationIdentifier from "../../utilities/knx/ProjectInstallationIdentifier.js";

class DeviceInfo extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.DEVICE_INFO;

	// TODO: Convert mac address to the Mac class
	constructor(
		length: number,
		public knxMedium: number,
		public status: number,
		public individualAddress: IndividualAddress,
		public project: ProjectInstallationIdentifier,
		public serialNumber: string,
		public routingMulticastAddress: Ip,
		public macAddress: string,
		public name: string
	) {
		super(length, DeviceInfo.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [DeviceInfo, Buffer] {
		const structureLength = buffer.readUInt8(0);
		const knxMedium = buffer.readUInt8(2);
		const deviceStatus = buffer.readUInt8(3);
		const individualAddress = IndividualAddress.fromBuffer(buffer.subarray(4, 6));
		const project = ProjectInstallationIdentifier.fromBuffer(buffer.subarray(6, 8));
		const serialNumber = buffer.readUIntBE(8, 6).toString(16).padStart(12, "0");
		const multicast = Ip.fromBuffer(buffer.subarray(14, 18));

		const macBuffer = buffer.subarray(18, 24);
		const mac = Array.from(macBuffer)
			.map(byte => byte.toString(16).padStart(2, "0"))
			.join(":");

		const name = buffer.subarray(24, structureLength).toString("utf8");

		return [
			new DeviceInfo(
				structureLength,
				knxMedium,
				deviceStatus,
				individualAddress,
				project,
				serialNumber,
				multicast,
				mac,
				name
			),
			buffer.subarray(structureLength)
		];
	}
}

export default DeviceInfo;
