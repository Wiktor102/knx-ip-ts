import HostProtocolAddressInformation from "../structures/HostProtocolAddressInformation.js";
import Listenable from "../utilities/listenable.js";
import { Request } from "../requests.js";
import Response from "../messages/Response.js";
import ResponseParser from "../messages/ResponseParser.js";
import udp from "dgram";

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
	#socketReady: boolean = false;

	constructor(options: IKnxSocketOptions) {
		super();
		this.client = new HostProtocolAddressInformation(options.client.ip, options.client.port);
		this.server = new HostProtocolAddressInformation(options.server.ip, options.server.port);

		this.socket = udp.createSocket("udp4");
		this.socket.bind(this.client.port);

		this.socket.once("listening", () => {
			this.socket.setBroadcast(true);
			this.dispatchEvent("ready", this.socket);
			this.#socketReady = true;
		});

		this.socket.on("message", msg => {
			const parsed = ResponseParser.parse(msg);
			this.dispatchEvent("message", parsed);
		});

		this.socket.on("error", error => {
			this.dispatchEvent("error", error);
		});
	}

	get socketReady(): boolean {
		return this.#socketReady;
	}

	get port(): number {
		if (!this.#socketReady) throw new Error("Cannot access port before the socket is ready");
		return this.socket.address().port;
	}

	ready(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.#socketReady) {
				resolve();
				return;
			}

			this.addEventListener("ready", () => {
				resolve();
			});
		});
	}

	send(payload: Buffer | Request) {
		if (payload instanceof Request) payload = payload.payload;

		this.socket.send(payload, this.server.port, this.server.ip);
	}

	receive<T>(responseType: new (...args: any[]) => T, timeout?: number | Promise<void>): Promise<T> {
		const { promise, resolve, reject } = Promise.withResolvers<T>();
		let settled = false;

		if (timeout && typeof timeout === "number") {
			var errorTimeout = setTimeout(() => {
				if (settled) return;

				reject(new Error("Timeout"));
				settled = true;
			}, timeout * 1000);
		}

		if (timeout instanceof Promise) {
			timeout.then(() => {
				if (settled) return;
				this.removeEventListener("message", listenerId);

				reject(new Error("Timeout"));
				settled = true;
			});
		}

		const listenerId = this.addEventListener("message", (msg: Response) => {
			if (msg instanceof responseType) {
				errorTimeout && clearTimeout(errorTimeout);
				this.removeEventListener("message", listenerId);

				resolve(msg as T);
				settled = true;
			}
		});

		return promise;
	}

	/**
	 * @param timeout In seconds
	 * @return [response, cancel]
	 */
	async *receiveAll<T>(
		responseType: new (...args: any[]) => T,
		timeout: number,
		callback?: () => void
	): AsyncGenerator<[T, () => void]> {
		let listening = true;
		let { promise: cancelReceive, resolve: cancel } = Promise.withResolvers<void>();

		function cleanUp() {
			listening = false;
			cancel();
			callback && callback();
		}

		const cleanUpTimeout = setTimeout(cleanUp, timeout * 1000);

		try {
			while (listening) {
				const response = await this.receive<T>(responseType, cancelReceive);
				if (listening) yield [response, cancel];
			}
		} catch (e) {
			// We ignore all promise rejections
		} finally {
			clearTimeout(cleanUpTimeout);
			cleanUp();
		}
	}

	close() {
		this.#socketReady = false;
		this.socket.close();
		this.clearListeners();
	}
}

export default KnxSocket;
