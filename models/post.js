const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content 未填寫'],
  },
  image: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  name: {
    type: String,
    required: [true, '貼文姓名未填寫'],
  },
  likes: {
    type: Number,
    default: 0,
  },
});
// 當寫入mongodb時，會強制轉小寫，字尾強制加上 s
const Post = mongoose.model('Post', postSchema);
module.exports = Post;
