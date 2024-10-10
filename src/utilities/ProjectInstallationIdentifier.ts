class ProjectInstallationIdentifier {
	constructor(
		public project: number,
		public installation: number
	) {
		if (project < 0 || project > 4095) {
			throw new Error("Project must be between 0 and 4095");
		}

		if (installation < 0 || installation > 15) {
			throw new Error("Installation must be between 0 and 15");
		}
	}

	toBuffer(): Buffer {
		const buffer = Buffer.alloc(2);
		buffer.writeUInt16BE((this.project << 4) | this.installation, 0);

		return buffer;
	}

	static fromBuffer(buffer: Buffer): ProjectInstallationIdentifier {
		const project = buffer.readUInt16BE(0) >> 4;
		const installation = buffer.readUInt16BE(0) & 0x0f;

		return new ProjectInstallationIdentifier(project, installation);
	}
}

export default ProjectInstallationIdentifier;
