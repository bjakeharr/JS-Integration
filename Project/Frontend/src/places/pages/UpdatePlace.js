import React from "react";
import { useParams } from "react-router-dom";
import "./PlaceForm.css";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";

const DUMMY_PLACES = [
	{
		id: "p1",
		title: "Empire State Building",
		description: "One of the most famous buildings in the world",
		imageUrl:
			"https://en.wikipedia.org/wiki/Empire_State_Building#/media/File:Empire_State_Building_(aerial_view).jpg",
		address: "20 W 34th St., New York, NY 10001",
		location: {
			lat: 40.7484405,
			lng: -73.9878584,
		},
		creator: "u1",
	},
	{
		id: "p2",
		title: "Empire State Building",
		description: "One of the most famous buildings in the world",
		imageUrl:
			"https://en.wikipedia.org/wiki/Empire_State_Building#/media/File:Empire_State_Building_(aerial_view).jpg",
		address: "20 W 34th St., New York, NY 10001",
		location: {
			lat: 40.7484405,
			lng: -73.9878584,
		},
		creator: "u2",
	},
];

const UpdatePlace = () => {
	const placeId = useParams().placeId;

	const identifiedPlace = DUMMY_PLACES.find((p) => p.id === placeId);

	const [formState, inputHandler] = useForm(
		{
			title: identifiedPlace.title,
			isValid: true,
			description: identifiedPlace.description,
		},
		true,
	);

	const placeUpdateSubmitHandler = (event) => event.preventDefault();
	console.log(formState.inputs);
	if (!identifiedPlace) {
		return (
			<div className="center">
				<h2>Could not find place.</h2>
			</div>
		);
	}
	return (
		<form className="place-form" onSubmit={placeUpdateSubmitHandler}>
			<Input
				id="title"
				element="input"
				type="text"
				label="Title"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid title"
				onInput={inputHandler}
				initialValue={formState.inputs.title.value}
				initialValid={formState.inputs.title.isValid}
			/>
			<Input
				id="description"
				element="textarea"
				label="Description"
				validators={[VALIDATOR_MINLENGTH(5)]}
				errorText="Please enter a valid description."
				onInput={inputHandler}
				initialValue={formState.inputs.description.value}
				initialValid={formState.inputs.description.isValid}
			/>
			<Button type="submit">UPDATE PLACE</Button>
		</form>
	);
};

export default UpdatePlace;
