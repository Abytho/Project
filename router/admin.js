// Importing necessary packages
const router = require('express').Router(); // router handles each redirections.
const multer = require('multer'); // multer is used to handle image or file uploads.
const fs = require('fs'); // fs is used to acces file system.

// Importing necessary models.
const { Login } = require('../models/registration');
const { Product } = require('../models/addproduct');
const { Contact } = require('../models/contact');
const { Order, Address, Booking } = require('../models/booking');
const { type } = require('os');
// Configuring multer or middleware of multer.
// Creating multer storage
const multerStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/uploads');
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split('/')[1];
        const filename = file.originalname.split('.')[0];
        callback(null, `product-${filename}-${Date.now()}.${ext}`)
    }
});
// Creating upload handler.
const upload = multer({
    storage: multerStorage,
    dest: 'public/uploads'
});
// creating multer middleware.
const uploadPhoto = upload.single('image');

// GET endpoint. showing admin/dashboard.ejs file.
router.get('/', async (req, res) => {
    if (!req.session.userid) {
        return res.redirect('/login');
    }
    const products = await Product.find({}).sort({_id: -1});
    const contacts = await Contact.find({}).sort({_id: -1});
    const outofstocks = await Product.find({ quantity: 0 }); 
    const orderData = await Order.find({}).sort({ _id: -1 }).populate('orderid productid addressid');
    const login = await Login.find({}).sort({_id: -1});
    res.render('admin', {products: products, contacts: contacts, outofstocks: outofstocks, orderData: orderData, login: login}); 
})

// GET endpoint. showing admin/add product.ejs file.

router.post('/add', uploadPhoto, async (req, res) => {
   // if(!req.session.userid) {
   //     return res.redirect('/login');
   // }
    const productdata = new Product({    // adding data to Login model objects
        productname: req.body.prdname,
        price: req.body.price,
        quantity: req.body.Quantity,
        category: req.body.category,
        image: req.file.filename
    });
    await productdata.save(); // saving data to databse
    const products = await Product.find({}).sort({_id: -1});
    res.redirect('/admin'); // after saving. redirecting add product page
})

router.get('/order/:id', async (req, res) => {
    if (!req.session.userid) {
        return res.redirect('/login');
    }
    const productData = await Booking.find({ orderid: req.params.id }).populate('orderid productid addressid')
    res.render('admindetaile', { orderdata: productData })
})

router.get('/deleteproduct/:id', async (req,res) => {
    const oldData = await Product.findById({_id: req.params.id});
    fs.unlink(`public/uploads/${oldData.image}`, async (err) => {
        if(err) {
            console.log(err);
        } else {
            const deletedData = await Product.findByIdAndDelete({_id: req.params.id});
        }
    })
    res.redirect('/admin'); // after deleting. redirecting view product page
});


router.get('/updateproduct/:id', async (req, res) => {
    if(!req.session.userid) {
        return res.redirect('/login');
    }
    const products = await Product.findById({_id: req.params.id});
    res.render('update', {product: products}); // rendering updateproduct page
})


router.post('/updateproduct/:id', uploadPhoto, async (req, res) => {
    if(!req.session.userid) {
        return res.redirect('/login');
    }
    const oldData = await Product.findById({_id: req.params.id});
    fs.unlink(`public/uploads/${oldData.image}`, async (err) => {
        if(err) {
            console.log(err);
        } else {
            const updatedData = await Product.findByIdAndUpdate({_id: req.params.id}, {productname: req.body.productname,category:req.body.category, price: req.body.price, quantity: req.body.quantity, image: req.file.filename});
        }
    })
    res.redirect('/admin'); // after updating. redirecting view product page
})


router.post('/updatequantity/:id', async (req, res) => {
    
    const updatedData = await Product.findByIdAndUpdate({ _id: req.params.id }, { quantity: req.body.quantity });
    res.redirect('/admin'); // redirecting /admin/outofstock file
})
router.post('/delivered/:id',async(req,res)=>{
    if (!req.session.userid) {
        return res.redirect('/login');
    }
    const updateprod = await Booking.findByIdAndUpdate({_id:req.params.id},{status:true})
    res.redirect("/admin");

})

router.get('/logout', async (req, res) => {
    if(req.session.userid) {
        req.session.destroy((err) => {
            if (err) {
                return console.log(err);
            }
            res.redirect('/login');
        });
    } 
})





module.exports = router;
