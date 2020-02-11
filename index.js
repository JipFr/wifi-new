
require("dotenv").config();
require("colors");

const { MongoClient } = require("mongodb");
const dbUrl = process.env.db || null;
const dbName = process.env.dbName;
if(!dbUrl) throw new Error("Insert a DB url")

const getConnected = require("./getConnected");
const minute = 60e3;

MongoClient.connect(dbUrl, (err, client) => {

	console.log("Connected to DB");

	db = client.db(dbName);

	main();
	setInterval(main, 1 * minute);

});

const main = async () => {
	console.log("Running `main` at " + new Date().toLocaleString("it-IT").bold.green)
	let connected = await getConnected();

	let collection = db.collection("device_times");

	let promises = connected.map(async device => {
		let name = get_device_name(device);

		let existing = await collection.findOne({ name });
		if(!existing) {
			await collection.updateOne({ name }, {
				$set: {
					name,
					times: []
				}
			}, {
				upsert: 1
			});
		}

		await collection.updateOne({ name }, {
			$push: {
				times: Date.now()
			}
		});

		console.log("Added time to", name);

		return 1;

	});
	let x = await Promise.all(promises);

	console.log("Saved at", new Date().toLocaleString("it-IT").bold.green);

}


function get_device_name(device) {
	if(device.HostName) return device.HostName;
	if(device.IPAddress) return device.IPAddress;
	return device.MACAdress;
}

const app = require("./web");
app.listen(8080, () => console.log("Web server is online".bold.blue));
