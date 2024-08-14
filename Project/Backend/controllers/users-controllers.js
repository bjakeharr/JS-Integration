const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
	{
		id: "u1",
		name: "Max Schwarz",
		email: "test@test.com",
		password: "password",
	},
	{
		id: "u2",
		name: "Steven Strange",
		email: "test2@test.com",
		password: "password",
	},
	{
		id: "u3",
		name: "Bruce Banner",
		email: "test3@test.com",
		password: "password",
	},
];

const getUsers = (req, res, next) => {
	res.status(200).json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs. Please check your data.", 422),
		);
	}
	const { name, email, password, places } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Signup failed. please try again later.",
			500,
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			"User already exists. Please login instead.",
			422,
		);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image: "https://static.wikia.nocookie.net/megamitensei/images/2/28/Phantom_Thieves_Logo.png/revision/latest/scale-to-width-down/250?cb=20170528120634",
		password,
		places,
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			"Signup failed, please try again later.",
			500,
		);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Login failed. please try again later.",
			500,
		);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		return next(
			new HttpError("Invalid credentials, could not log you in.", 401),
		);
	}

	res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
