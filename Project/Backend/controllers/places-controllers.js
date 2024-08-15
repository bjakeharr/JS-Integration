const { validationResult } = require("express-validator");

const mongoose = require("mongoose");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

const getPlaceById = async (req, res, next) => {
	const placeId = req.params.pid;

	let place = "";
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError("Could not locate based off of id", 404);
		return next(error);
	}
	if (!place) {
		const error = new HttpError(
			"Could not find a place for the provided id.",
			404,
		);
		return next(error);
	}

	res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;
	// let places;
	let userWithPlaces;
	try {
		userWithPlaces = await User.findById(userId).populate("places");
	} catch (err) {
		const error = new HttpError("Unable to locate by user Id.", 500);
		return next(error);
	}

	//if(!places || places.length===0) {}
	if (!userWithPlaces || userWithPlaces.places.length === 0) {
		return next(
			new HttpError("Could not find places for the provided id.", 404),
		);
	}
	res.json({
		places: userWithPlaces.places.map((place) =>
			place.toObject({ getters: true }),
		),
	});
};

const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs. Please check your data.", 422),
		);
	}
	const { title, description, address, creator } = req.body;

	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}
	const createdPlace = new Place({
		title,
		description,
		address,
		location: coordinates,
		image: "https://www.esbnyc.com/sites/default/files/2020-01/ESB%20Day.jpg",
		creator,
	});

	let user;

	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError(
			"Creationg place failed please try again.",
			500,
		);
		return next(error);
	}
	if (!user) {
		const error = new HttpError(
			"Could not locate user for provided id.",
			404,
		);
		return next(error);
	}
	console.log(user);

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdPlace.save({ session: sess });
		user.places.push(createdPlace);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError("Place creation failed", 500);
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

const updatePlaceById = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs. Please check your data.", 422),
		);
	}
	const { title, description } = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong. Could not update place",
			500,
		);
		return next(error);
	}

	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError(
			"Something went wrong when updating place",
			500,
		);
		return next(error);
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;
	let place;
	try {
		place = await Place.findById(placeId).populate("creator");
	} catch (err) {
		const error = new HttpError("Unable to delete requested place", 500);
		return next(error);
	}

	if (!place) {
		const error = new HttpError(
			"Could not find place associated with provided id.",
			404,
		);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.deleteOne({ session: sess });
		place.creator.places.pull(place);
		await place.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError("Unable to delete requested place", 500);
		return next(error);
	}
	res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
