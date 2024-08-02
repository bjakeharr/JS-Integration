const fs = require("fs");

const userName = "Jake";

fs.writeFile("user-data.txt", "Name: " + userName, (err) => {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log("FILE WRITTEN");
	}
});
