import React, { useRef } from "react";
import "./ImageUpload.css";
import Button from "./Button";

const ImageUpload = (props) => {
	const filePickerRef = useRef();
	const pickedImageHandler = (event) => {
		console.log(event.target);
	};
	const pickImageHandler = () => {
		filePickerRef.current.click();
	};
	return (
		<div className="form-control">
			<input
				ref={filePickerRef}
				type="file"
				id={props.id}
				style={{ display: "none" }}
				accept=".jpeg,.png,.jpg"
				onChange={pickedImageHandler}
			/>
			<div className={`image-upload ${props.center && "center"}`}>
				<div className="image-upload__preview">
					<img src="" alt="Preview" />
				</div>
				<Button type="button" onClick={pickImageHandler}>
					PICK IMAGE
				</Button>
			</div>
		</div>
	);
};

export default ImageUpload;
