// Importing necessary packages
const mongoose = require('mongoose'); // Mongoose is used to access db.


// Creating Schema. ie. fields that are used in db.
const productSchema = mongoose.Schema({
    productname: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category:{
        type:String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

// Exporting
const ProductSchema = mongoose.model('Product', productSchema); // creating model using ProductSchema
module.exports = { Product: ProductSchema} // Exporting ProductSchema