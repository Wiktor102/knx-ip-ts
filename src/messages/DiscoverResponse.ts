import Response from "./Response.js";
import DeviceInfo from "../structures/DescriptionInformationBlock/DeviceInfo.js";
import SupportedServiceFamilies from "../structures/DescriptionInformationBlock/SupportedServiceFamilies.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import * as c from "../utilities/constants.js";
import MapTupleToInstances from "../utilities/types/helpers.js";

// class DiscoverResponse extends Response<typeof DiscoverResponse.chunkTypes> {
class DiscoverResponse extends Response {
	static readonly serviceType = c.SEARCH_RESPONSE;
	static chunkTypes = [HostProtocolAddressInformation, DeviceInfo, SupportedServiceFamilies] as const;

	host: HostProtocolAddressInformation;
	info: DeviceInfo;
	services: SupportedServiceFamilies;

	constructor(chunks: MapTupleToInstances<typeof DiscoverResponse.chunkTypes>) {
		super(chunks);

		this.host = chunks[0];
		this.info = chunks[1];
		this.services = chunks[2];
	}
}

export default DiscoverResponse;
