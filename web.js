const express = require("express");
const app = express();
const fs = require("fs");

app.get("/data/", (req, res) => {
	let data = JSON.parse(fs.readFileSync(__dirname + "/data.json", "utf-8"));
	res.json(data.device_times);
});

app.use(express.static("public"));
module.exports = app;