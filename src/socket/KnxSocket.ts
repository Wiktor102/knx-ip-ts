import udp from "dgram";
import { Request } from "../message.js";
import Listenable from "../utilities/listenable.js";
import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import Response from "../messages/Response.js";
import ResponseParser from "../messages/ResponseParser.js";

interface IKnxSocketEvent {
	ready: [socket: udp.Socket];
	message: [message: Response];
	error: [error: Error];
}

interface IKnxSocketOptions {
	client: {
		ip: string;
		port: number;
	};
	server: {
		ip: string;
		port: number;
	};
}

class KnxSocket extends Listenable<IKnxSocketEvent> {
	protected server: HostProtocolAddressInformation;
	protected client: HostProtocolAddressInformation;
	protected socket: udp.Socket;

	constructor(options: IKnxSocketOptions) {
		super();
		this.client = new HostProtocolAddressInformation(options.client.ip, options.client.port);
		this.server = new HostProtocolAddressInformation(options.server.ip, options.server.port);

		this.socket = udp.createSocket("udp4");
		this.socket.bind(this.client.port);

		this.socket.on("listening", () => {
			this.socket.setBroadcast(true);
			this.dispatchEvent("ready", this.socket);
		});

		this.socket.on("message", msg => {
			const parsed = ResponseParser.parse(msg);
			this.dispatchEvent("message", parsed);
		});

		this.socket.on("error", error => {
			this.dispatchEvent("error", error);
		});
	}

	send(payload: Buffer | Request) {
		if (payload instanceof Request) payload = payload.payload;

		this.socket.send(payload, this.server.port, this.server.ip);
	}

	receive<T>(responseType: any, timeout?: number): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			if (timeout) {
				var errorTimeout = setTimeout(() => {
					reject(new Error("Timeout"));
				}, timeout);
			}

			const listenerId = this.addEventListener("message", (msg: Response) => {
				if (msg instanceof responseType) {
					clearTimeout(errorTimeout);
					this.removeEventListener("message", listenerId);
					resolve(msg as T);
				}
			});
		});
	}

	async *receiveAll<T>(responseType: any, timeout: number, callback?: () => void): AsyncGenerator<T> {
		let listening = true;

		setTimeout(() => {
			listening = false;
			callback && callback();
		}, timeout);

		while (listening) {
			const response = await this.receive<T>(responseType);
			yield response;
		}
	}

	close() {
		this.socket.close();
		this.clearListeners();
	}
}

export default KnxSocket;
