/*jshint esversion: 6 */
let api = (function(){
    "use strict";

    if (!localStorage.getItem('locData')){
        localStorage.setItem('locData', JSON.stringify({curr_user: "null", seed: "null"}));
    }

    // Used for big data types like photos and videos
    function sendFiles(method, url, data, callback){
        let formdata = new FormData();
        Object.keys(data).forEach(function(key){
            let value = data[key];
            formdata.append(key, value);
        });
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

    // Used for small data types
    function send(method, url, data, callback){
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    let module = {};  
    let errorListeners = [];
    let userObservingListeners = [];
    let usernameListeners = [];
    let followerListeners = [];
    let seedListeners = [];
    let treeListeners = [];

    // get all users
    let getUsers = function(callback){
        send("GET", "/api/users/", null, callback);
    };

    // notify all users
    function notifyObservingUserListeners(){
        userObservingListeners.forEach(function(listener){
            listener([]);
        });
    }

    // notify all followers
    module.notifyFollowerListeners = function(username){
        api.getFollowers(username, function(err, followers){
            if (err) return api.notifyErrorListeners(err);
            followerListeners.forEach(function(listener){
                listener(followers);
            });
        });
    };

    // notify all seeds for a user
    module.notifySeedListeners = function(username){
        api.getSeeds(username, function(err, seeds){
            if (err) return api.notifyErrorListeners(err);
            seedListeners.forEach(function(listener){
                listener(seeds);
            });
        });
    };

    // notify a tree for a seed
    module.notifyTreeListeners = function(){
        api.getTree(api.getObservingSeed(), function(err, tree){
            if (err) return api.notifyErrorListeners(err);
            treeListeners.forEach(function(listener){
                listener(tree);
            });
        });
    };

    // notify a user
    function notifyUsernameListeners(username){
        usernameListeners.forEach(function(listener){
            listener(username);
        });
    }

    // when a tree is updated
    module.onTreeUpdate = function(listener){
        treeListeners.push(listener);
        api.getTree(api.getObservingSeed(), function(err, capsules){
            if (err) return notifyErrorListeners(err);
            listener(capsules);
        });
    };

    // when a user is updated
    module.onUsernameUpdate = function(listener){
        usernameListeners.push(listener);
        listener(getUsername());
    };

    module.onObservingUserUpdate = function(listener){
        userObservingListeners.push(listener);
        listener(api.getObservingUser());
    };

    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    module.onError = function(listener){
        errorListeners.push(listener);
    };

    // call handler when a follower is added or deleted to a user
    module.onFollowerUpdate = function(handler){
        followerListeners.push(handler);
        api.getFollowers(api.getObservingUser(), function(err, followers){
            if (err) return notifyErrorListeners(err);
            handler(followers);
        });
    };

    // call handler when a seed is added or deleted to for a user
    module.onSeedUpdate = function(handler){
        seedListeners.push(handler);
        api.getSeeds(api.getObservingUser(), function(err, seeds){
            if (err) return notifyErrorListeners(err);
            handler(seeds);
        });
    };
    
    let getUsername = function(){
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };

    // Get the tree
    module.getTree = function(seed, callback) {
        send("GET", "/api/" + seed + "/capsule/", null, callback);
    };

    // Add a new tree
    module.addSeed = function(title, date, owner, caption) {
        send("POST", "/api/" + owner + "/seeds/", {title, date, caption}, function(err, res){
            if (err) return notifyErrorListeners(err);
            api.notifySeedListeners(api.getObservingUser());
        });
    };

    // Add a data type capsule that stores the trees information
    module.addCapsule = function(caption, date, picture, seed) {
        sendFiles("POST", "/api/seed/?seed=" + seed, {caption: caption, date: date, picture: picture}, function(err, res){
            if (err) return notifyErrorListeners(err);
            api.notifyTreeListeners();
        });
    };
    
    // user signs up
    module.signup = function(username, password, profilePic){
        sendFiles("POST", "/signup/", {username: username, password: password, picture: profilePic}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyUsernameListeners(getUsername());
        });
    };
    
    // user signs in
    module.signin = function(username, password){
        send("POST", "/signin/", {username, password}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyUsernameListeners(getUsername());
        });
    };

    // Get the user
    module.getUser = function(username, callback){
        send("GET", "/api/user/?username=" + username, null, callback);
    };

    // Add a follower
    module.addFollower = function(username, follower, callback){
        send("POST", "/api/" + username + "/followers/", {follower : follower}, function(err, res) {
            if (err) return notifyErrorListeners(err);
            notifyFollowerListeners(username);
        }); 
    };

    // These 3 get functions gets the followers, the trees, and the titles

    module.getFollowers = function(username, callback) {
        send("GET", "/api/" + username + "/followers/", null, callback);
    };

    module.getSeeds = function(username, callback) {
        send("GET", "/api/" + username + "/seeds/", null, callback);
    };

    module.getSeedTitle = function(seedId, callback) {
        send("GET", "/api/seeds/title/?seed=" + seedId, null, callback);
    };

    // delete an image from the gallery given its imageId
    module.delTimeline = function(timelineId){
        send("DELETE", "/api/seeds/?seed=" + timelineId, null, function(err, res){
            if (err) return api.notifyErrorListeners(err);
            api.notifySeedListeners(api.getObservingUser());
       });
    };


    // functions for local properties
    module.getObservingUser = function() {
        let locData = JSON.parse(localStorage.getItem('locData'));
        return locData.curr_user;
    };

    module.getObservingSeed = function() {
        let locData = JSON.parse(localStorage.getItem('locData'));
        return locData.seed;
    };

    module.setObservingUser = function(username, callback) {
        let locData = JSON.parse(localStorage.getItem('locData'));
        locData.curr_user = 
        localStorage.setItem('locData', JSON.stringify(locData));
        return callback();
    };

    module.setObservingSeed = function(seed, callback) {
        let locData = JSON.parse(localStorage.getItem('locData'));
        locData.seed = seed;
        localStorage.setItem('locData', JSON.stringify(locData));
        return callback();
    };

    return module;
})();
