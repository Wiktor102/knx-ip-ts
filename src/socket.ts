import udp from "dgram";
import { Message } from "./message.js";
import { HostProtocolAddressInformation } from "./host.js";

interface KnxSocketEvent {
	ready: ((socket: udp.Socket) => void)[];
	message: ((message: Message) => void)[];
	error: ((error: Error) => void)[];
}

class KnxSocket {
	public server: HostProtocolAddressInformation | null = null;

	private socket: udp.Socket;
	private events: KnxSocketEvent = {
		ready: [],
		message: [],
		error: []
	};

	constructor(
		public client: HostProtocolAddressInformation,
		public knxPort: number
	) {
		this.socket = udp.createSocket("udp4");
		this.socket.bind(this.client.port);

		this.socket.on("listening", () => {
			this.socket.setBroadcast(true);
			this.events.ready.forEach(v => v(this.socket));
		});

		this.socket.on("message", msg => {
			const parsed = Message.parse(msg);
			this.events.message.forEach(v => v(parsed));
		});

		this.socket.on("error", error => {
			this.events.error.forEach(v => v(error));
		});
	}

	send(payload: Buffer, ip: string | undefined) {
		if (!ip && !this.server) {
			throw new TypeError(
				"The destination IP address is required for send() as the server hasn't been discovered yet."
			);
		}

		this.socket.send(payload, this.knxPort, ip ?? this.server!.ip);
	}

	close() {
		this.socket.close();
	}

	on(event: "ready", callback: (socket: udp.Socket) => void): void;
	on(event: "message", callback: (message: Message) => void): void;
	on(event: "error", callback: (error: Error) => void): void;
	on(event: "ready" | "message" | "error", callback: (arg: any) => void) {
		this.events[event].push(callback);
	}
}

export default KnxSocket;
