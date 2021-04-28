const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
    uname: {
        type: String,
        required: true,
        
    },
    email: {
        type: String,
        required: true,
        
    },
    roleId: {
        type: Number,
        required: true
    },
    subject: {
        type: String,
        required: true,
        
    },
    message: {
        type: String,
        required: true,
        
    },
    response: {
        type: String,
        required: true,
        
    },

});
const ContactSchema = mongoose.model('Contact', contactSchema);
module.exports = { Contact: ContactSchema};