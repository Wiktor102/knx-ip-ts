import * as c from "../utilities/constants.js";

import { ConnectionRequest } from "../messages/requests/requests.js";
import ConnectionResponse from "../messages/ConnectionResponse.js";
import DisconnectRequest from "../messages/requests/DisconnectRequest.js";
import DisconnectResponse from "../messages/DisconnectResponse.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import IndividualAddress from "../utilities/knx/IndividualAddress.js";
import KnxControlSocket from "../socket/KnxControlSocket.js";
import KnxSocket from "../socket/KnxSocket.js";
import Listenable from "../utilities/listenable.js";
import TunnellingRequest from "../messages/requests/TunnellingRequest.js";
import cEmi from "../CommonExternalMessageInterface/CEmi.js";

export interface IConnectionOptions {
	ignoreIncorrectDisconnectRequests: boolean;
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
	telegram: [cEmi];
	disconnected: [];
}

class Connection extends Listenable<IConnectionEvents> {
	private options: IConnectionOptions;
	private controlHost?: HostProtocolAddressInformation;
	private dataHost?: HostProtocolAddressInformation;
	private controlSocket?: KnxControlSocket;
	private dataSocket?: KnxSocket;

	public connected = false;
	public channelId?: number;
	public type?: number;
	public individualAddress?: IndividualAddress;

	constructor(options: Partial<IConnectionOptions>) {
		super();

		this.options = {
			ignoreIncorrectDisconnectRequests: options.ignoreIncorrectDisconnectRequests ?? true,
			client: {
				ip: options.client!.ip,
				controlPort: options.client?.controlPort || 0, // will be randomly assigned by the OS
				dataPort: options.client?.dataPort || 3672
			},
			server: {
				ip: options.server!.ip,
				port: options.server?.port || 3671
			}
		};

		this.controlSocket = new KnxControlSocket({
			...this.options,
			client: { ip: this.options.client.ip, port: this.options.client.controlPort }
		});

		this.controlSocket.ready().then(socket => {
			this.options.client.controlPort ||= socket.address().port;
		});

		this.connect()
			.then(() => this.attachEvents())
			.catch(e => {
				this.controlSocket?.close();
				this.dispatchEvent("error", e);
			});
	}

	private async connect(): Promise<void> {
		if (!this.controlSocket) {
			throw new Error("Control socket is not initialized or was already closed!");
		}

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

	private async attachEvents() {
		if (!this.controlSocket || !this.dataSocket) {
			throw new Error("Sockets are not initialized or were already closed!");
		}

		await Promise.all([this.controlSocket.ready(), this.dataSocket.ready()]);

		this.dispatchEvent("connected");
		this.controlSocket.addEventListener("message", (response: Response) => {
			if (response instanceof DisconnectRequest) {
				this.handleDisconnectRequest(response);
				return;
			}
		});

		this.controlSocket.addEventListener("error", err => {
			console.error("Control socket error", err);
		});

		this.dataSocket!.addEventListener("message", msg => {
			if (msg instanceof TunnellingRequest) {
				this.dispatchEvent("telegram", msg.frame);
			}
		});
	}

	public async disconnect() {
		if (!this.connected) {
			throw new Error("Cannot disconnect because the connection is already closed or hasn't been established yet.");
		}

		if (!this.controlSocket) {
			throw new Error("Control socket is not initialized or was already closed!");
		}

		const disconnectRequest = new DisconnectRequest(this.controlHost!, this.channelId!);
		this.controlSocket.send(disconnectRequest);

		const response = await this.controlSocket.receive<DisconnectResponse>(DisconnectResponse);

		if (response.status !== 0x00) {
			throw new Error("Failed to disconnect. Code: " + response.status);
		}

		this.close();
	}

	private handleDisconnectRequest(request: DisconnectRequest) {
		if (
			this.options.ignoreIncorrectDisconnectRequests &&
			(request.clientControlEndpoint.ip !== this.options.client.ip ||
				request.clientControlEndpoint.port !== this.options.client.controlPort)
		) {
			console.warn(
				`Received a disconnect request meant for an unknown client (${request.clientControlEndpoint.ip}:${request.clientControlEndpoint.port}). Ignoring.`
			);
			return;
		}

		if (!this.controlSocket) {
			throw new Error("Control socket is not initialized or was already closed!");
		}

		const channelCorrect = request.channelId === this.channelId;
		const response = new DisconnectResponse(request.channelId, channelCorrect ? c.E_NO_ERROR : c.E_CONNECTION_ID); // Return the same (potentially incorrect) id as in the request (as per the spec)
		console.log("Disconnect response", response);
		// Pass a callback so the socket waits to close until sending is complete
		this.controlSocket.send(response, (err: Error) => {
			if (err) {
				console.error("Failed to send disconnect response", err);
			}
			if (channelCorrect) {
				this.close();
			}
		});
	}

	private close() {
		this.connected = false;
		this.dataSocket?.close();
		this.controlSocket?.close();

		this.dataSocket = undefined;
		this.controlSocket = undefined;
		this.channelId = undefined;
		this.type = undefined;
		this.individualAddress = undefined;
		this.dispatchEvent("disconnected");
		this.clearListeners();
	}
}

export default Connection;
