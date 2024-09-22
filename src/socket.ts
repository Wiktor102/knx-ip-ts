import udp from "dgram";
import { Response } from "./message.js";
import { HostProtocolAddressInformation } from "./host.js";
import Listenable from "./utilities/listenable.js";

interface IKnxSocketEvent {
	ready: [socket: udp.Socket];
	message: [message: Response];
	error: [error: Error];
}

class KnxSocket extends Listenable<IKnxSocketEvent> {
	public server: HostProtocolAddressInformation | null = null;
	private socket: udp.Socket;

	constructor(
		public client: HostProtocolAddressInformation,
		public knxPort: number
	) {
		super();
		this.socket = udp.createSocket("udp4");
		this.socket.bind(this.client.port);

		this.socket.on("listening", () => {
			this.socket.setBroadcast(true);
			this.dispatchEvent("ready", this.socket);
		});

		this.socket.on("message", msg => {
			const parsed = Response.parse(msg);
			this.dispatchEvent("message", parsed);
		});

		this.socket.on("error", error => {
			this.dispatchEvent("error", error);
		});
	}

	send(payload: Buffer, ip?: string) {
		if (!ip && !this.server) {
			throw new TypeError(
				"The destination IP address is required for send() as the server hasn't been discovered yet."
			);
		}

		this.socket.send(payload, this.knxPort, ip ?? this.server!.ip);
	}

	receive<T>(responseType: any, timeout?: number): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			if (timeout) {
				var errorTimeout = setTimeout(() => {
					reject(new Error("Timeout"));
				}, timeout);
			}

			this.addEventListener("message", (msg: Response) => {
				if (msg instanceof responseType) {
					clearTimeout(errorTimeout);
					resolve(msg as T);
				}
			});
		});
	}

	close() {
		this.socket.close();
		this.clearListeners();
	}
}

export default KnxSocket;
