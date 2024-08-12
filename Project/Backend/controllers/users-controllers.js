const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
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

const signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		throw new HttpError("Invalid inputs. Please check your data.", 422);
	}
	const { name, email, password } = req.body;
	const hasUser = DUMMY_USERS.find((u) => u.email === email);
	if (hasUser) {
		throw new HttpError(
			"Unable to create new user. Email already exists",
			422,
		);
	}
	const createdUser = {
		id: uuidv4(),
		name,
		email,
		password,
	};
	DUMMY_USERS.push(createdUser);

	res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
	const { email, password } = req.body;

	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError("Could not identify valid user", 401);
	}

	res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;