import { ConnectionRequest, DisconnectRequest } from "../messages/requests/requests.js";

import ConnectionResponse from "../messages/ConnectionResponse.js";
import DisconnectResponse from "../messages/DisconnectResponse.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import IndividualAddress from "../utilities/knx/IndividualAddress.js";
import KnxControlSocket from "../socket/KnxControlSocket.js";
import KnxSocket from "../socket/KnxSocket.js";
import Listenable from "../utilities/listenable.js";

interface IConnectionOptions {
	client: {
		ip: string;
		controlPort: number;
		dataPort: number;
	};
	server: {
		ip: string;
		port: number;
	};
}

interface IConnectionEvents {
	connected: [];
	error: [Error];
	telegram: [Response];
}

class Connection extends Listenable<IConnectionEvents> {
	private controlHost?: HostProtocolAddressInformation;
	private dataHost?: HostProtocolAddressInformation;
	private controlSocket: KnxControlSocket;
	private dataSocket?: KnxSocket;

	public connected = false;
	public channelId?: number;
	public type?: number;
	public individualAddress?: IndividualAddress;

	constructor(private options: IConnectionOptions) {
		super();
		this.options.client.dataPort ||= 3672;

		this.controlSocket = new KnxControlSocket({
			...options,
			client: { ip: options.client.ip, port: options.client.controlPort }
		});

		this.controlSocket.ready().then(() => {});

		this.connect()
			.then(() => {
				this.dispatchEvent("connected");
				this.dataSocket!.addEventListener("message", msg => this.dispatchEvent("telegram", msg));
			})
			.catch(e => {
				this.controlSocket.close();
				this.dispatchEvent("error", e);
			});
	}

	private async connect(): Promise<void> {
		await this.controlSocket.ready();
		this.controlHost = new HostProtocolAddressInformation(this.options.client.ip, this.controlSocket.port);
		this.dataHost = new HostProtocolAddressInformation(this.options.client.ip, this.options.client.dataPort);

		const connectRequest = new ConnectionRequest(this.controlHost, this.dataHost);

		this.controlSocket.send(connectRequest);
		const response = await this.controlSocket.receive<ConnectionResponse>(ConnectionResponse);

		// TODO: Store error codes together with all constants (constants.ts)
		switch (response.status) {
			case 0x00:
				break;
			case 0x22:
				throw new Error("Connection refused: Connection type not supported.");
			case 0x23:
				throw new Error("Connection refused: Maximum number of connections is reached.");
			case 0x25:
				throw new Error("Connection refused: No more unique connections.");
			case 0x29:
				throw new Error("Connection refused: Tunneling layer not supported.");
			default:
				throw new Error("Unknown connection error.");
		}

		this.dataSocket = new KnxSocket({
			server: {
				ip: response.server!.ip,
				port: response.server!.port
			},
			client: { ip: this.options.client.ip, port: this.options.client.dataPort }
		});

		this.channelId = response.chanelId;
		this.type = response.connectionType;
		this.individualAddress = response.individualAddress;

		this.connected = true;
	}

	public async disconnect() {
		if (!this.connected) {
			throw new Error("Cannot disconnect because the connection is already closed or hasn't been established yet.");
		}

		const disconnectRequest = new DisconnectRequest(this.controlHost!, this.channelId!);
		this.controlSocket.send(disconnectRequest);

		const response = await this.controlSocket.receive<DisconnectResponse>(DisconnectResponse);

		if (response.status !== 0x00) {
			throw new Error("Failed to disconnect. Code: " + response.status);
		}

		this.connected = false;
		this.dataSocket?.close();
		this.controlSocket.close();

		this.dataSocket = undefined;
		this.channelId = undefined;
		this.type = undefined;
		this.individualAddress = undefined;
	}
}

export default Connection;
