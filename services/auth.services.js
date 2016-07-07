var mongoose = require('mongoose');
var Q = require('q');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config.json');
var _ = require('lodash');

mongoose.Promise = Promise;

var User = mongoose.model("User");
var Post = mongoose.model("Post");
var Tag = mongoose.model("Tag");
var Settings = mongoose.model("Settings");
var service = {};

service.query = query;
service.getAuth = getAuth;
service.createUser = createUser;
service.getUserProfile = getUserProfile;
service.updateUserProfile = updateUserFunction;
service.getAllProfiles = getAllProfiles;
service.updateProfiles = updateProfiles;
service.deleteProfiles = deleteProfiles;
service.checkRole = checkRole;
service.newPost = newPost;
service.getAllPost = getAllPost;
service.getPost = getPost;
service.updatePost = updatePost;
service.getAllPublicPost = getAllPublicPost;
service.deletePost = deletePost;
service.getSettings = getSettings;
service.updateSettings = updateSettings;

function getAuth(username, password){
  var deffered = Q.defer();

  User.findOne({'username': username}, function(err, usr){
    if(err) deffered.reject(err);

    if(usr && bcrypt.compareSync(password, usr.password))
      deffered.resolve(jwt.sign({user: usr.username, role: usr.role}, config.secret, { expiresIn: config.JWTexpires }));
    else
      deffered.resolve();

  });

  return deffered.promise;

}

function createUser(userObj){
  var deffered = Q.defer();
  var user = new User(userObj);

  User.findOne({'username': userObj.username}, function(err, usr){
    if(err) deffered.reject(err);
    console.log(usr);
    if(usr)
      deffered.reject("User already exist!");
    else
      generate();

  });

  function generate(){
    user.password = bcrypt.hashSync(userObj.password, 10);

    user.save(function(err, user){
      if(err) deffered.reject(err);
      else deffered.resolve("User created");
    });

  }

  return deffered.promise;
}

function getUserProfile(username, completeProfile){
    var deffered = Q.defer();
    User.findOne({'username': username}, function(err, usr){
      if(err) deffered.reject(err);
      if(usr){
        if(completeProfile)
          deffered.resolve(usr);
        else
          deffered.resolve(_.omit(usr.toObject(), ['password', 'role']));
      }
      else
        deffered.reject("User not found!");
    });
    return deffered.promise;
}

function getAllProfiles(){
    var deffered = Q.defer();
    User.find({}, function(err, usr){
      if(err) deffered.reject(err);
      deffered.resolve(usr);
    });
    return deffered.promise;
}

function updateProfiles(username, usrObj){
    var deffered = Q.defer();
    User.findOne({username: username}, function(err, usr){
      if(err) deffered.reject(err);
      if(usr){
        usrObj = _.omit(usrObj, ['username']);
        _.forEach(usrObj, function(value, key) {
          if(usr.toObject().hasOwnProperty(key))
            usr[key] = usrObj[key];
        });
        usr.save(function(err, user){
          if(err) deffered.reject(err);
          else deffered.resolve(user);
        });
      }else {
        deffered.reject("User not found!");
      }
    });
    return deffered.promise;
}

function deleteProfiles(username, usrObj){
    var deffered = Q.defer();
    User.findOne({username: username}, function(err, usr){
      if(err) deffered.reject(err);
      if(usr){
        usr.remove(function(err){
          if(err) deffered.reject(err);
          else deffered.resolve("User deleted");
        });
      }else {
        deffered.reject("User not found!");
      }
    });
    return deffered.promise;
}

function updateUserFunction(username, userObj){
  var deffered = Q.defer();

  User.findOne({'username': username}, function(err, usr){
    if(err) deffered.reject(err);

    if(usr){
      usr.name = userObj.name;
      usr.email = userObj.email;
      usr.github = userObj.github;
      usr.facebook = userObj.facebook;
      usr.twitter = userObj.twitter;
      usr.description = userObj.description;

      if(!isEmpty(userObj.oldpassword) && !isEmpty(userObj.newpassword)){
        if(bcrypt.compareSync(userObj.oldpassword, usr.password)){
          usr.password = bcrypt.hashSync(userObj.newpassword, 10);
        }else {
          deffered.reject("Old password is wrong!");
        }
      }else if(!isEmpty(userObj.oldpassword) && isEmpty(userObj.newpassword) || isEmpty(userObj.oldpassword) && !isEmpty(userObj.newpassword)){
        deffered.reject("Password fields empty!");
      }

      usr.save(function(err, user){
        if(err) deffered.reject(err);
        deffered.resolve(user);
      });
    }else {
      deffered.reject("User not found!");
    }
  });

  return deffered.promise;
}

function query(){
  var def = Q.defer();
  def.resolve("TEST");
  return def;
}

function newPost(postObj, username, filename){
  var deffered = Q.defer();
  User.findOne({'username': username}, function(err, usr){
    if(err) deffered.reject(err);

    tagsArray = new Array();
    postObj.tags.split(",").forEach(function(singleTag){
      var tag = new Tag({name: _.trim(singleTag)});
      tag.save(function(err, stag){
        if(err) deffered.reject(err);
      });
      tagsArray.push(tag._id);
    });

    postDbObj = {
      title: postObj.title,
      tag: tagsArray,
      postedBy: usr._id,
      content: postObj.content,
      status: postObj.status,
      banner: filename
    }

    var post = new Post(postDbObj);
    post.save(function(err, pst){
      if(err) deffered.reject(err);
      else deffered.resolve({status: "Post created!", post: pst});
    });

  });
  return deffered.promise;
}

function getAllPost(){
  var deffered = Q.defer();

  Post.find({}).populate("postedBy").populate("tag").exec(function(err, posts){
    if(err) deffered.reject(err);
    var postObj = Array();
    console.log("ALL POST");
    posts.forEach(function(post){
      postObj.push(post);
    });
    deffered.resolve(postObj);
  });
  return deffered.promise;
}

function getAllPublicPost(){
  var deffered = Q.defer();

  Post.find({status: "published"}).populate("postedBy").populate("tag").exec(function(err, posts){
    if(err) deffered.reject(err);
    var postObj = Array();
    posts.forEach(function(post){
      postObj.push(post);
    });
    deffered.resolve(postObj);
  });
  return deffered.promise;
}

function getPost(id, isAdmin){
    var deffered = Q.defer();
    Post.findOne({_id: id}).populate("postedBy").populate("tag").exec(function(err, post){
      if(err) deffered.reject(err);
      if(post){
        if(post.status != "published" && !isAdmin)
          deffered.reject("You can't access this post");

        deffered.resolve(post);
      }
      else
        deffered.reject("Post not found");
    });
    return deffered.promise;
}

function updatePost(id, updateObj){
  var deffered =  Q.defer();
  var promises = [];

  Post.findOne({_id: id}).populate("postedBy").populate("tag").exec(function(err, post){
    if(err) deffered.reject(err);

    tagsArray = new Array();
    updateObj.tags.split(",").forEach(function(singleTag){
      var tag = {};
      promises.push(Tag.findOne({name: _.trim(singleTag)}, function(err, foundTag){
        var tag = {};
        if(foundTag){
          tag = foundTag;
          console.log("Tag trovata: "+tag.name);
        }
        else {
          tag = new Tag({name: _.trim(singleTag)});
          tag.save(function(err, stag){
            if(err) deffered.reject(err);
          });
          console.log("TAG NUOVA: "+tag.name);
        }
        tagsArray.push(tag._id);
      }));
    });

    Q.all(promises).then(function(err){
      console.log(tagsArray);
      post.title = updateObj.title;
      post.tag = tagsArray;
      post.content = updateObj.content;
      post.status = updateObj.status;

      post.save(function(err, pst){
        if(err) deffered.reject(err);
        else deffered.resolve({status: "Post updated!", post: pst});
      });
    });
  });

  return deffered.promise;
}

function deletePost(id){
  var deffered = Q.defer();
  Post.findOne({_id: id}, function(err, post){
    if(err) deffered.reject(err);
    if(post){
      post.status = "trash";
      post.save(function(err, pst){
        if(err) deffered.reject(err);
          deffered.resolve(post);
      });
    }
    else
      deffered.reject("Post not found");
  });
  return deffered.promise;
}

function getSettings(){
  var deffered = Q.defer();

  Settings.findOne({}, function(err, settings){
    if(err) deffered.reject(err);
    if(settings)
      deffered.resolve(settings);
  });

  return deffered.promise;
}

function updateSettings(setObj){
  var deffered = Q.defer();

  Settings.findOne({}, function(err, settings){
    if(err) deffered.reject(err);
    if(settings){
      _.forEach(setObj, function(value, key) {
        if(settings.toObject().hasOwnProperty(key)){
          settings[key] = setObj[key];
        }
      });
      settings.save(function(err, settings){
        if(err) deffered.reject(err);
        else deffered.resolve(settings);
      });
    }
  });

  return deffered.promise;
}

function checkRole(username, shouldBeRole){
  var deffered = Q.defer();
   User.findOne({username: username}).exec(function(err, user){
    if(err)
      deffered.reject(false);
    else
      if(config["role"][user.role].position <= config["role"][shouldBeRole].position)
        deffered.resolve(true);
      else
        deffered.reject(false);
  });
  return deffered.promise;
}

function isEmpty(str){
  if(str == null || str == "")
    return true;
  else
    return false;
}


module.exports = service;
