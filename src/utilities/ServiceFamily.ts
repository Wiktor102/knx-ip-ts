class ServiceFamily {
	constructor(
		public familyId: number,
		public version: number
	) {}

	asServiceTypeId(): number {
		return (this.familyId << 8) | this.version;
	}

	static fromServiceTypeId(serviceTypeId: number): ServiceFamily {
		const familyId = (serviceTypeId & 0xff00) >> 8;
		const version = serviceTypeId & 0x00ff;
		return new ServiceFamily(familyId, version);
	}
}

export default ServiceFamily;
