import IndividualAddress from "./IndividualAddress.js";

class TunnelingSlot {
	constructor(
		public individualAddress: IndividualAddress,
		public usable: boolean,
		public authorized: boolean,
		public free: boolean
	) {}

	static fromBuffer(buffer: Buffer): TunnelingSlot {
		if (buffer.length != 4) throw new Error("Expected 4 bytes, but got " + buffer.length);

		const address = IndividualAddress.fromBuffer(buffer.subarray(0, 2));
		const usable = (buffer[3] & 0b100) != 0;
		const authorized = (buffer[3] & 0b10) != 0;
		const free = (buffer[3] & 0b1) != 0;

		return new TunnelingSlot(address, usable, authorized, free);
	}
}

export default TunnelingSlot;
