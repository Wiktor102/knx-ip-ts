import { Request } from "../message.js";
import KnxSocket from "./KnxSocket.js";
import Ip from "../utilities/Ip.js";

class KnxControlSocket extends KnxSocket {
	override send(request: Request, ...ips: Ip[]) {
		if (ips.length === 0) {
			ips.push(new Ip(this.server.ip));
		}

		const payload = Buffer.concat(
			[
				Request.getHeader(request.serviceType, request.payload.length),
				// this.client.toBuffer(), // Cannot be added here, because for DisconnectRequest the order must be different
				request.payload
			].filter(b => b instanceof Buffer)
		);

		ips.forEach(ip => {
			this.socket.send(payload, this.server.port, ip.toString());
		});
	}
}

export default KnxControlSocket;
