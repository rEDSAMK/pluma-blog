/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var mongoose = require("mongoose");

var userSchema = mongoose.Schema({
  name: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  role: {type: String, required: true},
  github: {type: String, required: false},
  twitter: {type: String, required: false},
  facebook: {type: String, required: false},
  description: {type: String, required: false},
  avatar: {type: String, required: false, default:"default.png"}
});

mongoose.model('User', userSchema);
