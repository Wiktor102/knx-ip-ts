import * as c from "../utilities/constants.js";

import DeviceInfo from "../structures/DescriptionInformationBlock/DeviceInfo.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import MapTupleToInstances from "../utilities/types/helpers.js";
import Response from "./Response.js";
import SupportedServiceFamilies from "../structures/DescriptionInformationBlock/SupportedServiceFamilies.js";

// class SearchResponse extends Response<typeof SearchResponse.chunkTypes> {
class SearchResponse extends Response {
	static serviceType = c.SEARCH_RESPONSE;
	static chunkTypes = [HostProtocolAddressInformation, DeviceInfo, SupportedServiceFamilies] as const;

	host: HostProtocolAddressInformation;
	info: DeviceInfo;
	services: SupportedServiceFamilies;

	constructor(chunks: MapTupleToInstances<typeof SearchResponse.chunkTypes>) {
		super(chunks);

		this.host = chunks[0];
		this.info = chunks[1];
		this.services = chunks[2];
	}
}

export default SearchResponse;
