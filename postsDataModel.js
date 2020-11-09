const mongoose = require('mongoose');

const PostsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  }
});

const PostsM = mongoose.model('PostsM', PostsSchema)

module.exports = { PostsM };
