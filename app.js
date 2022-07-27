var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require('body-parser'),
    User = require("./models/user"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://mongo-service:27017/database");
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

app.get("/", function (req, res) {
    logEvent("home");
    res.render("home");
})
app.get("/main", isLoggedIn, function (req, res) {
    logEvent("main");
    res.render("main", {
        username: res.locals.currentUser.username,
        loggedIn: req.isAuthenticated()
      })
})

app.get("/register", (req, res) => {
    logEvent("register")
    res.render("register")
});

app.post("/register", (req, res) => {
    req.body.username
    req.body.password

    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/login");
        });
    });
});

const logSchema = new mongoose.Schema({
    event: String,
    count: Number,
    time: String
});

const UsageLogs = mongoose.model('UsageLogs', logSchema);
async function saveRecord(record) {
    await record.save();
}
async function logEvent(event) {
    console.log("logEvent: ", event)
    var newrecord = await UsageLogs.findOneAndUpdate(
        { event: event },
        {
            $inc: { count: 1 }
        },
        {
            returnOriginal: false,
            upsert: true
        },
        function (err, doc) {
            if (err) console.log("error on logEvent: " + err)
        }
    )
}

async function returnJSONAccess(res) {
    console.log("returnJSONAccess");
    const records = await UsageLogs.find();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(records, null, 4));
}

app.get("/access", isLoggedIn, function (req, res) {
    returnJSONAccess(res)
});
// a no login version of listing page access
app.get("/a", function (req, res) {
    returnJSONAccess(res)
});

// login pages 
app.get("/login", function (req, res) {
    logEvent("login");
    res.render("login");
});
// on login attempt run this
app.post("/login", passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/register"
}), function (req, res) {
});
app.get("/logout", function (req, res) {
    logEvent("logout");
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login")
}

app.listen(8080, function () {
    console.log("Server started on 8080")
})

