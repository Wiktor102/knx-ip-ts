import Connection from "./connection.js";
import DescriptionInformationBlock from "./structures/DescriptionInformationBlock/DescriptionInformationBlock.js";
import DeviceInfo from "./structures/DescriptionInformationBlock/DeviceInfo.js";
import DiscoverResponse from "./messages/DiscoverResponse.js";
import HostProtocolAddressInformation from "./structures/HostProtocolAddressInformation.js";
import IndividualAddress from "./utilities/IndividualAddress.js";
import Ip from "./utilities/Ip.js";
import ProjectInstallationIdentifier from "./utilities/ProjectInstallationIdentifier.js";
import SearchResponseExtended from "./messages/SearchResponseExtended.js";
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

	connection?: Connection;

	constructor(
		hpai: HostProtocolAddressInformation,
		info: DeviceInfo,
		supported: SupportedServiceFamilies,
		public description?: DescriptionInformationBlock[]
	) {
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

	connect(controlPort: number, dataPort: number): Promise<Connection> {
		return new Promise((resolve, reject) => {
			this.connection = new Connection({
				client: { ip: "192.168.1.66", controlPort, dataPort },
				server: { ip: this.ip, port: 3671 }
			});

			this.connection!.addEventListener("error", e => {
				this.connection = undefined;
				reject(e);
			});

			this.connection!.addEventListener("connected", () => {
				resolve(this.connection!);
			});
		});
	}

	disconnect(): void {
		if (this.connection) {
			this.connection.disconnect();
		}

		this.connection = undefined;
	}

	static fromSearchResponse(resp: DiscoverResponse | SearchResponseExtended): KnxDevice {
		return new KnxDevice(
			resp.host,
			resp.info,
			resp.services,
			"extendedDescription" in resp ? resp.extendedDescription : undefined
		);
	}
}

export default KnxDevice;
