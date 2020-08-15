/*jshint esversion: 6 */
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const Datastore = require('nedb');
let users = new Datastore({ filename: 'db/users.db', autoload: true });
let seeds = new Datastore({ filename: 'db/seeds.db', autoload: true, timestampData : true});
let capsules = new Datastore({ filename: 'db/capsules.db', autoload: true });

const cookie = require('cookie');

let multer  = require('multer');
let upload = multer({ dest: path.join(__dirname, './uploads')});

const session = require('express-session');

// Some dataTypes
let User = function user(username, password, file) {
    this._id = username;
    this.hash = password;
    this.date = Date(); // Account creation date
    this.picture = file;
    this.followers = [];
    this.seeds = [];
};

let Capsule = function capsule(seedId, date, text, photo){
    this.tree = seedId;
    this.capsuleDate = date;
    this.text = text;
    this.photo = photo;
}

let Follower = function follower(username, file, followers) {
    this._id = username;
    this.date = Date(); // Account follow date
    this.picture = file;
    this.followers = followers;
};

let Seed = function seed(title, date, owner, caption) {
    this.owner = owner;
    this.plantedDate = date;
    this.date = Date(); // Seed creation date
    this.title = title;
    this.caption = caption
};

app.use(session({
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
}));

app.use(function (req, res, next){
    req.user = ('user' in req.session)? req.session.user : null;
    let username = (req.user)? req.user._id : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    next();
});

app.use(function (req, res, next){
    console.log("HTTP request", req.username, req.method, req.url, req.body);
    next();
});

let isAuthenticated = function(req, res, next) {
    if (!req.user) return res.status(401).end("You are not authenticated");
    next();
};

app.get('/api/user/', function (req, res, next) {
    users.findOne({_id: req.query.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (req.query.username == "null") res.json(req.session.user);
        if (!user) return res.status(404).end("user does not exist");
        return res.json(user);
    });
});

app.post('/signup/', upload.single('picture'), function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    // Check if the file being uploaded is of image type before adding to database
    let acceptedType = "image";
    if (req.file) {
        if ((req.file.mimetype).includes(acceptedType) != true) {
            // remove the img file from the uploads directory
            fs.unlink('./uploads/' + req.file.filename, function(err){
                if (err) return console.log(err);
            });
            return res.status(415).end(" Uploaded file is not an image type");
        }
    }
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("username " + username + " already exists");
        bcrypt.genSalt(10, function(err, salt) {
            if (err) return res.status(500).end(err);
            bcrypt.hash(password, salt, function(err, hash) {
                // insert new user into the database
                let user = new User(username, hash, req.file);
                users.insert(user, function(err){
                    if (err) return res.status(500).end(err);
                    req.session.user = user;
                    // initialize cookie
                    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                        path : '/',
                        maxAge: 60 * 60 * 24 * 7
                    }));
                    return res.json("user " + username + " signed up");
                });
            });
        });
    });
});

app.post('/signin/', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    // retrieve user from the database
    users.findOne({_id: username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user) return res.status(401).end(" Invalid username"); //wrong username
        console.log(user.hash);
        bcrypt.compare(password, user.hash, function(err, valid) {
            if (err) return res.status(500).end(err);
            if (!valid) return res.status(401).end(" Invalid password"); //wrong password
            req.session.user = user;
            // initialize cookie
            res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                path : '/',
                maxAge: 60 * 60 * 24 * 7
            }));
            return res.json("user " + username + " has been signed in");
        });
    });
});

// Add a seed to the database
app.post('/api/:owner/seeds/', isAuthenticated, function (req, res, next) {
    // Get the owner of the seed
    seeds.findOne({_id: req.params.owner}, function(err, user) {
        if (err) return res.status(500).end(err);
        if (req.params.owner === "null") user = req.user;
        if (!user) return res.status(404).end("user:" + req.params.owner + " does not exist");
        if (user._id !== req.user._id) return res.status(404).end("This page belongs to:" + req.params.owner);
        let seed = new Seed(req.body.title, req.body.date, req.user._id, req.body.caption);
        seeds.insert(seed, function(err){
            if (err) return res.status(500).end(err);
            return res.json(seed);
        });
    });
});

// Add a timeCapsule to a tree
app.post('/api/seed/', isAuthenticated, upload.single('picture'), function (req, res, next) {
    // Get the tree for the time capsule
    seeds.findOne({_id: req.query.seed}, function(err, tree) {
        if (err) return res.status(500).end(err);
        if (!tree) return res.status(404).end("seed:" + req.query.seed + " does not exist");

        // Check if the file being uploaded is of image type before adding to database
        let acceptedType = "image";
        if ((req.file.mimetype).includes(acceptedType) != true) {
            // remove the img file from the uploads directory
            fs.unlink('./uploads/' + req.file.filename, function(err){
                if (err) return console.log(err);
            });
            return res.status(415).end(" Uploaded file is not an image type");
        }

        if (tree.owner !== req.user._id) return res.status(404).end("This tree belongs to: " + tree.owner);
        console.log(req.body.date);
        let capsule = new Capsule(req.query.seed, req.body.date, req.body.caption, req.file);
        capsules.insert(capsule, function(err){
            if (err) return res.status(500).end(err);
            return res.json(capsule);
        });
    });
});

// load capsule image data
app.get('/api/:capsule/capsule/capsuleData', function(req, res, next) {
    // Get image from database
    capsules.findOne({_id: req.params.capsule}, function(err, capsule){
        if (err) return res.status(500).end(err);
        if (!capsule) return res.status(404).end("seed id:" + req.params.seed + " does not exist");
        // Decrypt picture data from binary and send back to front
        let pic = capsule.photo;
        res.setHeader('Content-Type', pic.mimetype);
        return res.sendFile(pic.path);
    });
});

// Gets all timecapsules for a tree
app.get('/api/:seed/capsule/', isAuthenticated, function (req, res, next) {
    // Get the tree seed for each time capsule
    capsules.find({tree: req.params.seed}).sort({capsuleDate:-1}).exec(function(err, timeCaps) {
        if (err) return res.status(500).end(err);
        if (!timeCaps) return res.status(404).end("tree does not exist");
        return res.json(timeCaps.reverse());
    });
});

// Get seeds of a user
app.get('/api/:username/seeds/', isAuthenticated, function(req, res, next) {
    let username = req.params.username;
    if (username === "null") username = req.user._id;
    seeds.find({owner: username}).sort({createdAt:-1}).exec(function(err, seeds) {
        if (err) return res.status(500).end(err);
        if (!seeds) return res.status(404).end("user does not exist");
        return res.json(seeds.reverse());
    });
});


// Get the image data of the user
app.get('/api/users/:id/profile/', isAuthenticated, function (req, res, next) {
    // Get image from database
    users.findOne({_id: req.params.id}, function(err, user){
        if (err) return res.status(500).end(err);
        if (req.params.id == "null") user = req.user;
        if (!user) return res.status(404).end("user does not exist");
        // Decrypt picture data from binary and send back to front
        let pic = user.picture;
        res.setHeader('Content-Type', pic.mimetype);
        return res.sendFile(pic.path);
    });
});

// Get specific seed title of a user
app.get('/api/seeds/title/', isAuthenticated, function(req, res, next) {
    seeds.findOne({_id: req.query.seed}, function(err, seed){
        if (err) return res.status(500).end(err);
        if (!seed) return res.status(404).end("seed:" + req.query.seed + " does not exist");
        return res.json(seed);
    })
});

// Get followers of a user
app.get('/api/:username/followers', isAuthenticated, function(req, res, next) {
    users.findOne({_id: req.params.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (req.params.username == "null") res.json("");
        if (!user) return res.status(404).end("user does not exist");
        return res.json(user.followers);
    })
});

// Get seeds of a user
app.get('/api/:username/seeds', isAuthenticated, function(req, res, next) {
    users.findOne({_id: req.params.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (req.params.username == "null") res.json("");
        if (!user) return res.status(404).end("user does not exist");
        return res.json(user.seeds);
    })
});


app.get('/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('username', '', {
          path : '/', 
          maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    res.redirect('/');
});

// Delete the timeline
app.delete('/api/seeds/', isAuthenticated, function (req, res, next) {
    // get image
    seeds.findOne({_id: req.query.seed}, function(err, seed){
        if (err) return res.status(500).end(err);
        if (!seed) return res.status(404).end("image id #" + req.params.id + " does not exist");
        if (seed.owner !== req.user._id) return res.status(401).end(" Forbidden. only user " + seed.owner + " can delete this timeline");
        
        capsules.find({tree: req.query.seed}, function(err, capsuleList){
            capsuleList.forEach(function(capsule){
                // remove the img file from the uploads directory
                fs.unlink('./uploads/' + capsule.photo.filename, function(err){
                    if (err) return console.log(err);
                });
            });
            // remove all capsules associated with this seed
            capsules.remove({tree: seed._id}, { multi: true }, function (err, numRemoved) {
                if (err) return res.status(500).end(err);
            });
        });

        // remove found seed from database
        seeds.remove({ _id: seed._id}, {}, function (err, numRemoved) {
            if (err) return res.status(500).end(err);
        
            return res.json(numRemoved);
        });
    });
});

app.use(express.static('static'));

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});