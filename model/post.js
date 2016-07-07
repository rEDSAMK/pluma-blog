var mongoose = require("mongoose");

var tagSchema = mongoose.Schema({
  name: {type: String, required: true}
});

var postSchema = mongoose.Schema({
  title: {type: String, required: true},
  tag: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
  postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
  content: {type: String, required: true},
  date: {type: Date, default: Date.now},
  status: {type: String, required: true},
  banner: {type: String, required: false}
});

mongoose.model('Tag', tagSchema);
mongoose.model('Post', postSchema);
