const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
	const error = new HttpError("Could not locate this route", 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "An unknown error has occurred" });
});

mongoose
	.connect(
		"mongodb+srv://byronjakobharris:CiNngTDXjyd3uSbb@cluster0.ze3cf.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0",
	)
	.then(() => {
		app.listen(5000);
	})
	.catch(() => {
		console.log(err);
	});
