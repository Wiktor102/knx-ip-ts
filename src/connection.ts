import { HostProtocolAddressInformation } from "./host.js";
import Listenable from "./utilities/listenable.js";
import {
	ConnectionRequest,
	ConnectionResponse,
	DisconnectRequest,
	DiscoverRequest,
	DiscoverResponse,
	Response
} from "./message.js";
import KnxSocket from "./socket.js";

interface IConnectionOptions {
	client: {
		ip: string;
		controlPort: number;
		dataPort: number;
	};
	server: {
		ip?: string;
		port: number;
	};
	discovery?: {
		broadcastIp: string;
		timeout?: number;
	};
}

interface IConnectionInformation {
	chanel: number;
	status: number;
	server: HostProtocolAddressInformation;
	connectionType: number;
	individualAddress: number;
}

interface IConnectionEvents {
	connected: [];
	telegram: [Response];
}

class Connection extends Listenable<IConnectionEvents> {
	private controlSocket: KnxSocket;
	private dataSocket: KnxSocket;
	private connection: IConnectionInformation | null = null;

	constructor(private options: IConnectionOptions) {
		super();
		Connection.validateOptions(options);

		const clientControlHost = new HostProtocolAddressInformation(options.client.ip, options.client.controlPort);
		this.controlSocket = new KnxSocket(clientControlHost, options.server.port);

		const clientDataHost = new HostProtocolAddressInformation(options.client.ip, options.client.dataPort);
		this.dataSocket = new KnxSocket(clientDataHost, options.server.port);

		if (options.server.ip) {
			const serverHost = new HostProtocolAddressInformation(options.server.ip, options.server.port);
			this.controlSocket.server = serverHost;
			this.dataSocket.server = serverHost;
			this.connect();
		} else {
			this.startDiscovery(this.options.discovery!.timeout).then(serverHost => {
				this.controlSocket.server = serverHost;
				this.dataSocket.server = serverHost;
				this.connect();
			});
		}
	}

	private async startDiscovery(timeout: number = 10000): Promise<HostProtocolAddressInformation> {
		if (!this.options.discovery) {
			throw new Error("Discovery is not enabled for this Connection!");
		}

		const discoverMsg = new DiscoverRequest(this.controlSocket.client);
		this.controlSocket.send(discoverMsg.payload, this.options.discovery.broadcastIp);
		const response = await this.controlSocket.receive<DiscoverResponse>(DiscoverResponse, timeout);
		return response.serverHost;
	}

	private async connect() {
		const connectRequest = new ConnectionRequest(this.controlSocket.client, this.dataSocket.client);
		this.controlSocket.send(connectRequest.payload);

		const response = await this.controlSocket.receive<ConnectionResponse>(ConnectionResponse);

		switch (response.status) {
			case 0x00:
				break;
			case 0x21:
				throw new Error("Connection refused: Connection type not supported.");
			case 0x22:
				throw new Error("Connection refused: Connection options not supported.");
			case 0x23:
				throw new Error(
					"Connection refused: KNXnet/IP server cannot accept the new connection because the maximum number of connections is reached."
				);
			default:
				throw new Error("Unknown connection error.");
		}

		this.connection = { ...response };
		this.dispatchEvent("connected");

		this.dataSocket.addEventListener("message", msg => this.dispatchEvent("telegram", msg));
	}

	public async disconnect() {
		if (!this.connection) {
			throw new Error("Cannot disconnect because the connection is already closed or hasn't been established yet.");
		}

		const disconnectRequest = new DisconnectRequest(this.controlSocket.client, this.connection);
		this.controlSocket.send(disconnectRequest.payload);

		const response = await this.controlSocket.receive<ConnectionResponse>(ConnectionResponse);

		if (response.status !== 0x00) {
			throw new Error("Failed to disconnect. Code: " + response.status);
		}

		this.connection = null;
		this.dataSocket.close();
		this.controlSocket.close();
	}

	private static validateOptions(options: IConnectionOptions) {
		if (!options.discovery && !options.server.ip) {
			throw new Error("Server IP is required if automatic discovery is not enabled");
		}
	}
}

export { Connection, IConnectionOptions, IConnectionInformation };
export default Connection;
