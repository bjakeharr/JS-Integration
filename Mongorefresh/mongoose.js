const mongoose = require("mongoose");

const Product = require("./models/product");
const url =
	"mongodb+srv://byronjakobharris:CiNngTDXjyd3uSbb@cluster0.ze3cf.mongodb.net/products_test?retryWrites=true&w=majority&appName=Cluster0";

mongoose
	.connect(url)
	.then(() => {
		console.log("connected");
	})
	.catch(() => {
		console.log("connection failed");
	});

const createProduct = async (req, res, next) => {
	const createdProduct = new Product({
		name: req.body.name,
		price: req.body.price,
	});
	const result = await createdProduct.save();

	res.json({ result });
};

const getProducts = async (req, res, next) => {
	const products = await Product.find().exec();
	res.json({ products });
};

exports.createProduct = createProduct;
exports.getProducts = getProducts;
