class ApplicationLayerService {
	constructor(public name: string, public id: number, public length: number) {}
}

type ApplicationLayerServiceName = keyof typeof ApplicationLayerServices;
const ApplicationLayerServices = Object.freeze({
	GroupValueRead: new ApplicationLayerService("GroupValueRead", 0b00_0000_0000, 10),
	GroupValueResponse: new ApplicationLayerService("GroupValueResponse", 0b00_01, 4),
	GroupValueWrite: new ApplicationLayerService("GroupValueWrite", 0b00_10, 4),
	IndividualAddressWrite: new ApplicationLayerService("IndividualAddressWrite", 0b00_1100_0000, 10),
	IndividualAddressRead: new ApplicationLayerService("IndividualAddressRead", 0b01_0000_0000, 10),
	IndividualAddressResponse: new ApplicationLayerService("IndividualAddressResponse", 0b01_0100_0000, 10),

	fromUint16BE(serviceNumber: number): ApplicationLayerService {
		for (const key in this) {
			const value = this[key as ApplicationLayerServiceName];
			if (!(value instanceof ApplicationLayerService)) continue; // Skip any methods
			if (value.length === 4 && serviceNumber >> 6 === value.id) return value;
			if (value.id === serviceNumber) return value;
		}

		throw new Error(`No matching ApplicationLayerService found for value: ${serviceNumber}`);
	}
});

export type ApplicationLayerServiceInstance = InstanceType<typeof ApplicationLayerService>;
export default ApplicationLayerServices;
