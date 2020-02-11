require("dotenv").config();
require("colors");
const fs = require("fs");

const { MongoClient } = require("mongodb");
const dbUrl = process.env.db || null;
const dbName = process.env.dbName;
if(!dbUrl) throw new Error("Insert a DB url");
const data = require("./data");
const getConnected = require("./getConnected");
const minute = 60e3;

MongoClient.connect(dbUrl, (err, client) => {

	console.log("Connected to DB");

	db = client.db(dbName);

	main();
});

async function main() {
	let collection = db.collection("device_times");
	let t = data.device_times;
	for(let device of Object.keys(t)) {
		
		console.log(device);
		await collection.updateOne({ name: device }, {
			$set: {
				name: device,
				times: t[device]
			}
		}, {
			upsert: 1
		});
		console.log("DONE " + device);
	
	}
}