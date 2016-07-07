var mongoose = require("mongoose");

var settingsSchema = mongoose.Schema({
  signupEnabled: {type: Boolean, required: true},
  navBrand: {type: String, required: true},
  about: {type: String, required: true}
});

mongoose.model('Settings', settingsSchema);
