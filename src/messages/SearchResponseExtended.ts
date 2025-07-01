import * as c from "../utilities/constants.js";

import DescriptionInformationBlock from "../structures/DescriptionInformationBlock/DescriptionInformationBlock.js";
import DescriptionInformationBlockParser from "../structures/DescriptionInformationBlock/DescriptionInformationBlockParser.js";
import DeviceInfo from "../structures/DescriptionInformationBlock/DeviceInfo.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import MapTupleToInstances from "../utilities/types/helpers.js";
import SearchResponse from "./SearchResponse.js";
import SupportedServiceFamilies from "../structures/DescriptionInformationBlock/SupportedServiceFamilies.js";

class SearchResponseExtended extends SearchResponse {
	static readonly serviceType = c.SEARCH_RESPONSE_EXT;
	static chunkTypes = [HostProtocolAddressInformation, DeviceInfo, SupportedServiceFamilies] as const;

	extendedDescription: DescriptionInformationBlock[];

	constructor(chunks: MapTupleToInstances<typeof SearchResponseExtended.chunkTypes>, rest?: Buffer | null) {
		super(chunks);

		this.extendedDescription =
			rest?.reduce<[DescriptionInformationBlock[], Buffer]>(
				([acc, buffer]) => {
					if (buffer.length === 0) return [acc, buffer];
					const [nezDescriptionBlock, rest] = DescriptionInformationBlockParser.fromBuffer(buffer);
					return [[...acc, nezDescriptionBlock], rest];
				},
				[[], rest]
			)[0] ?? [];
	}
}

export default SearchResponseExtended;
