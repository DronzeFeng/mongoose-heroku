const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema(
  {
    name: String,
    price: {
      type: Number,
      required: [true, '價格必填'],
      cast: false, // 禁止自動轉型別
    },
    rating: Number,
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    versionKey: false,
  }
);
// 當寫入mongodb時，會強制轉小寫，字尾強制加上 s
const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
