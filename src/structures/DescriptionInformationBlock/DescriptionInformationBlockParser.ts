import DescriptionInformationBlock, { DescriptionInformationBlockTypes } from "./DescriptionInformationBlock.js";

import DeviceInfo from "./DeviceInfo.js";
import ExtendedDeviceInfo from "./ExtendedDeviceInfo.js";
import IpConfig from "./IpConfig.js";
import IpCurrentConfig from "./IpCurrentConfig.js";
import KnxAddresses from "./KnxAddresses.js";
import SecuredServiceFamilies from "./SecuredServiceFamilies.js";
import SupportedServiceFamilies from "./SupportedServiceFamilies.js";
import TunnelingInfo from "./TunnelingInfo.js";

abstract class DescriptionInformationBlockParser {
	static fromBuffer(buffer: Buffer): [DescriptionInformationBlock, Buffer] {
		const type: DescriptionInformationBlockTypes = buffer[1];

		switch (type) {
			case DescriptionInformationBlockTypes.DEVICE_INFO:
				return DeviceInfo.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.SUPPORTED_SERVICE_FAMILIES:
				return SupportedServiceFamilies.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.IP_CONFIG:
				return IpConfig.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.IP_CURRENT_CONFIG:
				return IpCurrentConfig.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.KNX_ADDRESSES:
				return KnxAddresses.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.SECURED_SERVICE_FAMILIES:
				return SecuredServiceFamilies.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.TUNNELING_INFO:
				return TunnelingInfo.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.EXTENDED_DEVICE_INFO:
				return ExtendedDeviceInfo.fromBuffer(buffer);
			case DescriptionInformationBlockTypes.MFR_DATA:
				throw new Error("MFR_DATA not implemented");
			default:
				throw new Error("Invalid description type");
		}
	}
}

export default DescriptionInformationBlockParser;
