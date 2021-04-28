var express=require("express"); 
var parser=require("body-parser");
var ejs = require("ejs");
var http = require('http');
var fs = require('fs');
require('dotenv').config();
const path = require('path');
const main = require("./router/main");
const adminDashboard = require('./router/admin');
const index = require('./router/index');
const mongoose = require('mongoose'); 
const session = require('express-session');
const app = express();



app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
mongoose.connect('mongodb+srv://Abytho:Abytho@98@cluster0.sx2vb.mongodb.net/supermarket?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log("Connected"));


app.use(express.static(__dirname + "/public/"));




app.use(express.json());
 
app.use(express.static('views')); 
app.use(parser.urlencoded({ 
	extended: false
})); 
app.use('/',main);
app.use('/admin', adminDashboard);



                  
app.listen(3000);

console.log("server listening at port 3000"); 

