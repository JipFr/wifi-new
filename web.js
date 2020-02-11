const express = require("express");
const app = express();
const fs = require("fs");

app.get("/data/", async (req, res) => {
	// let data = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf-8"));
	
	let collection = db.collection("device_times");

	let entries = await collection.find({}).toArray();
	let data = {}
	for(let entry of entries) {
		data[entry.name] = entry.times;
	}

	res.json(data);
});

app.use(express.static("public"));
module.exports = app;