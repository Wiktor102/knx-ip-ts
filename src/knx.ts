import * as c from "./utilities/constants.js";

import { SearchRequest, SearchRequestExtended } from "./requests.js";

import DiscoverResponse from "./messages/DiscoverResponse.js";
import HostProtocolAddressInformation from "./structures/HostProtocolAddressInformation.js";
import Ip from "./utilities/Ip.js";
import KnxControlSocket from "./socket/KnxControlSocket.js";
import KnxDevice from "./KnxDevice.js";
import SearchRequestParameter from "./structures/SearchRequestParameter/SearchRequestParameter.js";
import SearchResponseExtended from "./messages/SearchResponseExtended.js";

interface IKnxOptions {
	client: {
		ip: string;
		searchPort?: number;
		controlPort: number;
		dataPort: number;
	};
	server: {
		ip?: string;
		port: number;
	};
}

class Knx {
	options: IKnxOptions;

	constructor(options: IKnxOptions) {
		if (!options.client.searchPort) options.client.searchPort = options.client.controlPort;

		this.options = options;
	}

	// TODO: Combine all search and searchExtended into 1 method

	search(broadcastIp: Ip | string): AsyncGenerator<KnxDevice>;
	search(...broadcastIps: (Ip | string)[]): AsyncGenerator<KnxDevice>;
	async *search(...settings: any[]): AsyncGenerator<KnxDevice> {
		const broadcastIps: Ip[] = [];

		if (settings.length === 0) {
			throw new Error("At least one broadcast IP must be specified when using knx.search()!");
		} else if (settings.length === 1) {
			settings[0] instanceof Ip ? broadcastIps.push(settings[0]) : broadcastIps.push(new Ip(settings[0]));
		} else {
			settings.forEach(setting => {
				setting instanceof Ip ? broadcastIps.push(setting) : broadcastIps.push(new Ip(setting));
			});
		}

		if (!this.options.client.searchPort) {
			throw new Error("options.client.searchPort must be specified when using knx.search()!");
		}

		const socket = new KnxControlSocket({
			client: { ip: this.options.client.ip, port: this.options.client.searchPort },
			server: { ip: broadcastIps[0].toString(), port: this.options.server.port }
		});

		const hapi = new HostProtocolAddressInformation(this.options.client.ip, this.options.client.searchPort);
		socket.send(new SearchRequest(hapi), ...broadcastIps);

		const receiver = socket.receiveAll<DiscoverResponse>(DiscoverResponse, c.SEARCH_TIMEOUT);

		for await (const response of receiver) {
			yield KnxDevice.fromSearchResponse(response);
		}

		socket.close();
	}

	async *searchExtended(
		param: SearchRequestParameter,
		broadcastIp: Ip | string,
		...broadcastIps: (Ip | string)[]
	): AsyncGenerator<KnxDevice> {
		const allBroadcastIps: Ip[] = [broadcastIp, ...broadcastIps].map(ip => (ip instanceof Ip ? ip : new Ip(ip)));

		if (!this.options.client.searchPort) {
			throw new Error("options.client.searchPort must be specified when using knx.search()!");
		}

		const socket = new KnxControlSocket({
			client: { ip: this.options.client.ip, port: this.options.client.searchPort },
			server: { ip: broadcastIps[0].toString(), port: this.options.server.port }
		});

		const hapi = new HostProtocolAddressInformation(this.options.client.ip, this.options.client.searchPort);
		socket.send(new SearchRequestExtended(hapi, param), ...allBroadcastIps);

		const receiver = socket.receiveAll<SearchResponseExtended>(SearchResponseExtended, c.SEARCH_TIMEOUT);

		for await (const response of receiver) {
			yield KnxDevice.fromSearchResponse(response);
		}

		socket.close();
	}
}

export default Knx;
