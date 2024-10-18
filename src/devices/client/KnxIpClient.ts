import * as c from "../../utilities/constants.js";

import { SearchRequest, SearchRequestExtended } from "../../requests.js";

import Connection from "../../connections/connection.js";
import DiscoverResponse from "../../messages/DiscoverResponse.js";
import HostProtocolAddressInformation from "../../structures/HostProtocolAddressInformation.js";
import Ip from "../../utilities/network/Ip.js";
import KnxControlSocket from "../../socket/KnxControlSocket.js";
import KnxIpServerDescription from "../server/KnxIpServerDescription.js";
import { RequiredOptionalProps } from "../../utilities/types/helpers.js";
import SearchRequestParameter from "../../structures/SearchRequestParameter/SearchRequestParameter.js";
import SearchResponseExtended from "../../messages/SearchResponseExtended.js";

interface IKnxClientOptions {
	/** The IP address of the client. This is sent with all control requests (inside hpai)  */
	ip: Ip;
}

interface ISearchOptions {
	searchEndpointPort?: number;
	extendedSearchParameter?: SearchRequestParameter;
}

class KnxIpClient {
	static #defaultOptions: RequiredOptionalProps<IKnxClientOptions> = {} as const;
	readonly #options: IKnxClientOptions;

	public connection?: Connection;

	constructor(options: IKnxClientOptions) {
		this.#options = { ...KnxIpClient.#defaultOptions, ...options };
	}

	get ip(): Ip {
		return this.#options.ip;
	}

	async *searchForServers(
		options: ISearchOptions,
		...broadcastIps: (Ip | string)[]
	): AsyncGenerator<KnxIpServerDescription, void, void> {
		const allBroadcastIps: Ip[] = broadcastIps.map(ip => (ip instanceof Ip ? ip : new Ip(ip)));

		// TODO: Rethink the options parameter of KnxSocket / KnxControlSocket
		const socket = new KnxControlSocket({
			client: { ip: this.ip.toString(), port: 0 }, // Let the OS choose a port (on our side)
			server: { ip: broadcastIps[0].toString(), port: options.searchEndpointPort ?? 3671 } // This ip isn't actually being used, because we provide addresses in the send method
		});

		await socket.ready();
		const hapi = new HostProtocolAddressInformation(this.ip.toString(), socket.port);
		const request = options.extendedSearchParameter
			? new SearchRequestExtended(hapi, options.extendedSearchParameter)
			: new SearchRequest(hapi);
		socket.send(request, ...allBroadcastIps);

		let receiver: AsyncGenerator<[DiscoverResponse | SearchResponseExtended, () => void], void, void>;
		if (options.extendedSearchParameter) {
			receiver = socket.receiveAll<SearchResponseExtended>(SearchResponseExtended, c.SEARCH_TIMEOUT);
		} else {
			receiver = socket.receiveAll<DiscoverResponse>(DiscoverResponse, c.SEARCH_TIMEOUT);
		}

		try {
			for await (var [response, cancel] of receiver) {
				yield KnxIpServerDescription.fromSearchResponse(response);
			}
		} finally {
			typeof cancel! === "function" && cancel();
			socket.close();
		}
	}

	connectTo(server: KnxIpServerDescription): Promise<Connection> {
		const serverHapi = server.hostProtocolAddressInformation;

		return new Promise((resolve, reject) => {
			this.connection = new Connection({
				client: { ip: this.ip.toString(), controlPort: 0, dataPort: 0 }, // Let the OS choose a port (on our side)
				server: { ip: serverHapi.ip, port: serverHapi.port }
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
}

export default KnxIpClient;
