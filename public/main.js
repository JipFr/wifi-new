
let days = {}
let all = {}

function get_date_str(date) {
	return `${date.getDate().toString().padStart(2, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getFullYear()}`;
}

async function main() {
	let d = await fetch("/data/");
	d = await d.json();
	console.log(d);
	all = d;

	Object.entries(d).forEach(entry => {
		let id = entry[0];
		if(id == "names") return;

		entry[1].forEach(time => {
			let date_str = get_date_str(new Date(time));
			if(!days[date_str]) {
				days[date_str] = {}
			}
			if(!days[date_str][id]) {
				days[date_str][id] = []
			}
			days[date_str][id].push(time);
		});

	});

	[...document.querySelector(".days").children].forEach(child => child.remove());

	let mapped_times = {}
	let days_order = Object.keys(days).reverse();
	days_order.forEach(key => {
		console.log("-".repeat(15))
		let date_str = key;
		let macs = days[date_str];
		Object.entries(macs).forEach(entry => {
			let mac = entry[0];
			let times = entry[1];

			let times_mapped = [];
			let last_time = 0;
			let start_time = get_time(new Date(times[0]));
			let end_time;
			times.forEach((time, index) => {

				let next_time = times[index + 1];
				let add = false;
				if((next_time && next_time - time > 1e3 * 60 * 10) || !next_time) {
					add = true;
				}

				if(add) {
					end_time = get_time(new Date(time));
					times_mapped.push(`${start_time} ${end_time}`);
					start_time = get_time(new Date(next_time));
				}

			});

			if(times_mapped.length == 0) {
				times_mapped = [`${start_time} ${get_time(new Date(times[times.length - 1]))}`];
			}
			// console.log(times_mapped, entry[0]);
			days[date_str][mac] = times_mapped;

		});
	});

	render();

}

function get_time(date) {
	return `${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}`
}

function extract_date(str) {
	str = str.split("-");
	let day = str[0];
	let month = str[1];
	let year = str[2];
	return new Date(`${month} ${day} ${year}`);
}
function get_time_obj(str) {
	str = str.split(":");
	return {
		hour: Number(str[0]),
		minute: Number(str[1])
	}
}


function render() {
	Object.keys(days).reverse().forEach(date_str => {
		let date = extract_date(date_str);

		let content = document.querySelector("template.day").content;
		let day_el = document.importNode(content, true);

		day_el.querySelector(".title").innerHTML = date_str;

		let value = days[date_str];
		Object.entries(value).forEach(entry => {
			let device_name = entry[0];
			let device_times = entry[1];

			let content = document.querySelector("template.member_row").content;
			let row = document.importNode(content, true);

			row.querySelector(".device_name").innerHTML = device_name.replace(/-/g, " ");

			console.log(device_times);

			let mapped_times = device_times.map(str => {
				str = str.split(" ");
				let obj_0 = get_time_obj(str[0]);
				let obj_1 = get_time_obj(str[1]);

				let into_day_start = (obj_0.hour * 60) + obj_0.minute;
				let into_day_end = (obj_1.hour * 60) + obj_1.minute;

				let total_day_minutes = 24 * 60;

				let day_start_percentage = (into_day_start / total_day_minutes) * 100;
				let day_end_percentage = (into_day_end / total_day_minutes) * 100;
				let width = day_end_percentage - day_start_percentage;

				let div = document.createElement("div");
				div.classList.add("time");
				div.style.left = day_start_percentage + "%";
				div.style.width = width + "%";

				row.querySelector(".member_timeline").appendChild(div);

				console.log(day_start_percentage, day_end_percentage);

			});

			day_el.querySelector(".day_content").appendChild(row);

		});

			let day_progress = document.createElement("div");
			day_progress.classList.add("day_progress", "line");

			let into_day = (new Date().getHours() * 60) + new Date().getMinutes();

			let total_day_minutes = 24 * 60;

			let day_current_percentage = (into_day / total_day_minutes) * 100;
				
			day_progress.style.left = `calc(${day_current_percentage}%)`;
			day_progress.style.background = "yellow";
			day_progress.style.opacity = 1;
			day_el.querySelector(".member_right").insertBefore(day_progress, day_el.querySelector(".member_right").children[0]);


		document.querySelector(".days").appendChild(day_el);
		update_lines();

	});
}

function update_lines() {
	document.querySelectorAll(".line").forEach(el => {
		el.style.height = (el.closest(".day_content").scrollHeight - 30) + "px";
	});
}







main();
setInterval(() => {
	
	all = {};
	days = {};
	main();

}, 60e3);