const fetch = require("node-fetch");

const FormData = require("form-data");
const sha256 = require("js-sha256");

const xml2js = require("xml2js");

const get = async () => {

	let ts = Date.now();

	//  Config
	const tokenUrl = `http://${process.env.adress}/function_module/login_module/login_page/logintoken_lua.lua?_=${ts}`;
	const loginUrl = `http://${process.env.adress}/`;
	const dataUrl = `http://${process.env.adress}/common_page/home_AssociateDevs_lua.lua?AccessMode=WLAN&_=${ts}` 
	const mainUrl = `http://${process.env.adress}/`;


	// Get token to sign the password with
	let tokenReq = await fetch(tokenUrl);
	let xml = await tokenReq.text();
	let token = xml.match(/\d+/)[0];

	let hashed = sha256(process.env.pwd + token);
	
	// Generate form & get SID
	let loginForm = new FormData();
	loginForm.append("Username", "Admin");
	loginForm.append("Password", hashed);
	loginForm.append("action", "login");

	let login = await fetch(loginUrl, {
		"method": "POST",
		"redirect": "manual",
		"body": loginForm,
		"headers": {
			"Cookie": "_TESTCOOKIESUPPORT=1",
		}
	});

	let setCookie = login.headers.raw()["set-cookie"][0];
	let sid = setCookie.match( /SID=(.+)/)[1].split(";")[0];

	// Get data
	let cookie_str = `_TESTCOOKIESUPPORT=1; SID=${sid}`;
	await fetch(mainUrl, { headers: { "Cookie": cookie_str } });

	let dataReq = await fetch(dataUrl + Date.now(), {
		"headers": {
			"Cookie": cookie_str
		}
	});
	let data_xml = await dataReq.text();
	let data = await xml2js.parseStringPromise(data_xml);
	let devices = [];
	
	// Map devices data
	data.ajax_response_xml_root["OBJ_ACCESSDEV_ID"].forEach(obj => {
		let instance = obj.Instance;
		instance.forEach(entry => {
			
			let obj = {}
			let keys = entry.ParaName;
			for(let i = 0; i < keys.length; i++) {
				obj[keys[i]] = entry.ParaValue[i];
			}
			devices.push(obj);

		});
	});

	return devices;

}

module.exports = get;

// 3209 = loginId event

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}