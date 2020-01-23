
require("dotenv").config();
require("colors");
const fs = require("fs");

const getConnected = require("./getConnected");
if(!fs.existsSync("data.json")) fs.writeFileSync("data.json", "{}");
const data = require("./data.json");
const minute = 60e3;

if(!data["device_times"]) data["device_times"] = {};

const main = async () => {
	let connected = await getConnected();
	connected.forEach(device => {
		let name = get_device_name(device);

		if(!data.device_times[name]) {
			data.device_times[name] = [];
		}
		data.device_times[name].push(Date.now());

	});

	fs.writeFileSync("data.json", JSON.stringify(data));
	console.log("Saved at", new Date().toLocaleString("it-IT").bold.green);

}

main();
setInterval(main, 1 * minute);


function get_device_name(device) {
	if(device.HostName) return device.HostName;
	if(device.IPAddress) return device.IPAddress;
	return device.MACAdress;
}

const app = require("./web");
app.listen(80, () => console.log("Web server is online".bold.blue));