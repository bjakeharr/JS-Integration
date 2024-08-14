const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
let DUMMY_PLACES = [
	{
		id: "p1",
		title: "Empire State Building",
		description: "Really really tall.",
		location: { lat: 40.7484, lng: 73.9857 },
		address: "20 W 34th St., New York, NY 10001",
		creator: "u1",
	},
];

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
	let places;
	try {
		places = await Place.find({ creator: userId });
	} catch (err) {
		const error = new HttpError("Unable to locate by user Id.", 500);
		return next(error);
	}

	if (!places || places.length === 0) {
		return next(
			new HttpError("Could not find places for the provided id.", 404),
		);
	}
	res.json({
		places: places.map((place) => place.toObject({ getters: true })),
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

	try {
		await createdPlace.save();
	} catch (err) {
		const error = new HttpError("Place creation failed", 500);
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

const updatePlaceById = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError("Invalid inputs. Please check your data.", 422);
	}
	const { title, description } = req.body;
	const placeId = req.params.pid;

	const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
	const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
	updatedPlace.title = title;
	updatedPlace.description = description;

	DUMMY_PLACES[placeIndex] = updatedPlace;

	res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
	const placeId = req.params.pid;
	if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
		throw new HttpError("COuld not locate place using provided id", 404);
	}
	DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
	res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
