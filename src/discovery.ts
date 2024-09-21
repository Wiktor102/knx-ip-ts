import { HostProtocolAddressInformation } from "./host.js";
import { DiscoverRequest, DiscoverResponse } from "./message.js";
import KnxSocket from "./socket.js";

class Discovery {
	constructor(
		private socket: KnxSocket,
		public broadcastIp: string
	) {}

	start(timeout: number = 10000): Promise<HostProtocolAddressInformation> {
		return new Promise((resolve, reject) => {
			const discoverMsg = new DiscoverRequest(this.socket.client);
			this.socket.send(discoverMsg.payload, this.broadcastIp);

			let errorTimeout = setTimeout(() => {
				reject(new Error("Discovery timeout"));
			}, timeout);

			this.socket.on("message", msg => {
				if (msg instanceof DiscoverResponse) {
					this.socket.server = msg.serverHost;
					clearTimeout(errorTimeout);
					resolve(msg.serverHost);
				}
			});
		});
	}
}

export default Discovery;
