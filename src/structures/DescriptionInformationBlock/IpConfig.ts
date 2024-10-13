import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import Ip from "../../utilities/Ip.js";

class IpConfig extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.IP_CONFIG;

	constructor(
		length: number,
		public ipAddress: Ip,
		public subnetMask: Ip,
		public defaultGateway: Ip,
		public capabilities: number,
		public assignment: number
	) {
		super(length, IpConfig.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [IpConfig, Buffer] {
		const length = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);

		if (type != IpConfig.descriptionType) throw new Error("Invalid description type");
		if (length < 16) throw new Error("Expected at least 16 bytes, but got " + length);

		const ip = Ip.fromBuffer(buffer.subarray(2, 6));
		const subnet = Ip.fromBuffer(buffer.subarray(6, 10));
		const gateway = Ip.fromBuffer(buffer.subarray(10, 14));

		// TODO: Implement capabilities and assignment as classes
		const capabilities = buffer.readUInt8(14);
		const assignment = buffer.readUInt8(15);

		return [new IpConfig(length, ip, subnet, gateway, capabilities, assignment), buffer.subarray(length)];
	}
}

export default IpConfig;
