import { Ip, KnxIpClient } from "knx-ip-ts";

// Setup the device (client)
const myDevice = new KnxIpClient({
	ip: new Ip(192, 168, 1, 66)
});

let myInterface;
const searchOptions = {};
const searchResults = myDevice.searchForServers(searchOptions, "224.0.23.12"); // KNX multicast address (you can also provide more broadcast addresses)

// Ust the new for await syntax to iterate over the search results (in real time)
for await (const device of searchResults) {
	if (device.name.includes("My Device Name")) {
		// eg. Filter by name
		myInterface = device;
		break; // Stop the search early (automatically stops after 10 seconds as per the spec)
	}
}

if (myInterface) {
	try {
		const connection = await myDevice.connectTo(myInterface); // Create a tunneling connection

		console.log("Connected to", myInterface.name, " at channel", connection.channelId);
		// Use the connection here - listen to telegrams, send telegrams, etc.

		// disconnect after 10 seconds
		setTimeout(() => {
			myDevice.disconnect();
		}, 10000);
	} catch (e) {
		console.error("Connection unsuccessful:" + e);
	}
}
