const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (err) {
		const error = new HttpError("Could not locate requested users", 500);
		return next(error);
	}

	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError("Invalid inputs. Please check your data.", 422),
		);
	}

	const { name, email, password } = req.body;

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

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError(
			"Could not create user. Please try again",
			500,
		);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image: req.file.path.replace(/\\/g, "/"),
		password: hashedPassword,
		places: [],
	});
	console.log(req.file.path.replace(/\\/g, "/"));

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			"Signup failed, please try again later.",
			500,
		);
		return next(error);
	}
	let token;
	try {
		token = jwt.sign(
			{ userId: createdUser.id, email: createdUser.email },
			"supersecret_dont_share",
			{ expiresIn: "1h" },
		);
	} catch (err) {
		const error = new HttpError("Could not validate session token", 500);
		return next(error);
	}

	res.status(201).json({
		user: createdUser.id,
		email: createdUser.email,
		token: token,
	});
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

	if (!existingUser) {
		return next(
			new HttpError("Invalid credentials, could not log you in.", 401),
		);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password);
	} catch (err) {
		const error = new HttpError(
			"Could not validate your credentials. Please try again.",
		);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError(
			"Could not validate your credentials. Please try again.",
		);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			"supersecret_dont_share",
			{ expiresIn: "1h" },
		);
	} catch (err) {
		const error = new HttpError("Could not validate session token", 500);
		return next(error);
	}

	res.json({
		userId: existingUser.id,
		email: existingUser.email,
		token: token,
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
