// Importing necessary packages
const mongoose = require('mongoose'); // Mongoose is used to access db.


// Creating Schema. ie. fields that are used in db.
const orderSchema = mongoose.Schema({
    loginID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Login',
        required: true
    },
    totalamount: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});



//Creating address Schema
const addressSchema = mongoose.Schema({
    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    loginID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    }
});


// Creating booking schema
const bookingSchema = new mongoose.Schema({
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    orderid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    addressid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    loginID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Login',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    isCancelled: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: Boolean,
        default: false,
        required: true
    }
})


// Exporting
const OrderSchema = mongoose.model('Order', orderSchema);
const AddressSchema = mongoose.model('Address', addressSchema);
const BookingSchema = mongoose.model('Booking', bookingSchema);

module.exports = { Order: OrderSchema, Address: AddressSchema, Booking: BookingSchema }; // Exporting ProductSchema

