import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import Ip from "../../utilities/network/Ip.js";

class IpCurrentConfig extends DescriptionInformationBlock {
	static descriptionType = DescriptionInformationBlockTypes.IP_CURRENT_CONFIG;

	constructor(
		length: number,
		public ipAddress: Ip,
		public subnetMask: Ip,
		public defaultGateway: Ip,
		public dhcpServer: Ip,
		public assignment: number
	) {
		super(length, IpCurrentConfig.descriptionType);
	}

	static fromBuffer(buffer: Buffer): [IpCurrentConfig, Buffer] {
		const length = buffer.readUInt8(0);
		const type = buffer.readUInt8(1);

		if (type != IpCurrentConfig.descriptionType) throw new Error("Invalid description type");
		if (length < 19) throw new Error("Expected at least 20 bytes, but got " + length);

		const ip = Ip.fromBuffer(buffer.subarray(2, 6));
		const subnet = Ip.fromBuffer(buffer.subarray(6, 10));
		const gateway = Ip.fromBuffer(buffer.subarray(10, 14));
		const dhcp = Ip.fromBuffer(buffer.subarray(14, 18));

		// TODO: Implement assignment as a class
		const assignment = buffer.readUInt8(18);

		return [new IpCurrentConfig(length, ip, subnet, gateway, dhcp, assignment), buffer.subarray(length)];
	}
}

export default IpCurrentConfig;
