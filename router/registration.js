const router = require('express').Router();
const bcryptjs = require('bcryptjs')
const { Login } = require('../models/registration');
const verifyLogin=(req,res,next)=>{
    if(req.session.loggedIn){
      next()
    }else{
      res.redirect('/login')
    }
  }

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

   
   
});
router.post('/login', async (req, res) => {
    const usernameExist = await Login.findOne({username: req.body.name}); // finding whether the username exist or not.
    if(usernameExist) {
        if(usernameExist.password == req.body.password) {
            if(usernameExist.roleId == 2) {
                req.session.userid = usernameExist._id;
                     res.render('admin');
            } else {
                req.session.loggedIn=true
                req.session.logins=response.logins
                let user=req.session.logins
               return res.render('index',{ user });
            }
        } else {
            req.session.loginErr=true
           return res.render('login', {error: "Incorrect Password!"});
        }
    } else {
       return res.render('login', {error: "incorrect Username!"});
    }
    res.render('login'); // rendering login page
})

module.exports = router;