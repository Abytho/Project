// Importing necessary packages
const mongoose = require('mongoose'); // Mongoose is used to access db.


// Creating Schema. ie. fields that are used in db.
const cartSchema = mongoose.Schema({
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    loginID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
   
});

// Exporting
const CartSchema = mongoose.model('Cart', cartSchema); // creating model using ProductSchema
module.exports = { Cart: CartSchema } // Exporting ProductSchema