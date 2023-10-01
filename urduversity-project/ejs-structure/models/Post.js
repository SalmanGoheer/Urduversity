const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  fileToUpload: String,
  category: String, // Add this field
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
