var express = require('express');
var router = express.Router();
const bcryptjs = require('bcryptjs')
const { Login } = require('../models/registration');
const { registration } = require('../models/registration');
const { Product } = require('../models/addproduct');
const { Contact } = require('../models/contact');
const { Cart } = require('../models/cart');
const { Order, Address, Booking } = require('../models/booking');

const stripe = require('stripe')('sk_test_51IUvLcGa6XX6yMQr4N1MnaJ4Yw4fLze7TisCEEX5mpyobh6T1HYi7YJGLfdEWSmGUt3ci75phn8DhFBnronbYJQE00HLNzfoI6')



const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async (req, res) => {
  if (!req.session.userid) {
    return res.render('index');
}
const user = await Login.findById({ _id: req.session.userid })
 
  const products = await Product.find({}).sort({_id: -1});
 

  res.render('index', {products: products,user: user })
});

router.get('/about',  async (req, res) => {
  if (!req.session.userid) {
    return res.render('about');
}
const user = await Login.findById({ _id: req.session.userid })
 
  res.render('about', {user: user })
});

router.get('/contact-us', async (req, res) => {
  if (!req.session.userid) {
    return res.render('contact-us');
}
const user = await Login.findById({ _id: req.session.userid })
 
  res.render('contact-us', {user: user })
});


router.post('/contact-us', async (req, res) => {
  // if(!req.session.userid) {
  //     return res.redirect('/login');
  // }
   const contactdata = new Contact({    // adding data to Login model objects
       uname: req.body.name,
       roleId: 1,
       email: req.body.email,
       subject: req.body.subject,
       message: req.body.message,
       response: '0',
       
   });
   await contactdata.save(); // saving data to databse
   res.redirect('contact-us'); // after saving. redirecting contact page
})



 



router.get('/cart', async (req, res) => {
  let user=req.session.userid
  const cartitems = await Cart.find({ loginID: req.session.userid }).populate('productid');
  const totalPrice = await Cart.find({ loginID: req.session.userid })
  var amount = 0;
  totalPrice.map((obj) => {
      amount = amount + obj.total
  })
  console.log("cartitems")
  res.render('cart', {cart: cartitems, amount: amount, user }); // rendering customer/cart.ejs file
})

router.get('/gallery', async (req, res) => {
  if (!req.session.userid) {
    return res.render('gallery');
}
const user = await Login.findById({ _id: req.session.userid })
 
  const products = await Product.find({}).sort({_id: -1});
 

  res.render('gallery', {products: products,user: user })
});



router.post('/updateqty/:id', async (req, res) => {
  if (!req.session.userid) {
      return res.redirect('/login');
  }
  const cartItems = await Cart.findById({ _id: req.params.id });
  console.log("old qty", cartItems.quantity)
  const productitems = await Product.findById({ _id: cartItems.productid });
  console.log("old remaining qty", productitems.quantity)
  const updateCartQTY = await Cart.findByIdAndUpdate({ _id: req.params.id }, { quantity: req.body.quantity, total: productitems.price * req.body.quantity });
  if (cartItems.quantity > req.body.quantity) {
      const updateProductQTY = await Product.findByIdAndUpdate({ _id: cartItems.productid }, { quantity: productitems.quantity + (cartItems.quantity - req.body.quantity) })
  } else if (cartItems.quantity < req.body.quantity) {
      const updateProductQTY = await Product.findByIdAndUpdate({ _id: cartItems.productid }, { quantity: productitems.quantity - (req.body.quantity - cartItems.quantity) })
  }
  res.redirect('/cart')
});


router.get('/deleteproduct/:id', async (req, res) => {
  if (!req.session.userid) {
      return res.redirect('/')
  }
  const cartItem = await Cart.findById({ _id: req.params.id });
  const deletecart = await Cart.findByIdAndRemove({ _id: req.params.id });
  const productitems = await Product.findById({ _id: cartItem.productid });
  const updateproduct = await Product.findByIdAndUpdate({ _id: cartItem.productid }, { quantity: productitems.quantity + cartItem.quantity })
  res.redirect('/cart')
})




router.get('/checkout', async (req, res) => {
  if (!req.session.userid) {
      return res.redirect('/login');
  }
  const user = await Login.findById({ _id: req.session.userid })
  res.render('checkout', {   user:user })
})



router.post('/checkout', async (req, res) => {
  console.log(req.session.userid)
  const cartDetails = await Cart.find({ loginID: req.session.userid }).populate('productid')
  const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items:cartDetails.map((items) => (
          {
              price_data: {
                  currency: 'inr',
                  product_data: {
                      name: items.productid.productname,
                      images: ['http://www.adventurewildlife.in/wp-content/uploads/2019/06/571962-plants-1.jpg'],
                  },
                  unit_amount: items.productid.price * 100,
              },
              quantity: items.quantity,
          }
      )),
      mode: 'payment',
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel"
  });

  var datetime = new Date();
  var date = datetime.getDate() + '/' + datetime.getMonth() + '/' + datetime.getFullYear();
  if (!req.session.userid) {
      return res.redirect('/login');
  }
  var totalamount = 0;

  cartDetails.map((data) => {
      totalamount += data.total
  })

  // saving order informartion
  const orderSave = new Order({
      loginID: req.session.userid,
      date: date,
      totalamount: totalamount
  })
  const orderData = await orderSave.save();

  // Saving address information
  const addressSave = new Address({
      orderid: orderData._id,
      loginID: orderData.loginID,
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      city: req.body.city
  })
  const addressData = await addressSave.save();

  // Saving product information
  cartDetails.map(async (data) => {
      const bookSave = new Booking({
          productid: data.productid,
          orderid: orderData._id,
          loginID: orderData.loginID,
          addressid: addressData._id,
          quantity: data.quantity,
          amount: data.price,
          isCancelled: false,
          status: false
      })
      await bookSave.save();
  })

  // Removing items from cart
  const removeCart = await Cart.remove({ loginID: req.session.userid });
  res.json({id: session.id});
})

//succes route
router.get('/success', async (req, res) => {
  res.render('success');
})

// error page
router.get('/cancel', async (req, res) => {
  res.render('cancel');
})


router.get('/login',async (req, res) => {
  res.render('login');
 });  


 router.get('/registration', function(req, res, next) {
  res.render('registration', { title: 'Express' });
});



router.post('/registration', async (req, res) => {
  const usernameExists = await Login.findOne({ username: req.body.name });
  const emailExists = await Login.findOne({ email: req.body.email });
  if (usernameExists) {
      return res.status(400).json({ "error": 'Username already exists!' });
  }
  if (emailExists) {
      return res.status(400).json({ "error": 'Email already exists!' });
  }

  const loginobj = new Login({
      username: req.body.name,
      password: req.body.password,
      roleId: 1,
      mobileno: req.body.phone,
      email: req.body.email,
      
  });
  await loginobj.save(); // saving data to databse
  res.render('login');

 
 
})



// POSt endpoint. addtocart
router.get('/addtocart/:id', async (req, res) => {
  // if the user is not logi then it should redirect to /login
  if (!req.session.userid) {
      return res.redirect('/login')
  }
  // otherwise obtain the details of that partcular product id
  const prodDetails = await Product.findById({ _id: req.params.id });
  // chekc whether the product is in cart or not. if it is in cart return with an error
  try {
      const prodincart = await Cart.findOne({ productid: req.params.id,loginID: req.session.userid });
      if (prodincart) {
          return res.redirect('/')
      }
  } catch (err) {
      return res.redirect('/')
  }
  // otherwise save the items to the cart
  const productSave = new Cart({
      productid: req.params.id,
      loginID: req.session.userid,
      quantity: Number(req.body.quantity) || 1,
      price: prodDetails.price * 1,
      total: prodDetails.price
  })
  await productSave.save();
  // removing quantity from the Product model
  const getProduct = await Product.findById({ _id: req.params.id });
  const productUpdate = await Product.findByIdAndUpdate({ _id: req.params.id }, { quantity: getProduct.quantity - productSave.quantity })
  res.redirect('/')
})


router.get('/order', async (req, res) => {
  if (!req.session.userid) {
      return res.redirect('/login');
  }
  const orderData = await Order.find({ loginID: req.session.userid }).sort({ _id: '-1' })
  res.render('vieworder', { order: orderData })
})

// Get endpoint, view detailed order
router.get('/order/:id', async (req, res) => {
  if (!req.session.userid) {
      return res.redirect('/login');
  }
  const productData = await Booking.find({ orderid: req.params.id }).populate('orderid productid addressid')
  res.render('detailedview', { orderdata: productData })
})


router.post('/cancel/:id', async (req, res) => {
  if (!req.session.userid) {
      return res.redirect('/login');
  }
  const productData = await Booking.findById({ _id: req.params.id })
  const products = await Product.findById({ _id: productData.productid })
  const updateProductbook = await Booking.findByIdAndUpdate({ _id: req.params.id }, { isCancelled: true })
  const updateproductData = await Product.findByIdAndUpdate({ _id: productData.productid }, { quantity: products.quantity + productData.quantity });
  res.redirect(`/order/${productData.orderid}`)
})




router.get('/logout',(req,res)=>{
  if(req.session.userid) {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login');
    });
}
})

router.post('/login', async (req, res) => {
  const usernameExists = await Login.findOne({ username: req.body.name }); // finding whether the username exist or not.
  if (usernameExists) {
      if (usernameExists.password == req.body.password) {
          if (usernameExists.roleId == 2) {
              req.session.userid = usernameExists._id;
              res.redirect('/admin');
          } else {
              req.session.userid = usernameExists._id;
              console.log("yes")
              res.redirect('/');
          }
      } else {
          res.render('login', { error: "Incorrect Password!" });
      }
  } else {
      res.render('login', { error: "incorrect Username!" });
  }
  res.render('login'); // rendering login page
})








module.exports = router;