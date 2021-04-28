const mongoose = require('mongoose');
const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    roleId: {
        type: Number,
        required: true
    },
       
    mobileno: {
        type: Number,
        required: true,
        
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});
const LoginSchema = mongoose.model('Login', loginSchema);
module.exports = { Login: LoginSchema};