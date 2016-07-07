/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var authService = require("../services/auth.services.js");
var config = require('../config.json');
var path = require('path');
var nJwt = require('njwt');
var multiparty = require('multiparty');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './app/upload/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        console.log(datetimestamp);
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var storageAvatar = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './app/upload/avatar/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        console.log(datetimestamp);
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
                storage: storage,
                limits: { fileSize: 3145728 }
            });
var uploadAvatar = multer({ //multer settings
                storage: storageAvatar,
                limits: { fileSize: 1145728 }
            });

router.post('/authenticate', authenticateFunction);
router.post('/register', uploadAvatar.single('file'), registerFunction);
router.get('/profile/self', profileFunction);
router.get('/profile', getAllProfilesFunction);
router.put('/profile/admin/:username', updateProfilesFunction);
router.delete('/profile/admin/:username', deleteProfilesFunction);
router.put('/profile/self/', updateUserFunction);
router.get('/profile/public/:username', profileUserFunction);
router.post('/role', roleFunction);
router.post('/post', upload.single('file'), postCheck, postFunction);
router.get('/post/', getAllPostFunction);
router.get('/post/public', getAllPublicPostFunction);
router.get('/post/public/:id', getPublicPostFunction);
router.get('/post/:id', getPostFunction);
router.put('/post/:id', updatePostFunction);
router.delete('/post/:id', deletePostFunction);
router.get('/settings', getSettingsFunction);
router.put('/settings', updateSettingsFunction);
router.get('/admin', function(req, res, next){
  console.log(req.user.role);
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    res.sendFile(path.join(__dirname, '../admin-app', 'admin.html'));
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
});
router.get('/admin/newPost', function(req, res, next){
  console.log(req.user.role);
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    res.sendFile(path.join(__dirname, '../admin-app', 'newPost.html'));
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
});
router.get('/admin/editPost', function(req, res, next){
  console.log(req.user.role);
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    res.sendFile(path.join(__dirname, '../admin-app', 'editPost.html'));
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
});
router.get('/admin/users', function(req, res, next){
  console.log(req.user.role);
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    res.sendFile(path.join(__dirname, '../admin-app', 'users.html'));
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
});



function authenticateFunction(req, res, next){
  authService.getAuth(req.body.username, req.body.password).then(function(token){
    if(token)
      res.json({status: "User logged!", success: true, token: token});
    else
      res.status(401).json({status: "Wrong username or password", success: false});

  }).catch(function(err){
    res.status(400).send(err);
  });
}

function registerFunction(req, res, next){

  authService.getSettings().then(function(settings){

    if(settings.signupEnabled){
      userObj = {
        name: req.body.name,
        username:req.body.username,
        password:req.body.password,
        email:req.body.email,
        github:req.body.github,
        facebook:req.body.facebook,
        twitter:req.body.twitter,
        description:req.body.description,
        avatar: req.file.filename,
        role: "ROLE_USER"
      }

      authService.createUser(userObj).then(function(msg){
        res.send(msg);
      }).catch(function(err){
        res.status(400).send(err);
      });
    }else{
      res.status(401).send("Registration are currently not enabled on this blog");
    }

  }).catch(function(err){
    res.status(400).send(err);
  });
}

function profileFunction(req,  res, next){
  authService.checkRole(req.user.user, "ROLE_USER")
  .then(function(accepted){
    console.log("ROLE ACCEPTED:"+accepted);
    authService.getUserProfile(req.user.user, true).then(function(usr){
      res.json(usr);
    }).catch(function(err){
      res.status(400).send(err);
    });
  }).catch(function(err){
    res.status(403).send("Unauthorized");
  });
}

function getAllProfilesFunction(req,  res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    authService.getAllProfiles().then(function(usrArray){
      res.json(usrArray);
    }).catch(function(err){
      res.status(400).send(err);
    });
  }).catch(function(err){
    res.status(403).send("Unauthorized");
  });
}

function updateProfilesFunction(req,  res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    authService.updateProfiles(req.params.username, req.body).then(function(usr){
      res.json({success: true, status: "User updated!"});
    }).catch(function(err){
      res.status(400).send(err);
    });
  }).catch(function(err){
    res.status(403).send("Unauthorized");
  });
}

function deleteProfilesFunction(req,  res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    authService.deleteProfiles(req.params.username, req.body).then(function(usr){
      res.json({success: true, status: "User deleted!"});
    }).catch(function(err){
      res.status(400).send(err);
    });
  }).catch(function(err){
    res.status(403).send("Unauthorized");
  });
}

function profileUserFunction(req,  res, next){
    authService.getUserProfile(req.params.username, false).then(function(usr){
        res.json(usr);
    }).catch(function(err){
      res.status(400).send(err);
    });
}

function updateUserFunction(req, res, next){
    var userObj = {
      name: req.body.name,
      email:req.body.email,
      github:req.body.github,
      facebook:req.body.facebook,
      twitter:req.body.twitter,
      description:req.body.description,
      oldpassword:req.body.oldpassword,
      newpassword:req.body.newpassword
    };

    console.log("UPDATING "+req.user.user);

    authService.updateUserProfile(req.user.user, userObj).then(function(usr){
      res.json({success: true, data: usr});
    }).catch(function(err){
      res.status(400).send(err);
    });
}

function roleFunction(req, res, next){
  //res.send(authService.checkRole(req.user.user, "ROLE_ADMIN"));
}

function postFunction(req, res, next){
  var postObj = {
    title: req.body.title,
    tags: req.body.tags,
    content: req.body.content,
    status: req.body.status
  }
  authService.newPost(postObj, req.user.user, req.file.filename).then(function(post){
    res.json(post);
  }).catch(function(error){
    res.status(400).send(error);
  });
}

function postCheck(req,res,next){
  if(isEmpty(req.body.title) || isEmpty(req.body.tags) || isEmpty(req.body.content) || isEmpty(req.body.status))
    res.status(400).send("Empty fields");
  else
    next();
}

function getAllPostFunction(req, res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    authService.getAllPost().then(function(posts){
      res.send(posts);
    }).catch(function(error){
      res.status(400).send(error);
    });
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
}

function getAllPublicPostFunction(req, res, next){
  authService.getAllPublicPost().then(function(posts){
    res.send(posts);
  }).catch(function(error){
    res.status(400).send(error);
  });
}

function getPostFunction(req, res, next){

  /*try{
    verifiedJwt = nJwt.verify(req.headers.authorization.split(" ")[1],config.secret);
    isAdmin = authService.checkRole(verifiedJwt.body.role, "ROLE_ADMIN");
  }catch(e){
    isAdmin = false;
  }*/

  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    authService.getPost(req.params.id, true).then(function(post){
      res.json(post);
    }).catch(function(error){
      res.status(400).send(error);
    });
  }).catch(function(err){
    res.status(403).send("Unauthorized");
  });
}

function getPublicPostFunction(req, res, next){
    authService.getPost(req.params.id, false).then(function(post){
      res.json(post);
    }).catch(function(error){
      res.status(400).send(error);
    });
}

function deletePostFunction(req, res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
      authService.deletePost(req.params.id).then(function(post){
        res.json({success: true, status: "Post deleted!"});
      }).catch(function(error){
        res.status(400).send(error);
      });
    }).catch(function(err){
      res.status(403).send("Unauthorized");
    });
}

function updatePostFunction(req, res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    var updateObj = {
      title: req.body.title,
      tags: req.body.tags,
      content: req.body.content,
      status: req.body.status
    }
    authService.updatePost(req.params.id, updateObj).then(function(post){
      res.json(post);
    }).catch(function(error){
      res.status(400).send(error);
    });
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
}

function deletePostFunction(req, res, next){
  authService.checkRole(req.user.user, "ROLE_ADMIN")
  .then(function(accepted){
    authService.deletePost(req.params.id).then(function(post){
      res.json({success: true, status: "Post deleted"});
    }).catch(function(error){
      res.status(400).send(error);
    });
  }).catch(function(err){
    res.status(403).send({status: "Not an admin", success: false});
  });
}

function getSettingsFunction(req, res, next){
  authService.getSettings().then(function(settings){
    res.json({success: true, settings: settings});
  }).catch(function(error){
    res.status(400).send({success: false, data: error});
  });
}


function updateSettingsFunction(req, res, next){
  authService.updateSettings(req.body).then(function(settings){
    res.json({success: true, settings: settings});
  }).catch(function(error){
    res.status(400).send({success: false, data: error});
  });
}


function isEmpty(str){
  if(str == null || str == "")
    return true;
  else
    return false;
}

module.exports = router;
