import DescriptionInformationBlock from "../../structures/DescriptionInformationBlock/DescriptionInformationBlock.js";
import DeviceInfo from "../../structures/DescriptionInformationBlock/DeviceInfo.js";
import DiscoverResponse from "../../messages/DiscoverResponse.js";
import HostProtocolAddressInformation from "../../structures/HostProtocolAddressInformation.js";
import IndividualAddress from "../../utilities/knx/IndividualAddress.js";
import Ip from "../../utilities/network/Ip.js";
import Mac from "../../utilities/network/Mac.js";
import ProjectInstallationIdentifier from "../../utilities/knx/ProjectInstallationIdentifier.js";
import SearchResponseExtended from "../../messages/SearchResponseExtended.js";
import ServiceFamily from "../../utilities/knx/ServiceFamily.js";
import SupportedServiceFamilies from "../../structures/DescriptionInformationBlock/SupportedServiceFamilies.js";

/** This class is used as a server representation on the client-side.
 * It's returned by the search methods and can be used to connect to the server.
 */
class KnxIpServerDescription {
	readonly #hostProtocolAddressInformation: HostProtocolAddressInformation;
	readonly #deviceInfo: DeviceInfo;
	readonly #supportedServices: ServiceFamily[];
	#description: DescriptionInformationBlock[];

	constructor(
		hostProtocolAddressInformation: HostProtocolAddressInformation,
		deviceInfo: DeviceInfo,
		supportedServices: SupportedServiceFamilies,
		description: DescriptionInformationBlock[]
	) {
		this.#hostProtocolAddressInformation = hostProtocolAddressInformation;
		this.#deviceInfo = deviceInfo;
		this.#supportedServices = supportedServices.supportedServiceFamilies;
		this.#description = description;
	}

	public get hostProtocolAddressInformation(): HostProtocolAddressInformation {
		return this.#hostProtocolAddressInformation;
	}

	public get knxMedium(): number {
		return this.#deviceInfo.knxMedium;
	}

	public get status(): number {
		return this.#deviceInfo.status;
	}

	public get individualAddress(): IndividualAddress {
		return this.#deviceInfo.individualAddress;
	}

	public get project(): ProjectInstallationIdentifier {
		return this.#deviceInfo.project;
	}

	public get serialNumber(): string {
		return this.#deviceInfo.serialNumber;
	}

	public get routingMulticastAddress(): Ip {
		return this.#deviceInfo.routingMulticastAddress;
	}

	public get macAddress(): Mac {
		return new Mac(this.#deviceInfo.macAddress);
	}

	public get name(): string {
		return this.#deviceInfo.name;
	}

	public get supportedServices(): ServiceFamily[] {
		return [...this.#supportedServices];
	}

	public getDescription<T extends DescriptionInformationBlock>(type: new (...args: any[]) => T): T | undefined {
		return this.#description.find(description => description instanceof type) as T | undefined;
	}

	static fromSearchResponse(response: DiscoverResponse | SearchResponseExtended): KnxIpServerDescription {
		let description: DescriptionInformationBlock[] = [];
		if ("extendedDescription" in response) description = response.extendedDescription;
		return new KnxIpServerDescription(response.host, response.info, response.services, description);
	}
}

export default KnxIpServerDescription;
