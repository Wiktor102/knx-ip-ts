import DeviceInfo from "./structures/DescriptionInformationBlock/DeviceInfo.js";
import DiscoverResponse from "./messages/DiscoverResponse.js";
import HostProtocolAddressInformation from "./structures/HostProtocolAddressInformation.js";
import IndividualAddress from "./utilities/IndividualAddress.js";
import Ip from "./utilities/Ip.js";
import ProjectInstallationIdentifier from "./utilities/ProjectInstallationIdentifier.js";
import ServiceFamily from "./utilities/ServiceFamily.js";
import SupportedServiceFamilies from "./structures/DescriptionInformationBlock/SupportedServiceFamilies.js";

class KnxDevice {
	ip: string;
	port: number;
	knxMedium: number;
	status: number;
	individualAddress: IndividualAddress;
	project: ProjectInstallationIdentifier;
	serialNumber: string;
	routingMulticastAddress: Ip;
	macAddress: string;
	name: string;
	supportedServices: ServiceFamily[];

	constructor(hpai: HostProtocolAddressInformation, info: DeviceInfo, supported: SupportedServiceFamilies) {
		this.ip = hpai.ip;
		this.port = hpai.port;
		this.knxMedium = info.knxMedium;
		this.status = info.status;
		this.individualAddress = info.individualAddress;
		this.project = info.project;
		this.serialNumber = info.serialNumber;
		this.routingMulticastAddress = info.routingMulticastAddress;
		this.macAddress = info.macAddress;
		this.name = info.name;
		this.supportedServices = supported.supportedServiceFamilies;
	}

	static fromDiscoverResponse(resp: DiscoverResponse): KnxDevice {
		return new KnxDevice(resp.host, resp.info, resp.services);
	}
}

export default KnxDevice;
