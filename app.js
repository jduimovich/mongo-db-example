var express            = require("express"),
 app                   = express(),
 mongoose              = require("mongoose"),
 bodyParser            = require('body-parser'),
 User                  = require("./models/user"),
 passport              = require("passport"),
 LocalStrategy         = require("passport-local"),
 passportLocalMongoose = require("passport-local-mongoose");

//mongoose.connect("mongodb://mongo:27018/Samp_data");
 mongoose.connect("mongodb://localhost:27017/Samp_data");
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//app.use(express.static('public'));
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "AppStudio User Demo",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
})


app.get("/" ,function(req, res) {
    res.render("home");
})
app.get("/main",isLoggedIn, function(req, res){
    res.render("main")
})



app.get("/register", (req,res) => res.render("register")); 

app.post("/register", (req,res)=> {
     req.body.username
     req.body.password
  
      User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/login");
        });     
     });
 });

//LOGIN ROUTES
//render login form
 app.get("/login", function(req,res){
     res.render("login");
 });
 //login logic 
 //middleware logic
 app.post("/login", passport.authenticate("local",{
        successRedirect:"/main",
        failureRedirect:"/register" }), 
        function(req,res){      


 });

 app.get("/logout", function(req, res){
     req.logout();
     res.redirect("/login");
 });
  
 function isLoggedIn(req, res,next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login")
 }


// Local-login-port;
app.listen(8080, function() {
    console.log("Server started on 8080")
})
   
